const { test, expect } = require('@playwright/test');

test('browser feed uses /api/news as its authoritative story source', async ({ page }) => {
  const apiRequests = [];
  const directSupabaseRequests = [];
  const story = {
    id: 'e2e-story-1',
    headline: 'API-authoritative test story',
    summary: 'Rendered from the /api/news contract.',
    category: 'Technology',
    country: 'Global',
    verification_status: 'verified',
    source_count: 1,
    published_at: '2026-08-22T00:00:00.000Z'
  };

  await page.route('**/api/news', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([story])
    });
  });

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/news')) apiRequests.push(url);
    if (url.includes('/rest/v1/news_stories')) directSupabaseRequests.push(url);
  });

  await page.goto('/');
  await expect(page.locator('#grid')).toContainText(story.headline);
  await expect(page.locator('#notice')).toContainText('1 stories available');

  expect(apiRequests.length).toBeGreaterThan(0);
  expect(directSupabaseRequests.length).toBe(0);
});
