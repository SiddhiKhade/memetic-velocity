import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# HuggingFace
HF_API_KEY = os.getenv("HF_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Domains to track
DOMAINS = ["Tech & AI", "Financial", "Political", "Health"]

# Mutation alert threshold
MUTATION_ALERT_ZSCORE = 2.0

# HuggingFace embedding model
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_API_URL = f"https://router.huggingface.co/hf-inference/pipeline/feature-extraction/{EMBEDDING_MODEL}"