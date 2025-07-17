app.get('/scrape', async (req, res) => {
  const query = req.query.q || 'laptop';
  const url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Set realistic User-Agent to mimic a real browser
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });

    // Wait a bit more to allow any dynamic content or anti-bot scripts to run
    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-item-id]');
      return Array.from(items).slice(0, 10).map(item => {
        const title = item.querySelector('[data-automation-id="product-title"]')?.innerText || '';
        const price = item.querySelector('[data-automation-id="product-price"]')?.innerText || '';
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
