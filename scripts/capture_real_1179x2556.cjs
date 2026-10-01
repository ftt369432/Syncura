const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Capturing 100% REAL live DOM screenshot at exact 1179x2556 resolution...');

  const browser = await chromium.launch({ headless: true });
  // Setting viewport to exact 1179 x 2556
  const context = await browser.newContext({
    viewport: { width: 1179, height: 2556 },
    colorScheme: 'dark',
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click "Try Caregiver Demo" to enter the live dashboard
  const demoBtn = page.locator('button:has-text("Try Caregiver Demo")');
  if (await demoBtn.isVisible()) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }

  const targetPath1 = 'E:/Syncura/public/screenshots/00_devpost_hero_screenshot_1179x2556.png';
  const targetPath2 = 'E:/Syncura/public/screenshot-1179x2556.png';

  await page.screenshot({ path: targetPath1 });
  await page.screenshot({ path: targetPath2 });

  console.log('✓ Successfully saved 100% REAL live screenshot to:');
  console.log('   - ' + targetPath1);
  console.log('   - ' + targetPath2);

  await browser.close();
})();
