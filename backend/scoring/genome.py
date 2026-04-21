from database import get_claims, get_latest_mutation_score, get_claim_versions

def build_genome():
    claims = get_claims()
    genome = []
    
    for claim in claims:
        claim_id = claim["id"]
        latest_score = get_latest_mutation_score(claim_id)
        versions = get_claim_versions(claim_id)
        
        genome.append({
            "claim_id": claim_id,
            "claim_text": claim["text"],
            "domain": claim["domain"],
            "version_count": len(versions),
            "avg_mutation_rate": latest_score["avg_mutation_rate"] if latest_score else 0.0,
            "velocity": latest_score["velocity"] if latest_score else 0.0,
            "zscore": latest_score["zscore"] if latest_score else 0.0,
            "alert": latest_score["alert"] if latest_score else False,
        })
    
    return genome