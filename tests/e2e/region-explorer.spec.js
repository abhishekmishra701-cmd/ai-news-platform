const { test, expect } = require('@playwright/test');

test('region selection constrains the country selector and feed', async ({ page }) => {
  await page.goto('/');
  await page.locator('#regions button[data-region="Europe"]').click();
  await expect(page.locator('#regions button[data-region="Europe"]')).toHaveClass(/active/);
  const country=page.locator('#country');
  await expect(country.locator('option', { hasText:'France' })).toHaveCount(1);
  await expect(country.locator('option', { hasText:'Germany' })).toHaveCount(1);
  await expect(country.locator('option', { hasText:'India' })).toHaveCount(0);
  await country.selectOption('France');
  await expect(page.locator('#listTitle')).toContainText('France');
  await page.locator('#regions button[data-region="Europe"]').click();
  await country.selectOption('Germany');
  await expect(page.locator('#listTitle')).toContainText('Germany');
});