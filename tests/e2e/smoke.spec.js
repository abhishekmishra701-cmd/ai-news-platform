const { test, expect } = require('@playwright/test');

async function waitForStories(page) {
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#listTitle')).toBeVisible();
  await expect(page.locator('[data-open]').first()).toBeVisible({ timeout: 10_000 });
}

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
  await waitForStories(page);
  const cards = page.locator('.card');
  await expect(cards.first().locator('.chip').last()).toBeVisible();
});

test('story reading experience opens and returns to stories', async ({ page }) => {
  await page.goto('/');
  await waitForStories(page);
  await page.locator('[data-open]').first().click();
  await expect(page.locator('#detail .article')).toBeVisible();
  await expect(page.locator('#detail .article h1')).toBeVisible();
  await page.locator('#back').click();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#detail')).toHaveClass(/hidden/);
});

test('mobile layout remains usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#searchBtn')).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#country')).toBeVisible();
});
