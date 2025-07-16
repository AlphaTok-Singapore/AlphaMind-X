
# 🧠 Puppeteer Scraper Service for n8n

This service enables n8n to extract HTML content from restricted websites like WeChat, Zhihu, X, using headless Chromium.

## ✅ How to Use

1. **Place this folder next to your `docker-compose.yml`**  
2. Add the provided `docker-compose` config under your services  
3. Rebuild:  
```bash
docker-compose build puppeteer
docker-compose up -d puppeteer
```

4. In `n8n` use HTTP Request node:
   - Method: POST
   - URL: `http://puppeteer:3001/scrape`
   - Body (JSON):
```json
{ "url": "https://mp.weixin.qq.com/..." }
```

5. The response will contain:
```json
{ "html": "<html>....</html>" }
```

## 🛠 Ports
- Internal: `3001`
- External: `http://localhost:3001`

Make sure to run n8n and this container in the same `n8n_network`.

