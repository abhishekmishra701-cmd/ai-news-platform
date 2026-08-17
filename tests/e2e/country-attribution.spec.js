const { test, expect } = require('@playwright/test');

const API_FIXTURE = [
  ['Australia', 'Australia announces a new national policy', 'The Australian government announced the policy in Canberra.'],
  ['United States', 'United States announces a new national policy', 'The United States government announced the policy in Washington.'],
  ['China', 'China announces a new national policy', 'The Chinese government announced the policy in Beijing.'],
  ['India', 'India announces a new national policy', 'The Indian government announced the policy in New Delhi.'],
  ['Germany', 'Germany announces a new national policy', 'The German government announced the policy in Berlin.'],
  ['Brazil', 'Brazil announces a new national policy', 'The Brazilian government announced the policy in Brasilia.']
].map(([country, headline, summary], index) => ({
  id: `e2e-country-${index + 1}`,
  slug: `${country.toLowerCase().replace(/[^a-z]+/g, '-')}-e2e-story`,
  headline,
  summary,
  body: `Officials in ${country} said the measure will take effect nationally.`,
  category: 'International',
  country,
  country_attribution: 'inferred_from_explicit_story_signal',
  verification_status: 'verified',
  source_count: 2,
  status: 'published',
  published_at: '2026-08-17T00:00:00Z'
}));

async function mockCountryApi(page) {
  await page.route('**/api/news**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(API_FIXTURE)
    });
  });
}

test('country feed uses API country attribution across representative countries', async ({ page }) => {
  await mockCountryApi(page);
  await page.goto('/');
  await page.waitForFunction(() => window.__GLOBAL_NEWS_COUNTRY_RECONCILED__ === true);
  await expect(page.locator('#countrySearch')).toBeVisible();

  for (const story of API_FIXTURE) {
    const country = story.country;
    await page.locator('#countrySearch').fill(country);
    await expect(page.locator('#countryMenu .country-option').filter({ hasText: country })).toBeVisible();
    await page.locator('#countryMenu .country-option').filter({ hasText: country }).click();
    await expect(page.locator('#listTitle')).toContainText(country);
    await expect(page.locator('#storyCount')).toHaveText('1 stories');
    await expect(page.locator('.country-tag').filter({ hasText: country }).first()).toBeVisible();
  }
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
  expect(stories).toHaveLength(6);
  for (const story of stories) {
    expect(story.country).toBeTruthy();
    expect(story.country_attribution).toBe('inferred_from_explicit_story_signal');
  }
});
