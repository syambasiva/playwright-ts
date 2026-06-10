const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const outDir = path.join(__dirname, '..', 'tmp-buzz-inspect');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('https://opensource-demo.orangehrmlive.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await Promise.all([
      page.waitForURL(/.*(dashboard|index).*/i, { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForLoadState('networkidle');

    // Try to click Buzz
    const buzz = await page.getByRole('link', { name: 'Buzz' }).first();
    if (await buzz.count() > 0) {
      await buzz.click();
    } else {
      const bf = page.locator('text=Buzz').first();
      if (await bf.count() > 0) await bf.click();
    }

    await page.waitForLoadState('networkidle');

    const html = await page.content();
    fs.writeFileSync(path.join(outDir, 'buzz-page.html'), html, 'utf8');
    await page.screenshot({ path: path.join(outDir, 'buzz.png'), fullPage: true });
    console.log('Saved buzz-page.html and buzz.png to', outDir);
  } catch (e) {
    console.error('Error during inspect:', e);
  } finally {
    await browser.close();
  }
  process.exit(0);
})();

