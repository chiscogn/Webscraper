const express = require('express');
const { chromium } = require('playwright');
const app = express();

app.get('/scrape', async (req, res) => {
  const query = req.query.q || 'laptop';
  const url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const data = await page.evaluate(() => {
    const items = document.querySelectorAll('[data-item-id]');
    return Array.from(items).slice(0, 10).map(item => {
      const title = item.querySelector('[data-automation-id="product-title"]')?.innerText || '';
      const price = item.querySelector('[data-automation-id="product-price"]')?.innerText || '';
      return { title, price };
    });
  });

  await browser.close();
  res.json(data);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});
