import requests
import numpy as np
from config import HF_API_KEY, EMBEDDING_API_URL

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

def get_embedding(text):
    try:
        response = requests.post(
            EMBEDDING_API_URL,
            headers=HEADERS,
            json={"inputs": text[:512]}
        )
        result = response.json()
        if isinstance(result, list):
            return np.array(result[0] if isinstance(result[0], list) else result)
        return None
    except Exception as e:
        print(f"Embedding Error: {e}")
        return None