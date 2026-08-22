const { test, expect } = require('@playwright/test');

test('news homepage loads with core UI', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Global News/i);
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#searchBtn')).toBeVisible();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#country')).toBeVisible();
  await expect(page.locator('#lang')).toBeVisible();
});

test('country personalization controls work', async ({ page }) => {
  await page.goto('/');
  const country = page.locator('#country');
  await country.selectOption({ label: 'India' });
  await expect(page.locator('#listTitle')).toContainText('India');
});

test('category navigation and search controls work', async ({ page }) => {
  await page.goto('/');
  const india = page.locator('#nav button[data-cat="India"]');
  await india.click();
  await expect(india).toHaveClass(/active/);
  await expect(page.locator('#listTitle')).toContainText('India');
  await page.locator('#q').fill('test search');
  await page.locator('#searchBtn').click();
  await expect(page.locator('#listTitle')).toBeVisible();
});

test('story cards expose country labels when stories are available', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const cards = page.locator('.card');
  if (await cards.count()) await expect(cards.first().locator('.chip').last()).toBeVisible();
});

test('story reading experience opens and returns to stories', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const open = page.locator('[data-open]').first();
  if (await open.count()) {
    await open.click();
    await expect(page.locator('#detail .article')).toBeVisible();
    await expect(page.locator('#detail .article h1')).toBeVisible();
    await page.locator('#back').click();
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#detail')).toHaveClass(/hidden/);
  }
});

test('mobile layout remains usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#searchBtn')).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#country')).toBeVisible();
});