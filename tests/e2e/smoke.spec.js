const { test, expect } = require('@playwright/test');

test('news homepage loads with core UI', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Global News/i);
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#countrySearch')).toBeVisible();
  await expect(page.locator('#myCountryTab')).toBeVisible();
});

test('country personalization controls work', async ({ page }) => {
  await page.goto('/');
  const country = page.locator('#countrySearch');
  await country.fill('India');
  await country.press('Enter');
  await expect(page.locator('#listTitle')).toContainText('India');
  await expect(page.locator('#countryClear')).toBeVisible();

  await page.locator('#countryClear').click();
  await expect(page.locator('#listTitle')).toContainText('Worldwide');
});

test('category navigation and search controls work', async ({ page }) => {
  await page.goto('/');
  const india = page.locator('#nav button[data-cat="India"]');
  await india.click();
  await expect(india).toHaveClass(/active/);
  await expect(page.locator('#listTitle')).toContainText('India');
  await page.locator('#q').fill('test search');
  await page.locator('#search').click();
  await expect(page.locator('#listTitle')).toBeVisible();
});

test('story cards expose country labels when stories are available', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const cards = page.locator('.card');
  if (await cards.count()) {
    await expect(cards.first().locator('.country-tag')).toBeVisible();
  }
});

test('mobile layout remains usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#countrySearch')).toBeVisible();
});
