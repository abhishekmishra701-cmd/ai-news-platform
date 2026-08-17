const { test, expect } = require('@playwright/test');

const API_FIXTURE = [
  {
    id: 'e2e-country-1',
    slug: 'australia-e2e-story',
    headline: 'Australia announces a new national policy',
    summary: 'The Australian government announced the policy in Canberra.',
    body: 'Officials in Australia said the measure will take effect nationally.',
    category: 'International',
    country: 'Australia',
    country_attribution: 'inferred_from_explicit_story_signal',
    status: 'published',
    published_at: '2026-08-17T00:00:00Z'
  }
];

test('country feed uses API country attribution instead of the raw database fallback', async ({ page }) => {
  await page.route('**/api/news**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_FIXTURE)
    });
  });

  await page.goto('/');

  await expect(page.locator('#countrySearch')).toBeVisible();
  await page.locator('#countrySearch').fill('Australia');
  await expect(page.locator('#countryMenu .country-option').filter({ hasText: 'Australia' })).toBeVisible();
  await page.locator('#countryMenu .country-option').filter({ hasText: 'Australia' }).click();

  await expect(page.locator('#listTitle')).toContainText('Australia');
  await expect(page.locator('#storyCount')).not.toHaveText('0 stories');
  await expect(page.locator('.country-tag').filter({ hasText: 'Australia' }).first()).toBeVisible();
});

test('country attribution fixture preserves explicit attribution metadata', async ({ page }) => {
  const apiResponse = await page.request.get('/api/news');
  expect(apiResponse.ok()).toBeTruthy();
  const stories = await apiResponse.json();
  expect(stories).toEqual(API_FIXTURE);
  expect(stories[0].country).toBe('Australia');
  expect(stories[0].country_attribution).toBe('inferred_from_explicit_story_signal');
});
