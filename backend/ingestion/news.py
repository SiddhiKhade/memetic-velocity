import requests
import xml.etree.ElementTree as ET

def fetch_news_versions(claim_text):
    try:
        query = "+".join(claim_text.split()[:6])
        url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
        
        response = requests.get(url, timeout=10, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

        root = ET.fromstring(response.content)
        articles = []

        for item in root.findall(".//item"):
            title = item.findtext("title") or ""
            description = item.findtext("description") or ""
            link = item.findtext("link") or ""
            text = f"{title} {description}".strip()
            if text:
                articles.append({"text": text[:500], "url": link, "source": "google_news"})

        print(f"News: Found {len(articles)} versions for '{claim_text[:50]}...'")
        return articles[:10]

    except Exception as e:
        print(f"News Error: {e}")
        return []