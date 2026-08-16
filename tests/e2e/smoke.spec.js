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
  await country.click();
  await country.fill('India');
  await expect(page.locator('#countryMenu .country-option[data-country="India"]')).toBeVisible();
  await page.locator('#countryMenu .country-option[data-country="India"]').click();
  await expect(page.locator('#listTitle')).toContainText('India');
  await expect(page.locator('#myCountryTab')).toContainText('India');

  await country.click();
  await expect(page.locator('#countryMenu .country-option')).not.toHaveCount(0);
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

test('story reading experience opens when a story is available', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const open = page.locator('[data-open]').first();
  if (await open.count()) {
    await open.click();
    await expect(page.locator('.story-v2')).toBeVisible();
    await expect(page.locator('.story-v2 h1')).toBeVisible();
    await expect(page.getByText('Story Brief', { exact: true })).toBeVisible();
    await expect(page.getByText('Full Report', { exact: true })).toBeVisible();
    await expect(page.getByText('Sources & attribution', { exact: true })).toBeVisible();
  }
});

test('mobile layout remains usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#countrySearch')).toBeVisible();
});
