const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.error('BROWSER ERROR:', err.message, err.stack));

  console.log('Navigating to http://localhost:5173/ ...');
  const response = await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  console.log('Status code:', response ? response.status() : 'no response');

  await page.waitForTimeout(3000);

  const html = await page.content();
  console.log('HTML length:', html.length);
  console.log('Body HTML preview:', html.slice(0, 1000));

  await browser.close();
})();
