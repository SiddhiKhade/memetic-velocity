import numpy as np
from database import get_claim_versions, insert_mutation_score, get_mutation_scores
from nlp.embeddings import get_embedding
from nlp.similarity import cosine_distance

def compute_mutation_rate(claim_id, original_text):
    versions = get_claim_versions(claim_id)
    
    if not versions:
        return 0.0
    
    original_embedding = get_embedding(original_text)
    if original_embedding is None:
        return 0.0
    
    distances = []
    for version in versions:
        version_embedding = get_embedding(version["text"])
        if version_embedding is not None:
            distance = cosine_distance(original_embedding, version_embedding)
            distances.append(distance * 100)
    
    if not distances:
        return 0.0
    
    return round(float(np.mean(distances)), 2)

def compute_zscore(claim_id, current_mutation):
    historical = get_mutation_scores(claim_id)
    historical_values = [s["avg_mutation_rate"] for s in historical if s["avg_mutation_rate"] is not None]
    
    if len(historical_values) < 3:
        return 0.0
    
    arr = np.array(historical_values)
    mean = np.mean(arr)
    std = np.std(arr)
    
    if std == 0:
        return 0.0
    
    return round(float((current_mutation - mean) / std), 3)