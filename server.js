const express = require('express');
const { chromium } = require('playwright');
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to the Walmart Scraper! Use /scrape?q=your+query to scrape products.');
});

app.get('/scrape', async (req, res) => {
  const query = req.query.q || 'laptop';
  const url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });

    // Wait for product items to appear
    await page.waitForSelector('[data-item-id]', { timeout: 10000 });

    // Debug HTML in case it fails
    const html = await page.content();
    console.log('PAGE HTML:', html.slice(0, 2000)); // First 2000 chars

    // Scrape the product data
    const data = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-item-id]');
      return Array.from(items).slice(0, 10).map(item => {
        const title = item.querySelector('[data-automation-id="product-title"], a[data-type="itemTitles"]')?.innerText.trim() || '';
        const price = item.querySelector('[data-automation-id="product-price"], span[class*="price"]')?.innerText.trim() || '';
        return { title, price };
      });
    });

    console.log('Scraped data:', data);
    res.json(data);
  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  } finally {
    if (browser) await browser.close();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
