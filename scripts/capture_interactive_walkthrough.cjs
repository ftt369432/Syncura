const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log('🚀 Running Full Interactive Syncura Screen Capture Suite...');

  const browser = await chromium.launch({ headless: true });
  // High-DPI mobile viewport (1179 x 2556 for App Store / Devpost)
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2.74,
    colorScheme: 'dark',
  });

  const page = await context.newPage();

  console.log('1. Loading App...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Landing Page
  await page.screenshot({ path: path.join(outputDir, '01_mobile_landing.png') });
  console.log('   ✓ Saved 01_mobile_landing.png');

  // Enter Demo Mode
  console.log('2. Entering Caregiver Demo Mode...');
  const demoBtn = page.locator('button:has-text("Try Caregiver Demo")');
  if (await demoBtn.isVisible()) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }

  // 2. Today's Regimen Dashboard
  await page.screenshot({ path: path.join(outputDir, '02_today_regimen_dashboard.png') });
  console.log('   ✓ Saved 02_today_regimen_dashboard.png');

  // 3. Clinical Alerts Inbox Modal
  console.log('3. Triggering Clinical Alerts Modal...');
  const alertIconBtn = page.locator('button[title*="Clinical Safety Alerts"]').first();
  if (await alertIconBtn.isVisible()) {
    await alertIconBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, '03_clinical_alerts_ddi.png') });
    console.log('   ✓ Saved 03_clinical_alerts_ddi.png');

    // Close alert modal
    const closeBtn = page.locator('div.fixed button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 4. Cabinet / Inventory View
  console.log('4. Navigating to Cabinet View...');
  const cabinetBtn = page.locator('nav button:has-text("Cabinet"), button:has-text("Cabinet")').first();
  if (await cabinetBtn.isVisible()) {
    await cabinetBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, '04_inventory_cabinet.png') });
    console.log('   ✓ Saved 04_inventory_cabinet.png');
  }

  // 5. Emergency ICE & SMART on FHIR View
  console.log('5. Navigating to Emergency Triage & FHIR View...');
  const emergencyBtn = page.locator('nav button:has-text("Emergency"), button:has-text("Emergency")').first();
  if (await emergencyBtn.isVisible()) {
    await emergencyBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, '05_emergency_ice_fhir.png') });
    console.log('   ✓ Saved 05_emergency_ice_fhir.png');
  }

  // 6. RevenueCat Paywall Modal (Consumer Family Swarm)
  console.log('6. Triggering RevenueCat Paywall Modal...');
  // Click logo to open menu or click upgrade
  const logoBtn = page.locator('header div.relative button').first();
  if (await logoBtn.isVisible()) {
    await logoBtn.click();
    await page.waitForTimeout(400);
    const upgradeMenuItem = page.locator('button:has-text("Upgrade"), button:has-text("Pro")').first();
    if (await upgradeMenuItem.isVisible()) {
      await upgradeMenuItem.click();
    }
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, '06_revenuecat_paywall_consumer.png') });
  console.log('   ✓ Saved 06_revenuecat_paywall_consumer.png');

  // 7. RevenueCat Paywall Modal (Commercial Agency Bracket)
  console.log('7. Switching to Enterprise Agency Bracket...');
  const agencyBracketBtn = page.locator('button:has-text("Health Organization")').first();
  if (await agencyBracketBtn.isVisible()) {
    await agencyBracketBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '07_revenuecat_paywall_enterprise.png') });
    console.log('   ✓ Saved 07_revenuecat_paywall_enterprise.png');
  }

  // 8. Judge Promo Code Redemption (SHIPATON2026)
  console.log('8. Redeeming Judge Promo Code SHIPATON2026...');
  const promoTrigger = page.locator('button:has-text("Enter Code")').first();
  if (await promoTrigger.isVisible()) {
    await promoTrigger.click();
    await page.waitForTimeout(300);
    const codeInput = page.locator('input[placeholder*="SHIPATON2026"]').first();
    if (await codeInput.isVisible()) {
      await codeInput.fill('SHIPATON2026');
      const unlockBtn = page.locator('button:has-text("Unlock")').first();
      if (await unlockBtn.isVisible()) {
        await unlockBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outputDir, '08_judge_unlock_success.png') });
        console.log('   ✓ Saved 08_judge_unlock_success.png');
      }
    }
  }

  // 9. High-Res Desktop Overview
  console.log('9. Capturing Desktop Master Dashboard (1280x800)...');
  const desktopPage = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark',
  });
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const desktopDemo = desktopPage.locator('button:has-text("Try Caregiver Demo")');
  if (await desktopDemo.isVisible()) {
    await desktopDemo.click();
    await desktopPage.waitForTimeout(1500);
  }
  await desktopPage.screenshot({ path: path.join(outputDir, '09_desktop_master_dashboard.png') });
  console.log('   ✓ Saved 09_desktop_master_dashboard.png');

  await browser.close();
  console.log('\n🎉 ALL LIVE APP SCREENSHOTS CAPTURED AND SAVED IN E:/Syncura/public/screenshots/!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
