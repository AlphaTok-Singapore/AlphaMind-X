const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    await browser.close();
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(3001, () => console.log('Puppeteer server running'));
