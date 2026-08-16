const { test, expect } = require('@playwright/test');

test('news homepage loads with core UI', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Global News/i);
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#countrySearch')).toBeVisible();
  await expect(page.locator('#myCountryTab')).toBeVisible();
});

test('country personalization controls work', async ({ page }) => {
  await page.goto('/');
  const country = page.locator('#countrySearch');
  await country.click();
  await country.fill('India');
  await expect(page.locator('#countryMenu .country-option[data-country="India"]')).toBeVisible();
  await page.locator('#countryMenu .country-option[data-country="India"]').click();
  await expect(page.locator('#listTitle')).toContainText('India');
  await expect(page.locator('#myCountryTab')).toContainText('India');

  await country.click();
  await expect(page.locator('#countryMenu .country-option')).not.toHaveCount(0);
});

test('category navigation and search controls work', async ({ page }) => {
  await page.goto('/');
  const india = page.locator('#nav button[data-cat="India"]');
  await india.click();
  await expect(india).toHaveClass(/active/);
  await expect(page.locator('#listTitle')).toContainText('India');
  await page.locator('#q').fill('test search');
  await page.locator('#search').click();
  await expect(page.locator('#listTitle')).toBeVisible();
});

test('story cards expose country labels when stories are available', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const cards = page.locator('.card');
  if (await cards.count()) {
    await expect(cards.first().locator('.country-tag')).toBeVisible();
  }
});

test('story reading experience keeps Brief and Full Report distinct when detailed source material exists', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const open = page.locator('[data-open]').first();
  if (await open.count()) {
    await open.click();
    await expect(page.locator('.story-reader-card')).toBeVisible();
    await expect(page.locator('.story-reader-card h1')).toBeVisible();
    await expect(page.getByText('Story Brief', { exact: true })).toBeVisible();
    await expect(page.getByText('Full Report', { exact: true })).toBeVisible();
    await expect(page.getByText('Sources & attribution', { exact: true })).toBeVisible();

    const brief = page.locator('#storyReaderBrief');
    const report = page.locator('#storyReaderReport');
    await expect(brief).toBeVisible();
    await expect(report).toBeVisible();
    await expect(report).toHaveAttribute('data-report-source', 'story-brief-v6');
    await expect(report.locator('p').first()).toBeVisible();

    const reportLabel = await report.locator('.story-reader-label').textContent();
    const reportWords = Number(await report.getAttribute('data-report-word-count') || 0);
    const briefWords = Number(await report.getAttribute('data-brief-word-count') || 0);
    if ((reportLabel || '').toLowerCase().includes('source-grounded report')) {
      expect(reportWords).toBeGreaterThan(briefWords);
    }

    const back = page.getByRole('button', { name: '← Back to stories' });
    await expect(back).toHaveCount(1);
    await back.click();
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#detail')).toHaveClass(/hidden/);
  }
});

test('mobile layout remains usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#q')).toBeVisible();
  await expect(page.locator('#search')).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
  await expect(page.locator('#countrySearch')).toBeVisible();
});
