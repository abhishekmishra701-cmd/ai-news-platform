const { test, expect } = require('@playwright/test');

test.describe('Phase 6A P0 integrated regression', () => {
  test('restores visible language selector and tricolour guard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#global-news-language-selector')).toHaveCount(1);
    await expect(page.locator('.top')).toHaveCSS('border-bottom-color', 'rgb(19, 136, 8)');
    await expect(page.locator('.navwrap')).toHaveCSS('border-top-color', 'rgb(255, 153, 51)');
    await page.locator('#global-news-language-selector').selectOption('hi');
    await expect(page.locator('[data-mode="home"]')).toHaveText('होम');
    await expect(page.locator('#search')).toHaveText('खोजें');
    await page.locator('#global-news-language-selector').selectOption('ur');
    await expect(page.locator('[data-mode="home"]')).toHaveText('ہوم');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('category tabs switch the authoritative in-memory API feed', async ({ page }) => {
    await page.goto('/');
    await expect.poll(()=>page.evaluate(()=>Array.isArray(window.__GLOBAL_NEWS_API_STORIES__)&&window.__GLOBAL_NEWS_API_STORIES__.length),{timeout:30000}).toBeGreaterThan(0);
    await expect(page.locator('#grid')).toBeVisible();
    await page.locator('[data-cat="Geopolitics"]').click();
    await expect(page.locator('#listTitle')).toContainText('Geopolitics');
    await expect(page.locator('#storyCount')).not.toHaveText('0 stories');
    await expect(page.locator('#grid .card').first()).toBeVisible();
  });

  test('Home clears selected country UI state', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { const x=document.querySelector('#countrySearch'); x.value='Bangladesh'; x.dispatchEvent(new Event('input',{bubbles:true})); });
    await page.waitForTimeout(450);
    await page.locator('[data-mode="home"]').click();
    await expect(page.locator('#countrySearch')).toHaveValue('');
    await expect(page.locator('[data-mode="home"]')).toHaveClass(/active/);
  });

  test('Story Reader keeps list state on return', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
    const card=page.locator('[data-open]').first();
    test.skip(await card.count()===0,'No live story available for this environment');
    const before=await page.locator('#listTitle').textContent();
    await card.click();
    await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
    await page.locator('.story-reader-back').click();
    await expect(page.locator('#home')).not.toHaveClass(/hidden/);
    await expect(page.locator('#listTitle')).toHaveText(before);
  });
});
