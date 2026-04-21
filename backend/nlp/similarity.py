import numpy as np

def cosine_similarity(vec1, vec2):
    if vec1 is None or vec2 is None:
        return 0.0
    dot = np.dot(vec1, vec2)
    norm = np.linalg.norm(vec1) * np.linalg.norm(vec2)
    if norm == 0:
        return 0.0
    return float(dot / norm)

def cosine_distance(vec1, vec2):
    return 1.0 - cosine_similarity(vec1, vec2)

def mutation_score(original_text, new_text, get_embedding_fn):
    orig_embedding = get_embedding_fn(original_text)
    new_embedding = get_embedding_fn(new_text)
    distance = cosine_distance(orig_embedding, new_embedding)
    return round(distance * 100, 2)