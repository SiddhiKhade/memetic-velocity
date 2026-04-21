from database import get_claim_versions
from datetime import datetime, timezone
import re

def compute_velocity(claim_id):
    versions = get_claim_versions(claim_id)
    
    if not versions:
        return 0.0
    
    now = datetime.now(timezone.utc)
    recent = []
    
    for v in versions:
        try:
            created_str = v["created_at"]
            # Normalize fractional seconds to 6 digits
            created_str = re.sub(
                r'(\.\d+)',
                lambda m: m.group(0).ljust(7, '0')[:7],
                created_str
            )
            created = datetime.fromisoformat(created_str)
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            hours_ago = (now - created).total_seconds() / 3600
            if hours_ago <= 24:
                recent.append(v)
        except Exception as e:
            print(f"Velocity timestamp error: {e}")
            continue
    
    return float(len(recent))