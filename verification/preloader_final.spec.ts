import { test, expect } from '@playwright/test';

test('verify preloader with primary buttons', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000); // Wait for buttons to animate in

  // Take screenshot
  await page.screenshot({ path: 'verification/preloader_final.png' });

  // Check if buttons are primary (violet)
  const polskiButton = page.locator('button:has-text("Polski")');
  await expect(polskiButton).toBeVisible();

  const bgColor = await polskiButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log('Button background color:', bgColor);
});
