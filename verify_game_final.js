const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(10000); // Wait for initialization
  await page.screenshot({ path: 'verification_game_final.png' });
  const content = await page.textContent('body');
  console.log('Body text:', content);
  await browser.close();
})();
