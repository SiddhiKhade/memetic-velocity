from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_claims, get_claim_versions, get_mutation_scores, insert_claim_version, insert_mutation_score, insert_claim
from ingestion.news import fetch_news_versions
from nlp.embeddings import get_embedding
from nlp.similarity import cosine_distance
from scoring.mutation import compute_mutation_rate, compute_zscore
from scoring.velocity import compute_velocity
from scoring.genome import build_genome
import os

app = FastAPI(title="Memetic Velocity API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    if os.environ.get("RUN_MAIN") != "true":
        from scheduler import start_scheduler
        start_scheduler()
        print("Scheduler: Started successfully")

@app.get("/")
def root():
    return {"message": "Memetic Velocity API is running"}

@app.get("/claims")
def list_claims():
    return get_claims()

@app.get("/genome")
def get_genome():
    return build_genome()

@app.get("/versions/{claim_id}")
def get_versions(claim_id: int):
    return get_claim_versions(claim_id)

@app.get("/scores/{claim_id}")
def get_scores(claim_id: int):
    return get_mutation_scores(claim_id)

@app.post("/run/{claim_id}")
def run_pipeline(claim_id: int):
    claims = get_claims()
    claim = next((c for c in claims if c["id"] == claim_id), None)
    
    if not claim:
        return {"error": "Claim not found"}
    
    original_text = claim["text"]
    
    # Step 1: Fetch news versions
    versions = fetch_news_versions(original_text)
    
    if not versions:
        return {"error": "No versions found"}
    
    # Step 2: Get original embedding
    original_embedding = get_embedding(original_text)
    
    # Step 3: Compute mutation score for each version and store
    for version in versions:
        version_embedding = get_embedding(version["text"])
        if original_embedding is not None and version_embedding is not None:
            distance = cosine_distance(original_embedding, version_embedding)
            mutation = round(distance * 100, 2)
        else:
            mutation = 0.0
        
        insert_claim_version(
            claim_id=claim_id,
            source=version["source"],
            source_url=version["url"],
            text=version["text"],
            mutation_score=mutation
        )
    
    # Step 4: Compute aggregate scores
    avg_mutation = compute_mutation_rate(claim_id, original_text)
    velocity = compute_velocity(claim_id)
    zscore = compute_zscore(claim_id, avg_mutation)
    alert = abs(zscore) > 2.0
    
    insert_mutation_score(
        claim_id=claim_id,
        avg_mutation_rate=avg_mutation,
        velocity=velocity,
        zscore=zscore,
        alert=alert
    )
    
    return {
        "claim_id": claim_id,
        "claim_text": original_text,
        "versions_found": len(versions),
        "avg_mutation_rate": avg_mutation,
        "velocity": velocity,
        "zscore": zscore,
        "alert": alert
    }

@app.post("/run-all")
def run_all():
    claims = get_claims()
    results = []
    for claim in claims:
        result = run_pipeline(claim["id"])
        results.append(result)
    return results

@app.post("/claims/add")
def add_claim(text: str, domain: str):
    claim = insert_claim(text, domain)
    return claim

@app.post("/track")
def track_claim(text: str, domain: str = "Custom"):
    # First insert as a new claim
    new_claim = insert_claim(text, domain)
    if not new_claim:
        return {"error": "Failed to create claim"}
    
    claim_id = new_claim["id"]
    
    # Then run the full pipeline on it
    result = run_pipeline(claim_id)
    return result