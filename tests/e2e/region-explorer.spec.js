const { test, expect } = require('@playwright/test');

test('region selection constrains country choices and feed', async ({ page }) => {
  await page.goto('/');
  await page.locator('#regions button[data-region="Europe"]').click();

  await expect(page.locator('#regions button[data-region="Europe"]')).toHaveClass(/active/);
  await expect(page.locator('#countrySearch')).toHaveAttribute('placeholder', 'Search Europe country…');
  await expect(page.locator('#countryRowWrap')).toHaveClass(/visible/);
  await expect(page.locator('#countryRow button[data-country="France"]')).toBeVisible();
  await expect(page.locator('#countryRow button[data-country="Germany"]')).toBeVisible();
  await expect(page.locator('#countryRow button[data-country="India"]')).toHaveCount(0);

  await page.locator('#countryRow button[data-country="France"]').click();
  await expect(page.locator('#listTitle')).toContainText('France');

  await page.locator('#countryClear').click();
  await expect(page.locator('#listTitle')).toContainText('Worldwide');
});
