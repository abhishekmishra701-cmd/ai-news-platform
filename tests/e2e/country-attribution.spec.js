const { test, expect } = require('@playwright/test');

test('country feed uses API country attribution instead of the raw database fallback', async ({ page }) => {
  const apiResponse = await page.request.get('/api/news');
  expect(apiResponse.ok()).toBeTruthy();
  const stories = await apiResponse.json();
  expect(Array.isArray(stories)).toBeTruthy();

  const knownCountry = stories.find((story) => ['Australia', 'China', 'United States', 'India'].includes(story.country));
  expect(knownCountry).toBeTruthy();
  expect(knownCountry.country_attribution).toMatch(/source_data|inferred_from_explicit_story_signal/);

  await page.goto('/');
  await page.locator('#countrySearch').fill(knownCountry.country);
  await expect(page.locator('#countryMenu .country-option').filter({ hasText: knownCountry.country })).toBeVisible();
  await page.locator('#countryMenu .country-option').filter({ hasText: knownCountry.country }).click();

  await expect(page.locator('#listTitle')).toContainText(knownCountry.country);
  await expect(page.locator('#storyCount')).not.toHaveText('0 stories');
  await expect(page.locator('.country-tag').filter({ hasText: knownCountry.country }).first()).toBeVisible();
});
