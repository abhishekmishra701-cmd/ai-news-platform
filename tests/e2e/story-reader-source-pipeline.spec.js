const { test, expect } = require('@playwright/test');

test('Story Reader carries top-level source URL through fallback and renders all three sections', async ({ page }) => {
  const story = {
    id: 'story-source-url',
    headline: 'Publisher-backed story',
    summary: 'A live story with a top-level publisher URL.',
    category: 'World',
    country: 'Global',
    verification_status: 'developing',
    source_count: 1,
    source: 'Example Publisher',
    source_url: 'https://example.com/news/story-source-url'
  };

  let fallbackPayload;
  await page.route('**/api/news', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([story])
  }));
  await page.route('**/functions/v1/story-brief-v2', route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'unavailable' })
  }));
  await page.route('**/api/story-content-fallback', async route => {
    fallbackPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        brief: { points: [
          'First grounded point with enough detail to be meaningful.',
          'Second grounded point with independent detail for readers.',
          'Third grounded point explaining the development clearly.',
          'Fourth grounded point adding context from the source.'
        ]},
        report: { paragraphs: [
          'The first report paragraph contains source-grounded context and is deliberately distinct from the brief.',
          'The second report paragraph expands on the event with additional publisher detail.',
          'The third report paragraph provides further context for the reader.'
        ]},
        source: {
          publisher: 'Example Publisher',
          title: 'Publisher-backed story',
          url: 'https://example.com/news/story-source-url'
        }
      })
    });
  });

  await page.goto('/');
  await expect(page.getByText('Publisher-backed story', { exact: true })).toBeVisible();
  await page.locator('[data-open="story-source-url"]').first().click();

  await expect(page.locator('#storyReaderBrief li')).toHaveCount(4);
  await expect(page.locator('#storyReaderReport p')).toHaveCount(3);
  await expect(page.locator('#storyReaderSources')).toContainText('Example Publisher');
  await expect(page.locator('#storyReaderSources a')).toHaveAttribute('href', story.source_url);
  expect(fallbackPayload.story.sources[0].url).toBe(story.source_url);
  expect(fallbackPayload.story.sources[0].publisher).toBe('Example Publisher');
});
