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

  test('Story language selector stays synchronized with the global selector', async ({ page }) => {
    await openFirstStory(page);
    const global = page.locator('#global-news-language-selector');
    const local = page.locator('#aiStoryLanguage');
    await expect(global).toHaveCount(1);
    await expect(local).toHaveCount(1);
    await expect(local).toHaveValue('English');
    await global.selectOption('hi');
    await expect(local).toHaveValue('Hindi');
    await local.selectOption('English');
    await expect(global).toHaveValue('en');
  });
});
