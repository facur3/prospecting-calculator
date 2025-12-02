import requests
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}

urls = [
    "https://prospecting.miraheze.org/wiki/Luck",
    "https://prospecting.miraheze.org/wiki/Stats",
    "https://prospecting.miraheze.org/wiki/Rarity"
]

for url in urls:
    print(f"--- Fetching {url} ---")
    try:
        response = requests.get(url, headers=HEADERS)
        text = response.text
        
        # Simple cleanup
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        print(f"Length: {len(text)}")
        
        keywords = ["efficiency", "formula", "tier", "rolls", "capacity", "calculation", "math"]
        found = False
        for kw in keywords:
            if kw in text.lower():
                print(f"Found '{kw}':")
                start = text.lower().find(kw)
                print(text[start-200:start+200])
                print("-" * 20)
                found = True
        
        if not found:
            print("No keywords found. Printing start of text:")
            print(text[:1000])

    except Exception as e:
        print(f"Error: {e}")
    print("\n")
