const { test, expect } = require('@playwright/test');

test.describe('multilingual UI and tricolour regression', () => {
  test('language selector is single, static UI translates, and tricolour theme is visible', async ({ page }) => {
    await page.goto('/');
    const selector = page.locator('#global-news-language-selector');
    await expect(selector).toHaveCount(1);
    await expect(selector).toHaveValue('en');
    await expect(page.locator('.top')).toHaveCSS('border-bottom-color', 'rgb(19, 136, 8)');
    await expect(page.locator('.navwrap')).toHaveCSS('border-top-color', 'rgb(255, 153, 51)');
    await selector.selectOption('zh');
    await expect(page.locator('#search')).toHaveText('搜索');
    await expect(page.locator('#listTitle')).toContainText('头条新闻');
    await selector.selectOption('bn');
    await expect(page.locator('#search')).toHaveText('অনুসন্ধান');
    await expect(page.locator('#listTitle')).toContainText('শীর্ষ সংবাদ');
  });

  test('selected language survives opening a story and detail page stays localized', async ({ page }) => {
    await page.goto('/');
    const selector = page.locator('#global-news-language-selector');
    await expect(selector).toHaveCount(1);
    await selector.selectOption('hi');
    await expect(page.locator('#search')).toHaveText('खोजें');
    const read = page.locator('.card .read').first();
    await expect(read).toBeVisible();
    await read.click();
    await expect(selector).toHaveValue('hi');
    await expect(page.locator('.detail-wrap')).toBeVisible();
    await expect(page.locator('body')).toContainText('समाचार सार');
  });

  test('RTL language changes direction without duplicating controls', async ({ page }) => {
    await page.goto('/');
    const selector = page.locator('#global-news-language-selector');
    await selector.selectOption('ur');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('#global-news-language-selector')).toHaveCount(1);
    await expect(page.locator('#search')).toHaveText('تلاش');
  });
});
