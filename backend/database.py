from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_claims():
    response = supabase.table("claims").select("*").execute()
    return response.data

def get_claim_by_id(claim_id):
    response = supabase.table("claims").select("*").eq("id", claim_id).execute()
    return response.data[0] if response.data else None

def insert_claim(text, domain):
    response = supabase.table("claims").insert({
        "text": text,
        "domain": domain
    }).execute()
    return response.data[0] if response.data else None

def insert_claim_version(claim_id, source, source_url, text, mutation_score):
    supabase.table("claim_versions").insert({
        "claim_id": claim_id,
        "source": source,
        "source_url": source_url,
        "text": text,
        "mutation_score": mutation_score
    }).execute()

def get_claim_versions(claim_id):
    response = supabase.table("claim_versions")\
        .select("*")\
        .eq("claim_id", claim_id)\
        .order("created_at", desc=False)\
        .execute()
    return response.data

def insert_mutation_score(claim_id, avg_mutation_rate, velocity, zscore, alert):
    supabase.table("mutation_scores").insert({
        "claim_id": claim_id,
        "avg_mutation_rate": avg_mutation_rate,
        "velocity": velocity,
        "zscore": zscore,
        "alert": alert
    }).execute()

def get_mutation_scores(claim_id):
    response = supabase.table("mutation_scores")\
        .select("*")\
        .eq("claim_id", claim_id)\
        .order("created_at", desc=True)\
        .limit(30)\
        .execute()
    return response.data

def get_latest_mutation_score(claim_id):
    scores = get_mutation_scores(claim_id)
    return scores[0] if scores else None