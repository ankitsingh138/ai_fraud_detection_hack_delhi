import pandas as pd
import numpy as np
import re
import nltk
import sys
import argparse
from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# 1. Resource Setup
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
MODEL_NAME = "nlpaueb/legal-bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
# yaha tak sab kuch load lr liya h, BERT model + nltk and sentences ko tokenise kr diya h


# 2. Hybrid Pre-processing (NLTK)
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    """txt clean krna -> lowercase, removeing chars lekin numbers preserve rehne chaiye"""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    tokens = text.split()
    return " ".join([lemmatizer.lemmatize(w) for w in tokens if w not in stop_words])

# 3. Semantic Embedding (Legal-BERT)
def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)  # model inputs ko tokenise kr rhe h
    with torch.no_grad():
        outputs = model(**inputs)          # model k outputs
    return outputs.last_hidden_state.mean(dim=1).numpy()     # embeding

# 4. Rigged Templates (Fraud Anchors)
bias_templates = [
    "registered within 5km radius project site office",
    "working exactly tribal belts 12.5 years",
    "completed 3 bridges length exceeding 45.7 meters single year",
    "specificmodelx technology owned local distributors",
    "must have experience with specific proprietary technology",
    "office located within exact distance from project site",
    "turnover exceeding specific unusual amount in previous years",
    "must be pre-approved by specific government official"
]                         # examples of rigged clauses
template_embeddings = np.vstack([get_embedding(clean_text(t)) for t in bias_templates])

def predict(text):
    """Calculate restrictiveness score for a single clause"""
    cleaned = clean_text(text)
    if not cleaned:
        return 0.0
    emb = get_embedding(cleaned)
    raw_sim = np.max(cosine_similarity(emb, template_embeddings))
    # Calibration: Subtract baseline (0.75) to ensure standard clauses stay < 0.8
    calibrated = (raw_sim - 0.75) / (1.0 - 0.75)     # NORMALISATION : MinMax Scaling
    return round(float(np.clip(calibrated, 0, 1)), 4)

# 5. Incremental Auditor Function
def audit_tenders_hybrid(file_path, force_reprocess=False):
    """
    Audit tender specifications for restrictive/tailored clauses.
    
    Args:
        file_path: Path to CSV with tender_id and requirement_text columns
        force_reprocess: If True, reprocess all rows even if they have scores
    """
    print(f"Loading data from: {file_path}")
    df = pd.read_csv(file_path)

    # Initialize score column if it was dropped
    if 'restrictiveness_score' not in df.columns:
        df['restrictiveness_score'] = np.nan

    # Process rows based on mode
    if force_reprocess:
        to_audit = pd.Series([True] * len(df))
    else:
        # Process ONLY rows with missing scores (empty or NaN)
        to_audit = df['restrictiveness_score'].isna() | (df['restrictiveness_score'] == '')
    
    if not to_audit.any():
        print("No new tenders to audit.")
        return df

    print(f"Auditing {to_audit.sum()} rows...")

    # Apply prediction to rows needing audit
    df.loc[to_audit, 'restrictiveness_score'] = df.loc[to_audit, 'requirement_text'].apply(predict)
    
    # Save back to the same file
    df.to_csv(file_path, index=False)
    print(f"Update Complete. Saved to {file_path}")
    
    # Print summary
    high_risk = df[df['restrictiveness_score'] >= 0.8]
    print(f"\n=== Summary ===")
    print(f"Total clauses analyzed: {to_audit.sum()}")
    print(f"High-risk clauses (>= 0.8): {len(high_risk)}")
    
    if len(high_risk) > 0:
        print(f"\nHigh-risk tender IDs: {high_risk['tender_id'].unique().tolist()}")
    
    return df

def main():
    parser = argparse.ArgumentParser(description='NLP Tailored Clause Detection')
    parser.add_argument('--file', '-f', type=str, 
                        default='../data/tender_specifications.csv',
                        help='Path to the CSV file with tender specifications')
    parser.add_argument('--force', action='store_true',
                        help='Force reprocess all rows even if they have scores')
    
    args = parser.parse_args()
    
    audit_tenders_hybrid(args.file, force_reprocess=args.force)

if __name__ == "__main__":
    main()