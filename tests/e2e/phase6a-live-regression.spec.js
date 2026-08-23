import { test, expect } from '@playwright/test';

test('Phase 6A live feed does not render raw HTML and keeps categories authoritative', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#notice')).not.toContainText('Loading live news…');
  await expect(page.locator('#grid')).not.toContainText('<a href=');
  const before = await page.locator('#listTitle').textContent();
  await page.getByRole('button', { name: 'Geopolitics' }).click();
  await expect(page.locator('#listTitle')).toContainText('Geopolitics');
  await expect(page.locator('#listTitle')).not.toHaveText(before || '');
});

test('encoded anchor markup is stripped before browser rendering', async ({ page }) => {
  await page.route('**/api/news', async route => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify([{ id: 'encoded-html', headline: 'Clean headline', summary: '&lt;a href="https://example.com"&gt;Encoded story&lt;/a&gt; &#x27;quote&#x27;', body: '&lt;strong&gt;Body&lt;/strong&gt;', country: 'Global', category: 'World', verification_status: 'developing', source_count: 1 }]) });
  });
  await page.goto('/');
  await expect(page.locator('#grid')).toContainText("Encoded story 'quote'");
  await expect(page.locator('#grid')).not.toContainText('<a href=');
  await expect(page.locator('#grid')).not.toContainText('&lt;a');
});

test('language switch updates static UI and sets RTL for Urdu', async ({ page }) => {
  await page.goto('/');
  const select = page.locator('#global-news-language-selector');
  await expect(select).toBeVisible();
  await select.selectOption('hi');
  await expect(page.locator('[data-mode="home"]')).toHaveText('होम');
  await select.selectOption('ur');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('full report fallback does not repeat Story Brief', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-open]').first();
  if (await first.count()) {
    await first.click();
    await expect(page.locator('#article')).not.toContainText('What the available sources report');
  }
});
