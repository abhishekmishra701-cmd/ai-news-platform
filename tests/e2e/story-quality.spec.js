const { test, expect } = require('@playwright/test');

test.describe('Story quality and language synchronization', () => {
  async function openFirstStory(page) {
    await page.goto('/');
    await page.waitForTimeout(700);
    const card = page.locator('[data-open]').first();
    test.skip(await card.count() === 0, 'No live story available for this environment');
    await card.click();
    await expect(page.locator('.story-reader-card')).toBeVisible();
  }

  test('Story Brief and Full Report never expose transport/markdown noise', async ({ page }) => {
    await openFirstStory(page);
    await expect.poll(async () => page.locator('#storyReaderReport').innerText()).not.toMatch(/https?:\/\/|javascript:\s*void|\[\]|\]\(|\*\*/i);
    await expect.poll(async () => page.locator('#storyReaderBrief').innerText()).not.toMatch(/https?:\/\/|javascript:\s*void|\[\]|\]\(|\*\*/i);
  });

  test('Related Stories exclude the current story and duplicate entries', async ({ page }) => {
    await openFirstStory(page);
    const ids = await page.locator('.ai-side-card').filter({ hasText: 'Related Stories' }).locator('[data-open]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-open')));
    expect(new Set(ids).size).toBe(ids.length);
    const current = await page.locator('.story-reader-head h1').getAttribute('data-gn-final-original');
    const currentId = await page.evaluate(title => {
      const pools=[window.__GLOBAL_NEWS_API_STORIES__,window.__GLOBAL_NEWS_STORIES__,window.stories];
      for(const p of pools) if(Array.isArray(p)) { const s=p.find(x => String(x?.headline||x?.title||'').trim().toLowerCase()===String(title||'').trim().toLowerCase()); if(s) return String(s.id); }
      return '';
    }, current);
    expect(ids).not.toContain(currentId);
  });

  test('Story language selector stays synchronized with the global selector and translates story text', async ({ page }) => {
    await openFirstStory(page);
    const global = page.locator('#global-news-language-selector');
    const local = page.locator('#aiStoryLanguage');
    await expect(global).toHaveCount(1);
    await expect(local).toHaveCount(1);
    await expect(local).toHaveValue('en');
    const originalTitle = await page.locator('.story-reader-head h1').innerText();
    await global.selectOption('hi');
    await expect(local).toHaveValue('hi');
    await expect.poll(async () => page.locator('.story-reader-head h1').innerText(), {timeout:20000}).not.toBe(originalTitle);
    const hindiTitle = await page.locator('.story-reader-head h1').innerText();
    await expect.poll(async () => page.locator('#storyReaderBrief').innerText(), {timeout:20000}).not.toMatch(/[A-Za-z]{20,}/);
    await local.selectOption('en');
    await expect(global).toHaveValue('en');
    await expect.poll(async () => page.locator('.story-reader-head h1').innerText(), {timeout:10000}).toBe(originalTitle);
    expect(hindiTitle).not.toBe(originalTitle);
  });

  test('Tom Brady Google News story can retrieve a source-grounded report when present', async ({ page }) => {
    await page.goto('/');
    const target = page.getByText(/How long will Tom Brady stay at Fox: His 10-year answer comes amid Raiders ownership questions/i).first();
    test.skip(await target.count() === 0, 'Tom Brady regression story is not in the current live feed');
    await target.click();
    await expect(page.locator('.story-reader-card')).toBeVisible();
    await expect.poll(async () => page.locator('#storyReaderBrief').innerText(), {timeout:20000}).not.toContain('Story Brief is limited for this source');
    await expect.poll(async () => page.locator('#storyReaderReport').innerText(), {timeout:20000}).not.toContain('Detailed source report is currently unavailable');
    await expect(page.locator('#storyReaderSources')).toContainText(/Times of India|Source/i);
  });
});
