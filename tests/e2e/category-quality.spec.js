const { test, expect } = require('@playwright/test');

const cases = [
  ['Technology', /tech|ai|chip|software|semiconductor/i],
  ['Entertainment', /film|movie|music|actor|streaming|entertainment/i],
  ['Geopolitics', /geopolit|war|sanction|border|military|defence|defense/i],
  ['International Relations', /diplomatic|diplomacy|summit|foreign|ambassador|treaty|relations/i],
  ['Business', /business|company|market|stock|economy|finance|investment|trade/i],
  ['Sports', /sport|football|soccer|cricket|tennis|basketball|olympic|match/i],
  ['Science', /science|scientist|research|space|nasa|physics|biology|discovery/i],
  ['Climate', /climate|warming|carbon|emission|renewable|drought|flood|wildfire|cyclone/i],
];

test.describe('category quality', () => {
  for (const [category, signal] of cases) {
    test(`${category} stories are category-relevant and attributed`, async ({ page }) => {
      await page.goto('/');

      const tab = page.locator('[data-cat="' + category + '"]');
      await expect(tab).toBeVisible();
      await tab.click();

      await expect(page.locator('#listTitle')).toContainText(category);
      await expect(page.locator('#storyCount')).not.toHaveText('0 stories');

      const cards = page.locator('#grid .card');
      await expect(cards.first()).toBeVisible();
      const count = await cards.count();
      expect(count, `${category} should render stories`).toBeGreaterThan(0);

      let relevantCount = 0;
      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const text = await card.innerText();
        if (signal.test(text)) relevantCount++;

        await expect(card.locator('.country-tag')).toBeVisible();
        const country = (await card.locator('.country-tag').innerText()).trim();
        expect(country, `${category} story ${i + 1} should expose country attribution`).not.toBe('');
      }

      expect(relevantCount, `${category} should contain category-relevant signals`).toBeGreaterThan(0);
    });
  }
});
