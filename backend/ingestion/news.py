import requests
import xml.etree.ElementTree as ET

SOURCES = [
    # Google News
    lambda q: f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en",
    # Bing News RSS
    lambda q: f"https://www.bing.com/news/search?q={q}&format=rss",
    # Yahoo Finance RSS
    lambda q: f"https://feeds.finance.yahoo.com/rss/2.0/headline?s={q}&region=US&lang=en-US",
]

SOURCE_NAMES = ["google_news", "bing_news", "yahoo_finance"]

def fetch_news_versions(claim_text):
    query = "+".join(claim_text.split()[:6])
    all_articles = []

    for i, source_fn in enumerate(SOURCES):
        try:
            url = source_fn(query)
            response = requests.get(url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })

            root = ET.fromstring(response.content)
            count = 0

            for item in root.findall(".//item"):
                title = item.findtext("title") or ""
                description = item.findtext("description") or ""
                link = item.findtext("link") or ""
                text = f"{title} {description}".strip()
                if text and len(text) > 20:
                    all_articles.append({
                        "text": text[:500],
                        "url": link,
                        "source": SOURCE_NAMES[i]
                    })
                    count += 1

            print(f"{SOURCE_NAMES[i]}: Found {count} articles")

        except Exception as e:
            print(f"{SOURCE_NAMES[i]} Error: {e}")
            continue

    # Deduplicate by text similarity
    seen = set()
    unique = []
    for a in all_articles:
        key = a["text"][:50]
        if key not in seen:
            seen.add(key)
            unique.append(a)

    print(f"Total unique versions: {len(unique)}")
    return unique[:15]