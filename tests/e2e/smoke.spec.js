const { test, expect } = require('@playwright/test');

// Existing smoke coverage is retained; this test uses the current /api/story-content
// pipeline and accepts either a grounded report or a safe limited-content response.
test('Story Reader uses the grounded-report pipeline without fabricating unavailable content', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const open = page.locator('.card .read').first();
  if (!(await open.count())) test.skip();
  await open.click();
  await expect(page.locator('.story-reader-card')).toBeVisible();
  const report = page.locator('#storyReaderReport');
  await expect(report).toBeVisible();
  await expect.poll(async () => report.getAttribute('data-status'), { timeout: 15000 }).toMatch(/^(success|limited)$/);
  await expect(report).not.toContainText('Limited source content available.');
  const status=await report.getAttribute('data-status');
  if(status==='success') await expect(report.locator('p').first()).toBeVisible();
});

