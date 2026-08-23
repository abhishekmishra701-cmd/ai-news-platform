const { test, expect } = require('@playwright/test');

const stories = [
  {
    id: 'rich-story',
    headline: 'Major agreement changes regional policy',
    summary: 'Officials announced a major agreement after talks. The agreement sets a new timetable for implementation.',
    body: 'Officials announced a major agreement after talks. The agreement sets a new timetable for implementation. Independent analysts said the implementation schedule will require additional funding and coordination. A second round of consultations is expected before the first deadline.',
    category: 'World', country: 'Global', verification_status: 'verified', source_count: 2,
    sources: [{ publisher: 'Source One' }, { publisher: 'Source Two' }]
  },
  {
    id: 'limited-story', headline: 'Limited live update',
    summary: 'The live feed currently contains only this short source update.', body: '',
    category: 'World', country: 'Global', verification_status: 'developing', source_count: 1
  }
];

async function mockFeed(page) {
  await page.route('**/api/news**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(stories) }));
}

test('Story Brief and Full Report remain materially distinct for a rich story', async ({ page }) => {
  await mockFeed(page);
  await page.goto('/');
  await page.locator('[data-open="rich-story"]').click();
  await expect(page.locator('#storyReaderBrief')).toContainText('Officials announced a major agreement');
  await expect(page.locator('#storyReaderReport')).toContainText('Independent analysts said the implementation schedule');
  await expect(page.locator('#storyReaderReport')).not.toContainText('Coverage is currently filed under');
  await expect(page.locator('#storyReaderSources')).toContainText('Source One');
  await page.locator('.story-reader-back').click();
  await expect(page.locator('#home')).not.toHaveClass(/hidden/);
  await expect(page.locator('[data-open="rich-story"]')).toBeVisible();
});

test('limited-content story never fabricates a report or copies metadata into it', async ({ page }) => {
  await mockFeed(page);
  await page.goto('/');
  await page.locator('[data-open="limited-story"]').click();
  await expect(page.locator('#storyReaderBrief')).toContainText('The live feed currently contains only this short source update.');
  await expect(page.locator('#storyReaderReport')).toContainText('Additional source-grounded detail is not available');
  await expect(page.locator('#storyReaderReport')).not.toContainText('Coverage is currently filed under');
  await expect(page.locator('#storyReaderReport')).not.toContainText('source is represented in the live feed');
});
