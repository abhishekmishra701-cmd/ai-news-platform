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
    verification_status: 'verified',
    source_count: 2,
    status: 'published',
    published_at: '2026-08-17T00:00:00Z'
  }
];

async function mockCountryApi(page) {
  await page.route('**/api/news**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_FIXTURE)
    });
  });
}

test('country feed uses API country attribution instead of the raw database fallback', async ({ page }) => {
  await mockCountryApi(page);
  await page.goto('/');

  // The production reconciliation is asynchronous; wait for the API-backed
  // feed to be installed before exercising country filtering.
  await page.waitForFunction(() => window.__GLOBAL_NEWS_COUNTRY_RECONCILED__ === true);
  await expect(page.locator('#countrySearch')).toBeVisible();
  await page.locator('#countrySearch').fill('Australia');
  await expect(page.locator('#countryMenu .country-option').filter({ hasText: 'Australia' })).toBeVisible();
  await page.locator('#countryMenu .country-option').filter({ hasText: 'Australia' }).click();

  await expect(page.locator('#listTitle')).toContainText('Australia');
  await expect(page.locator('#storyCount')).toHaveText('1 stories');
  await expect(page.locator('.country-tag').filter({ hasText: 'Australia' }).first()).toBeVisible();
});

test('country attribution fixture is returned by the application API', async ({ page }) => {
  await mockCountryApi(page);
  await page.goto('/');

  const stories = await page.evaluate(async () => {
    const response = await fetch('/api/news');
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return response.json();
  });

  expect(stories).toEqual(API_FIXTURE);
  expect(stories[0].country).toBe('Australia');
  expect(stories[0].country_attribution).toBe('inferred_from_explicit_story_signal');
});
