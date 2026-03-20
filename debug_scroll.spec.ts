import { test, expect } from '@playwright/test';

test('debug scrolling on crowdfunding page', async ({ page }) => {
  await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('footer', { timeout: 30000 });

  const debugInfo = await page.evaluate(() => {
    return {
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      htmlStyle: window.getComputedStyle(document.documentElement).overflow,
      bodyStyle: window.getComputedStyle(document.body).overflow,
      documentHeight: document.documentElement.scrollHeight,
      windowHeight: window.innerHeight
    };
  });

  console.log('Debug Info:', debugInfo);

  // Try to force scroll again
  await page.evaluate(() => {
    window.scrollTo(0, 1000);
  });

  const scrollY = await page.evaluate(() => window.scrollY);
  console.log('Final scrollY:', scrollY);

  await page.screenshot({ path: '/home/jules/verification/debug_scroll.png' });
});
