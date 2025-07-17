const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/scrape', async (req, res) => {
  const query = req.query.q || 'laptop';
  const url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const data = await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('[data-item-id]');

      items.forEach((item) => {
        const title = item.querySelector('span[data-automation-id="product-title"]')?.innerText;
        const price = item.querySelector('span[data-automation-id="product-price"]')?.innerText;
        if (title && price) {
          results.push({ title, price });
        }
      });

      return results.slice(0, 10); // top 10 only
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  } finally {
    await browser.close();
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
