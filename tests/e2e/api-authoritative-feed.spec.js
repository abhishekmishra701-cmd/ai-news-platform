const { test, expect } = require('@playwright/test');

test('browser feed uses /api/news as its authoritative story source', async ({ page }) => {
  const apiRequests = [];
  const directSupabaseRequests = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('/api/news')) apiRequests.push(url);
    if (url.includes('/rest/v1/news_stories')) directSupabaseRequests.push(url);
  });

  await page.goto('/');
  await page.waitForFunction(() => document.querySelector('#grid')?.children.length > 0 || document.querySelector('#notice')?.classList.contains('error'));

  expect(apiRequests.length).toBeGreaterThan(0);
  expect(directSupabaseRequests.length).toBe(0);
});
