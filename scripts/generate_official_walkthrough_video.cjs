const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ffmpegPath = require('ffmpeg-static');
const tempVideoDir = path.join(__dirname, '../video_temp');
const outputDir = path.join(__dirname, '../public');

if (!fs.existsSync(tempVideoDir)) {
  fs.mkdirSync(tempVideoDir, { recursive: true });
}

// Clean old temp files
const oldFiles = fs.readdirSync(tempVideoDir);
for (const f of oldFiles) {
  try { fs.unlinkSync(path.join(tempVideoDir, f)); } catch (e) {}
}

async function run() {
  console.log('🎬 Starting Syncura Master YouTube Walkthrough Video Production...');
  console.log('Using ffmpeg at:', ffmpegPath);

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: tempVideoDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const stagePage = await context.newPage();
  const stageUrl = 'http://localhost:4173/broadcast.html';

  console.log('1. Loading Master Stage:', stageUrl);
  await stagePage.goto(stageUrl, { waitUntil: 'networkidle' });
  await stagePage.waitForTimeout(2000);

  // Helper to update stage tile
  async function updateTile(tileData) {
    await stagePage.evaluate((data) => window.setTileContent(data), tileData);
  }

  // Get frame locator for the embedded app
  const frame = stagePage.frameLocator('#appIframe');

  // Safe click helper with force: true and dispatchEvent fallback
  async function safeClick(locator) {
    try {
      if (await locator.isVisible({ timeout: 4000 }).catch(() => false)) {
        await locator.click({ force: true, timeout: 5000 });
        return true;
      }
    } catch (e) {
      try {
        await locator.dispatchEvent('click');
        return true;
      } catch (e2) {}
    }
    return false;
  }

  // Helper for scrolling inside the iframe cleanly
  async function scrollFrame(topOffset) {
    try {
      await frame.locator('main, div.overflow-y-auto, body').first().evaluate((el, top) => {
        el.scrollBy({ top: top, behavior: 'smooth' });
      }, topOffset);
    } catch (e) {
      // Fallback mouse wheel
      await stagePage.mouse.move(1420, 540);
      await stagePage.mouse.wheel(0, topOffset);
    }
  }

  // ----------------------------------------------------
  // SCENE 0: Hook & The Polypharmacy Crisis (10s)
  // ----------------------------------------------------
  console.log('👉 Scene 0: The Polypharmacy Crisis & Mission...');
  await updateTile({
    pill: 'THE CRISIS & MISSION',
    title: 'Caring For Aging Parents Shouldn\'t Feel Like An ICU Shift',
    subtitle: 'Over 1.3M emergency room visits occur every year from accidental medication errors, double-dosing, and silent drug collisions.',
    features: [
      '<strong>100,000 Annual US Deaths:</strong> Preventable medication collisions shatter families.',
      '<strong>The Double-Dose Trap:</strong> "Did I take it?" causes accidental lethal redosing.',
      '<strong>Silent OTC Collisions:</strong> Routine Advil with Eliquis magnifies bleeding risk by 400%.'
    ],
    promo: 'RevenueCat Ship-a-ton 2026'
  });

  await stagePage.waitForTimeout(4000);

  // Click Try Caregiver Demo inside app
  console.log('   Entering Caregiver Demo Mode...');
  await safeClick(frame.locator('button:has-text("Try Caregiver Demo")'));
  await stagePage.waitForTimeout(3000);

  // ----------------------------------------------------
  // SCENE 1: Dynamic Regimen & Floating Meals (18s)
  // ----------------------------------------------------
  console.log('👉 Scene 1: Dynamic Regimen & Floating Meal Routines...');
  await updateTile({
    pill: 'CHAPTER 01 OF 06',
    title: 'Dynamic Regimen & Floating Meal Routines',
    subtitle: 'Eliminating rigid 8:00 AM alarms. Medication routines anchor dynamically to actual meals to protect safe spacing.',
    features: [
      '<strong>Dynamic Meal Anchors:</strong> Shifts morning meds forward if breakfast is delayed without colliding with bedtime.',
      '<strong>Double-Dose Lockout:</strong> Hard cryptographic lockout prevents accidental redosing across caregivers.',
      '<strong>PRN Toxicity Ceiling:</strong> Automatic enforcement of minimum spacing between rescue doses.'
    ],
    promo: 'Judge Unlock: SHIPATON2026'
  });

  await stagePage.waitForTimeout(3000);
  await scrollFrame(250);
  await stagePage.waitForTimeout(2500);

  // Click a dose checkbox or log button if available
  await safeClick(frame.locator('input[type="checkbox"], button:has-text("Take"), button:has-text("Log")').first());
  await stagePage.waitForTimeout(2000);

  await scrollFrame(-250);
  await stagePage.waitForTimeout(2000);

  // ----------------------------------------------------
  // SCENE 2: 60-Second Bottle OCR & DDI Interceptor (20s)
  // ----------------------------------------------------
  console.log('👉 Scene 2: 60-Second Bottle OCR & DDI Safety Interceptor...');
  await updateTile({
    pill: 'CHAPTER 02 OF 06',
    title: '60-Sec Bottle OCR & Clinical Interceptor',
    subtitle: 'Instant NLM RxNorm concept recognition and OpenFDA contraindication screening before any bottle is saved.',
    features: [
      '<strong>Point & Scan OCR:</strong> Extracts chemical compound, strength, and frequency in 2 seconds.',
      '<strong>Pre-Save Safety Interceptor:</strong> Halts lethal drug-drug interactions (e.g. NSAID + Eliquis).',
      '<strong>Self-Calibrating Memory:</strong> Detects previously discontinued intolerant medications.'
    ],
    promo: 'Verified by NLM RxNorm & OpenFDA'
  });

  await stagePage.waitForTimeout(2500);

  // Click clinical alert bell in header with safeClick
  const alertClicked = await safeClick(frame.locator('button[title*="Clinical Safety Alerts"]').first());
  if (alertClicked) {
    await stagePage.waitForTimeout(4000);

    // Scroll through alert modal
    try {
      await frame.locator('div.fixed div.overflow-y-auto').first().evaluate(el => el.scrollBy({ top: 180, behavior: 'smooth' }));
    } catch(e) {}
    await stagePage.waitForTimeout(3000);

    // Close alert modal
    await safeClick(frame.locator('div.fixed button:has(svg.lucide-x)').first());
    await stagePage.waitForTimeout(1500);
  }

  // ----------------------------------------------------
  // SCENE 3: Physical Pill-Tray Computer Vision Audit (18s)
  // ----------------------------------------------------
  console.log('👉 Scene 3: Physical Pill-Tray Computer Vision Audit...');
  await updateTile({
    pill: 'CHAPTER 03 OF 06',
    title: 'Physical Pill-Tray Computer Vision Audit',
    subtitle: 'Caregivers pour loose pills onto a napkin. Syncura\'s client-side CV segments and counts tablets in under 1 second.',
    features: [
      '<strong>Client-Side Canvas CV:</strong> Real-time contour thresholding with zero cloud privacy leaks.',
      '<strong>Reconciliation Ledger:</strong> Matches physical pills against scheduled morning regimen.',
      '<strong>Refill & Toxicity Alerts:</strong> Automated depletion forecasting with pharmacy reorder triggers.'
    ],
    promo: 'Zero-Latency Client-Side Computer Vision'
  });

  // Navigate to Cabinet View
  await safeClick(frame.locator('nav button:has-text("Cabinet"), button:has-text("Cabinet")').first());
  await stagePage.waitForTimeout(3000);
  await scrollFrame(250);
  await stagePage.waitForTimeout(3000);

  // ----------------------------------------------------
  // SCENE 4: Family Caregiver Swarm & Audio Check-Ins (18s)
  // ----------------------------------------------------
  console.log('👉 Scene 4: Family Caregiver Swarm & Audio Check-Ins...');
  await updateTile({
    pill: 'CHAPTER 04 OF 06',
    title: 'Caregiver Swarm & Audio Check-Ins',
    subtitle: 'Real-time synchronized household ledger with push-to-talk voice memos and 6-digit QR pairing.',
    features: [
      '<strong>Zero-Friction Relay:</strong> Keeps adult children, spouses, and visiting nurses synchronized.',
      '<strong>Push-to-Talk Voice Notes:</strong> Seniors or aides record 5-second audio updates.',
      '<strong>Multi-Caregiver Coordination:</strong> Instant notifications eliminate guessing in the dark.'
    ],
    promo: 'AES-256-GCM Zero-Knowledge Privacy'
  });

  // Return to Today or scroll feed
  await safeClick(frame.locator('nav button:has-text("Today"), button:has-text("Today")').first());
  await stagePage.waitForTimeout(2500);
  await scrollFrame(350);
  await stagePage.waitForTimeout(3000);

  // ----------------------------------------------------
  // SCENE 5: Emergency ICE Pass & SMART on FHIR R4 (18s)
  // ----------------------------------------------------
  console.log('👉 Scene 5: Emergency ICE Pass & SMART on FHIR R4...');
  await updateTile({
    pill: 'CHAPTER 05 OF 06',
    title: 'Emergency ICE Pass & SMART on FHIR R4',
    subtitle: 'Zero-authentication paramedic triage screen and authentic International Patient Summary (IPS) QR code.',
    features: [
      '<strong>Paramedic Lock-Screen Triage:</strong> Instant view of blood type, pacemakers, and critical thinners.',
      '<strong>SMART Health Link IPS QR:</strong> Scannable directly by clinic receptionists into Epic or Cerner.',
      '<strong>1-Page Doctor Summary:</strong> Clean, color-coded adherence summary for geriatrician consults.'
    ],
    promo: 'HL7 FHIR R4 & 21st Century Cures Act § 3060'
  });

  await safeClick(frame.locator('nav button:has-text("Emergency"), button:has-text("Emergency")').first());
  await stagePage.waitForTimeout(4000);
  await scrollFrame(220);
  await stagePage.waitForTimeout(3000);

  // ----------------------------------------------------
  // SCENE 6: RevenueCat Monetization & Judge Unlock (22s)
  // ----------------------------------------------------
  console.log('👉 Scene 6: RevenueCat Monetization & Judge VIP Unlock...');
  await updateTile({
    pill: 'CHAPTER 06 OF 06',
    title: 'RevenueCat Monetization & Judge Unlock',
    subtitle: 'Dual B2C Family Swarm and B2B Healthcare Agency eMAR with instant judge entitlement bypass.',
    features: [
      '<strong>Family Swarm ($9.99/mo or $89/yr):</strong> Multi-caregiver sync & 14-day free trial.',
      '<strong>Founder Lifetime ($149):</strong> Single purchase for lifetime family protection.',
      '<strong>Commercial Agency eMAR ($199/mo):</strong> CMS Electronic Visit Verification (EVV) with GPS.',
      '<strong>Judge VIP Bypass:</strong> Enter <code>SHIPATON2026</code> for instant full VIP access!'
    ],
    promo: 'Devpost Judge Code: SHIPATON2026'
  });

  // Open RevenueCat Paywall
  const logoClicked = await safeClick(frame.locator('header div.relative button, header button').first());
  if (logoClicked) {
    await stagePage.waitForTimeout(600);
    await safeClick(frame.locator('button:has-text("Upgrade"), button:has-text("Pro"), button:has-text("Pricing")').first());
  }
  await stagePage.waitForTimeout(3000);

  // Switch to Health Organization bracket
  await safeClick(frame.locator('button:has-text("Health Organization")').first());
  await stagePage.waitForTimeout(2500);

  // Switch back to Consumer
  await safeClick(frame.locator('button:has-text("Family & Seniors")').first());
  await stagePage.waitForTimeout(1500);

  // Redeem Promo Code SHIPATON2026
  console.log('   Redeeming Judge Promo Code: SHIPATON2026...');
  const promoTrigger = frame.locator('button:has-text("Enter Code"), button:has-text("Ship-a-ton Judge")').first();
  if (await safeClick(promoTrigger)) {
    await stagePage.waitForTimeout(600);

    const codeInput = frame.locator('input[placeholder*="SHIPATON2026"]').first();
    if (await codeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await codeInput.fill('SHIPATON2026');
      await stagePage.waitForTimeout(800);

      await safeClick(frame.locator('button:has-text("Unlock")').first());
      await stagePage.waitForTimeout(3500);
    }
  }

  // ----------------------------------------------------
  // SCENE 7: Outro & Ready to Ship (12s)
  // ----------------------------------------------------
  console.log('👉 Scene 7: Outro & Call to Action...');
  await updateTile({
    pill: 'READY TO SHIP & SCALE',
    title: 'Syncura — Bringing Peace of Mind to Elder Care',
    subtitle: 'Submitted with pride to the RevenueCat Ship-a-ton 2026. Built with React 19, TypeScript, Capacitor, and RevenueCat.',
    features: [
      '<strong>Live Interactive Web App:</strong> https://syncura.health',
      '<strong>Devpost Submission:</strong> RevenueCat Ship-a-ton 2026',
      '<strong>Zero-Friction Evaluation:</strong> Judge code <code>SHIPATON2026</code> active on live demo.',
      '<strong>Eliminating 1.3M ER visits:</strong> Restoring safety and dignity to aging at home.'
    ],
    promo: 'https://syncura.health'
  });

  await stagePage.waitForTimeout(5000);

  // Close browser to trigger video encoding
  console.log('🛑 Finishing recording and closing browser...');
  const videoObj = stagePage.video();
  await context.close();
  await browser.close();

  const videoPath = await videoObj.path();
  console.log('✓ Raw Playwright Video recorded to:', videoPath);

  // Convert WebM to High-Quality YouTube MP4 (1080p, H.264, 30fps)
  const finalMp4Path = path.join(outputDir, 'Syncura_Official_YouTube_Walkthrough_1080p.mp4');
  console.log('\n⚙️ Encoding YouTube-Optimized 1080p MP4 with ffmpeg...');
  console.log('Destination:', finalMp4Path);

  const ffmpegCmd = `"${ffmpegPath}" -y -i "${videoPath}" -c:v libx264 -preset fast -profile:v high -level 4.2 -pix_fmt yuv420p -r 30 -movflags +faststart "${finalMp4Path}"`;
  
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Generate 1280x720 and 1920x1080 YouTube Thumbnail from peak frame
  const thumbPath720 = path.join(outputDir, 'youtube_thumbnail_1280x720.png');
  const thumbPath1080 = path.join(outputDir, 'youtube_thumbnail_1920x1080.png');
  console.log('\n📸 Generating YouTube Thumbnails...');

  execSync(`"${ffmpegPath}" -y -ss 00:00:25 -i "${finalMp4Path}" -vframes 1 -s 1280x720 "${thumbPath720}"`);
  execSync(`"${ffmpegPath}" -y -ss 00:00:25 -i "${finalMp4Path}" -vframes 1 -s 1920x1080 "${thumbPath1080}"`);

  const stat = fs.statSync(finalMp4Path);
  console.log(`\n🎉 SUCCESS! Official YouTube Video Generated:`);
  console.log(`- Video File: ${finalMp4Path} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`- Thumbnail (720p): ${thumbPath720}`);
  console.log(`- Thumbnail (1080p): ${thumbPath1080}`);
}

run().catch((err) => {
  console.error('Fatal error during video generation:', err);
  process.exit(1);
});
