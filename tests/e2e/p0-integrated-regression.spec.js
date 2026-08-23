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

  test('category tabs use the authoritative API path and switch feed', async ({ page }) => {
    const calls=[];
    page.on('request', r => { if (r.url().includes('/api/news?category=')) calls.push(r.url()); });
    await page.goto('/');
    await page.locator('[data-cat="Geopolitics"]').click();
    await expect(page.locator('#listTitle')).toContainText('Geopolitics');
    await expect(page.locator('#storyCount')).not.toHaveText('0 stories');
    await expect.poll(() => calls.some(u => u.includes('category=Geopolitics'))).toBeTruthy();
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
    await expect(page.locator('#listTitle')).toHaveText(before||'');
  });
});
