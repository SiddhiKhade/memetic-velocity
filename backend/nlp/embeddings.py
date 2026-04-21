import numpy as np
from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def get_embedding(text):
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text[:512]
        )
        return np.array(response.data[0].embedding)
    except Exception as e:
        print(f"Embedding Error: {e}")
        return None