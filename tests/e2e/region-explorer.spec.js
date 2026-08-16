const { test, expect } = require('@playwright/test');

test('region selection constrains the searchable country dropdown and feed', async ({ page }) => {
  await page.goto('/');
  await page.locator('#regions button[data-region="Europe"]').click();

  await expect(page.locator('#regions button[data-region="Europe"]')).toHaveClass(/active/);
  await page.locator('#countrySearch').click();

  await expect(page.locator('#countryMenu .country-option[data-country="France"]')).toBeVisible();
  await expect(page.locator('#countryMenu .country-option[data-country="Germany"]')).toBeVisible();
  await expect(page.locator('#countryMenu .country-option[data-country="India"]')).toHaveCount(0);

  await page.locator('#countrySearch').fill('France');
  await expect(page.locator('#countryMenu .country-option[data-country="France"]')).toBeVisible();
  await page.locator('#countryMenu .country-option[data-country="France"]').click();
  await expect(page.locator('#listTitle')).toContainText('France');
  await expect(page.locator('#myCountryTab')).toContainText('France');

  // Re-open the same selector: the full Europe list must be available again.
  await page.locator('#countrySearch').click();
  await expect(page.locator('#countryMenu .country-option[data-country="Germany"]')).toBeVisible();
  await page.locator('#countryMenu .country-option[data-country="Germany"]').click();
  await expect(page.locator('#listTitle')).toContainText('Germany');
});
