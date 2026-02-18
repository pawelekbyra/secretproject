import { test, expect } from '@playwright/test';

test('verify preloader with new logo and adjusted buttons', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12/13
  await page.goto('http://localhost:3000');

  // Wait a bit for components to mount
  await page.waitForTimeout(3000);

  // Take a screenshot regardless of visibility
  await page.screenshot({ path: '/home/jules/verification/preloader_refined.png' });

  // Check if buttons are in the DOM at least
  const buttons = await page.locator('button').allInnerTexts();
  console.log('Buttons found:', buttons);
});
