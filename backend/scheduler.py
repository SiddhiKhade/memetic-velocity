from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import time

scheduler = BackgroundScheduler()

def run_full_pipeline():
    from database import get_claims
    from ingestion.news import fetch_news_versions
    from nlp.embeddings import get_embedding
    from nlp.similarity import cosine_distance
    from scoring.mutation import compute_mutation_rate, compute_zscore
    from scoring.velocity import compute_velocity
    from database import insert_claim_version, insert_mutation_score

    print("Scheduler: Starting automated pipeline run...")
    claims = get_claims()

    for claim in claims:
        try:
            claim_id = claim["id"]
            original_text = claim["text"]

            print(f"Scheduler: Processing '{original_text[:50]}...'")

            versions = fetch_news_versions(original_text)
            original_embedding = get_embedding(original_text)

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

            print(f"Scheduler: Completed '{original_text[:50]}...' - Mutation: {avg_mutation}, Velocity: {velocity}")
            time.sleep(2)

        except Exception as e:
            print(f"Scheduler Error for claim {claim.get('id')}: {e}")
            continue

    print("Scheduler: Pipeline run complete.")

def start_scheduler():
    scheduler.add_job(
        run_full_pipeline,
        trigger=IntervalTrigger(hours=6),
        id="memetic_pipeline",
        name="Run Memetic Velocity pipeline",
        replace_existing=True
    )
    scheduler.start()
    print("Scheduler: Started - pipeline will run every 6 hours.")