import pandas as pd
import numpy as np
import re
import nltk
from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# 1. Resource Setup
nltk.download('stopwords')
nltk.download('wordnet')
MODEL_NAME = "nlpaueb/legal-bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)
# yaha tak sab kuch load lr liya h, BERT model + nltk and sentences ko tokenise kr diya h


# 2. Hybrid Pre-processing (NLTK)
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
# txt clean krna -> lowercase, removeing chars lekin numbers preserve rehne chaiye
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
    "specificmodelx technology owned local distributors"
]                         # examples of rigged clauses
template_embeddings = np.vstack([get_embedding(clean_text(t)) for t in bias_templates])

# 5. Incremental Auditor Function
def audit_tenders_hybrid(path):
    df = pd.read_csv(path)

    # Initialize score column if it was dropped
    if 'restrictiveness_score' not in df.columns:
        df['restrictiveness_score'] = np.nan

    # Process ONLY rows with missing scores
    to_audit = df['restrictiveness_score'].isna()
    if not to_audit.any():
        print("No new tenders to audit.")
        return

    print(f"Auditing {to_audit.sum()} new rows...")

    def predict(text):
        cleaned = clean_text(text)
        emb = get_embedding(cleaned)
        raw_sim = np.max(cosine_similarity(emb, template_embeddings))
        # Calibration: Subtract baseline (0.75) to ensure standard clauses stay < 0.8
        calibrated = (raw_sim - 0.75) / (1.0 - 0.75)     # NORMALISATION : MinMax Scaling
        return round(float(np.clip(calibrated, 0, 1)), 4)

    df.loc[to_audit, 'restrictiveness_score'] = df.loc[to_audit, 'requirement_text'].apply(predict)
    
    # Save back to the same file
    df.to_csv(file_path, index=False)
    print("Update Complete.")

file_path = "../data/tender_specifications.csv"
audit_tenders_hybrid(file_path)