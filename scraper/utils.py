import time
import random
from hashlib import sha256

def deduplicate(item: dict, seen_keys: set) -> bool:
    """
    Check if item is already seen. If not, record it and return True (keep it).
    If seen before, return False (skip).
    """
    # dedup keys: name+phone or just URL
    key = item.get("url") or f"{item.get('name', '')}-{item.get('phone', '')}"

    # hash the key
    hashed_key = sha256(key.encode('utf-8')).hexdigest()

    if hashed_key in seen_keys:
        return False
    seen_keys.add(hashed_key)
    return True

def respectful_delay(min_seconds=2, max_seconds=3.5):
    """
    Sleep for a random number of seconds between min and max
    """
    delay = random.uniform(min_seconds, max_seconds)
    print(f"Sleeping for {delay:.2f} seconds...")
    time.sleep(delay)
