const { test, expect } = require('@playwright/test');

test('language switch renders one consistent UI language and Urdu uses RTL', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lang').selectOption('hi');
  await expect(page.locator('#searchBtn')).toHaveText('खोजें');
  await expect(page.locator('#nav button').first()).toHaveText('होम');
  await expect(page.locator('[data-t="explore"]')).toHaveText('दुनिया भर में खोजें');

  await page.locator('#lang').selectOption('bn');
  await expect(page.locator('#searchBtn')).toHaveText('খুঁজুন');
  await expect(page.locator('#nav button').first()).toHaveText('হোম');

  await page.locator('#lang').selectOption('ur');
  await expect(page.locator('#searchBtn')).toHaveText('تلاش');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');

  await page.locator('#lang').selectOption('zh');
  await expect(page.locator('#searchBtn')).toHaveText('搜索');
  await expect(page.locator('#nav button').first()).toHaveText('首页');
});

test('story detail uses the active UI locale consistently', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lang').selectOption('hi');
  const open=page.locator('[data-open]').first();
  if(await open.count()){
    await open.click();
    await expect(page.locator('#back')).toContainText('खबरों पर वापस');
    await expect(page.locator('#detail h2').first()).toHaveText('खबर का सार');
  }
});