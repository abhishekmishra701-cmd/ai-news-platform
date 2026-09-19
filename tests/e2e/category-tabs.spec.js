const { test, expect } = require('@playwright/test');

const categories = [
  'India',
  'World',
  'Geopolitics',
  'International Relations',
  'Business',
  'Technology',
  'Entertainment',
  'Sports',
  'Science',
  'Climate',
];

test.describe('category tabs', () => {
  for (const category of categories) {
    test(`${category} tab loads stories`, async ({ page }) => {
      await page.goto('/');
      await expect.poll(()=>page.evaluate(()=>Array.isArray(window.__GLOBAL_NEWS_API_STORIES__)&&window.__GLOBAL_NEWS_API_STORIES__.length),{timeout:30000}).toBeGreaterThan(0);
      await expect(page.locator('[data-cat="' + category + '"]')).toBeVisible();
      await page.locator('[data-cat="' + category + '"]').click();
      await expect(page.locator('#listTitle')).toContainText(category);
      await expect(page.locator('#storyCount')).not.toHaveText('0 stories');
      await expect(page.locator('#grid .card').first()).toBeVisible();
      await expect(page.locator('#grid .card .country-tag').first()).toBeVisible();
    });
  }
});
