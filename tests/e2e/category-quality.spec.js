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
    test(`${category} stories have category-relevant content`, async ({ page }) => {
      const response = await page.request.get('/api/news');
      expect(response.ok()).toBeTruthy();
      const stories = await response.json();
      const matching = stories.filter(s => String(s.category || '').toLowerCase() === category.toLowerCase());
      expect(matching.length, `${category} should have stories`).toBeGreaterThan(0);
      const relevant = matching.filter(s => signal.test(`${s.headline || ''} ${s.summary || ''} ${s.body || ''}`));
      expect(relevant.length, `${category} should contain category signals`).toBeGreaterThan(0);
      expect(matching.every(s => s.category_attribution), `${category} stories should expose category attribution`).toBeTruthy();
      expect(matching.every(s => s.country_attribution), `${category} stories should expose country attribution`).toBeTruthy();
    });
  }
});
