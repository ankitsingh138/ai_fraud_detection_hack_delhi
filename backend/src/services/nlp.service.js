import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import TenderSpecification from '../models/TenderSpecification.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the NLP model and data directories
// From backend/src/services/ go up 3 levels to project root
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const NLP_MODEL_PATH = path.join(PROJECT_ROOT, 'nlp_model');
const DATA_PATH = path.join(PROJECT_ROOT, 'data');
const TENDER_SPECS_CSV = path.join(DATA_PATH, 'tender_specifications.csv');
const PYTHON_VENV = path.join(NLP_MODEL_PATH, 'venv', 'bin', 'python3');

console.log('NLP Service paths:', { PROJECT_ROOT, NLP_MODEL_PATH, DATA_PATH, PYTHON_VENV });

// Export tender specifications to CSV for NLP analysis
export const exportSpecsToCSV = async () => {
  const specs = await TenderSpecification.find();
  
  if (specs.length === 0) {
    console.log("No specifications to export");
    return false;
  }

  // Build CSV content
  const headers = 'tender_id,requirement_text,is_mandatory,restrictiveness_score\n';
  const rows = specs.map(s => {
    const text = (s.requirementText || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const score = s.restrictiveness_score !== null ? s.restrictiveness_score : '';
    return `"${s.tenderId}","${text}",${s.isMandatory ? 1 : 0},${score}`;
  }).join('\n');

  fs.writeFileSync(TENDER_SPECS_CSV, headers + rows, 'utf8');
  console.log(`✅ Exported ${specs.length} specifications to CSV`);
  return true;
};

// Import updated scores from CSV back to MongoDB
export const importScoresFromCSV = async () => {
  if (!fs.existsSync(TENDER_SPECS_CSV)) {
    console.log("CSV file not found");
    return { updated: 0 };
  }

  const content = fs.readFileSync(TENDER_SPECS_CSV, 'utf8');
  const lines = content.split('\n').slice(1).filter(line => line.trim());
  
  let updated = 0;
  for (const line of lines) {
    // Parse CSV line - handle both quoted and unquoted formats
    // Format: tender_id,requirement_text,is_mandatory,restrictiveness_score
    const parts = line.split(',');
    if (parts.length < 4) continue;

    // First field is tender_id (may or may not be quoted)
    const tenderId = parts[0].replace(/^"|"$/g, '').trim();
    // Last field is the score
    const scoreStr = parts[parts.length - 1].trim();
    const score = parseFloat(scoreStr);
    
    if (tenderId && !isNaN(score)) {
      const result = await TenderSpecification.updateMany(
        { tenderId },
        { $set: { restrictiveness_score: score } }
      );
      if (result.modifiedCount > 0) {
        updated++;
      }
    }
  }

  console.log(`✅ Imported ${updated} scores from CSV`);
  return { updated };
};

// Run the Python NLP model
export const runTailoredClauseAnalysis = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      // First, export current specs to CSV
      const exported = await exportSpecsToCSV();
      if (!exported) {
        return resolve({ 
          success: false, 
          message: "No tender specifications to analyze" 
        });
      }

      const pythonScript = path.join(NLP_MODEL_PATH, 'main.py');
      
      if (!fs.existsSync(pythonScript)) {
        return reject(new Error(`Python script not found: ${pythonScript}`));
      }

      // Use venv Python if available, otherwise fall back to system python
      const pythonCmd = fs.existsSync(PYTHON_VENV) ? PYTHON_VENV : 'python3';
      console.log(`Running NLP analysis: ${pythonCmd} ${pythonScript}`);
      
      // Spawn Python process
      const pythonProcess = spawn(pythonCmd, [pythonScript, '--file', TENDER_SPECS_CSV], {
        cwd: NLP_MODEL_PATH,
        env: { ...process.env, PYTHONPATH: NLP_MODEL_PATH }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('[NLP]:', data.toString().trim());
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('[NLP Error]:', data.toString().trim());
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          // Still try to import any results
        }

        // Import updated scores back to MongoDB
        const importResult = await importScoresFromCSV();

        resolve({
          success: code === 0,
          message: code === 0 ? 'Analysis completed successfully' : 'Analysis completed with warnings',
          specsAnalyzed: importResult.updated,
          output: stdout,
          errors: stderr || null
        });
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Get high-risk clauses from MongoDB
export const getTailoredClauseResults = async (threshold = 0.8) => {
  const highRiskSpecs = await TenderSpecification.find({
    restrictiveness_score: { $gte: threshold }
  }).sort({ restrictiveness_score: -1 });

  return highRiskSpecs.map(s => ({
    tenderId: s.tenderId,
    clauseId: s.clauseId,
    requirementText: s.requirementText,
    score: s.restrictiveness_score,
    isMandatory: s.isMandatory
  }));
};

// Analyze a single tender's specifications (for real-time analysis)
export const analyzeNewTender = async (tenderId) => {
  const specs = await TenderSpecification.find({ tenderId });
  
  if (specs.length === 0) {
    return { tenderId, analyzed: false, message: "No specifications found" };
  }

  // Export just this tender's specs
  const tempCSV = path.join(DATA_PATH, `temp_tender_${tenderId}.csv`);
  const headers = 'tender_id,requirement_text,is_mandatory,restrictiveness_score\n';
  const rows = specs.map(s => {
    const text = (s.requirementText || '').replace(/"/g, '""').replace(/\n/g, ' ');
    return `"${s.tenderId}","${text}",${s.isMandatory ? 1 : 0},`;
  }).join('\n');

  fs.writeFileSync(tempCSV, headers + rows, 'utf8');

  return new Promise((resolve, reject) => {
    const pythonScript = path.join(NLP_MODEL_PATH, 'main.py');
    
    const pythonProcess = spawn('python3', [pythonScript, '--file', tempCSV], {
      cwd: NLP_MODEL_PATH
    });

    pythonProcess.on('close', async (code) => {
      // Read results and update MongoDB
      if (fs.existsSync(tempCSV)) {
        const content = fs.readFileSync(tempCSV, 'utf8');
        const lines = content.split('\n').slice(1).filter(l => l.trim());
        
        for (const line of lines) {
          const match = line.match(/^"([^"]+)","([^"]*)",(\d),(.*)$/);
          if (match && match[4]) {
            const score = parseFloat(match[4]);
            if (!isNaN(score)) {
              await TenderSpecification.updateOne(
                { tenderId, requirementText: match[2].replace(/""/g, '"') },
                { $set: { restrictiveness_score: score } }
              );
            }
          }
        }

        // Clean up temp file
        fs.unlinkSync(tempCSV);
      }

      const updatedSpecs = await TenderSpecification.find({ tenderId });
      resolve({
        tenderId,
        analyzed: true,
        specifications: updatedSpecs.map(s => ({
          clauseId: s.clauseId,
          requirementText: s.requirementText,
          score: s.restrictiveness_score
        }))
      });
    });

    pythonProcess.on('error', reject);
  });
};

