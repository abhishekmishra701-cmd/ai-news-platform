const { test, expect } = require('@playwright/test');

test.describe('Global News UI quality', () => {
  test('uses Global News branding and not AI News', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.brand')).toContainText('GLOBAL NEWS');
    await expect(page.locator('.brand')).not.toContainText('AI NEWS');
  });

  test('homepage has exactly one global language selector and keeps the API state separate', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#global-news-language-selector')).toHaveCount(1);
    await expect(page.locator('.state')).toContainText('API connected');
    await expect(page.locator('.state')).not.toContainText('English');
  });

  test('story reader shows all 21 most-spoken languages with correct numbering', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const story={id:'ui-quality-story',headline:'Global News UI quality story',summary:'A source summary with enough context for the story reader.',body:'Officials provided additional context about the development. Authorities said the response would continue while verified information was gathered from responsible agencies. The publisher reported that further updates would be issued as facts were confirmed.',country:'Global',category:'World',verification_status:'verified',source_count:1,sources:[{publisher:'Example Publisher',title:'Global News UI quality story',url:'https://example.com/story'}]};
      window.__GLOBAL_NEWS_API_STORIES__=[story];window.__GLOBAL_NEWS_STORIES__=[story];
      const b=document.createElement('button');b.setAttribute('data-open','ui-quality-story');document.body.appendChild(b);b.click();b.remove();
    });
    await expect(page.locator('.ai-side-card h3').filter({hasText:'Most Spoken Languages'})).toBeVisible();
    const rows=page.locator('.ai-langs > div');
    await expect(rows).toHaveCount(21);
    await expect(rows.nth(0)).toContainText('1.');
    await expect(rows.nth(20)).toContainText('21.');
  });

  test('translation selector changes the active site language', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const story={id:'translation-ui-story',headline:'Translation selector story',summary:'A source summary for translation testing.',body:'Officials provided additional verified context and said further updates would follow from responsible agencies.',country:'Global',category:'World',verification_status:'verified',source_count:1,sources:[{publisher:'Example Publisher',title:'Translation selector story',url:'https://example.com/story'}]};
      window.__GLOBAL_NEWS_API_STORIES__=[story];window.__GLOBAL_NEWS_STORIES__=[story];
      const b=document.createElement('button');b.setAttribute('data-open','translation-ui-story');document.body.appendChild(b);b.click();b.remove();
    });
    const select=page.locator('#aiStoryLanguage');
    await expect(select).toBeVisible();
    await select.selectOption({label:'Hindi'});
    await expect.poll(()=>page.evaluate(()=>localStorage.getItem('globalNewsLanguage'))).toBe('hi');
  });

  test('homepage translates dynamic content after Hindi selection', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero h1')).toBeVisible({timeout:20000});
    await expect(page.locator('.card h3').first()).toBeVisible({timeout:20000});
    const heroEnglish=await page.locator('.hero h1').innerText();
    const cardEnglish=await page.locator('.card h3').first().innerText();
    await page.locator('#global-news-language-selector').selectOption('hi');
    await expect.poll(()=>page.locator('.hero h1').innerText(),{timeout:20000}).not.toBe(heroEnglish);
    await expect.poll(()=>page.locator('.card h3').first().innerText(),{timeout:20000}).not.toBe(cardEnglish);
    await expect(page.locator('#listTitle')).toContainText('शीर्ष');
    await expect(page.locator('.country-picker label')).toHaveText('देश');
    const hindiHero=await page.locator('.hero h1').innerText();
    const hindiCard=await page.locator('.card h3').first().innerText();
    expect(hindiHero).not.toBe(heroEnglish);
    expect(hindiCard).not.toBe(cardEnglish);
    await page.reload();
    await expect(page.locator('.hero h1')).toBeVisible({timeout:20000});
    await expect.poll(()=>page.locator('.hero h1').innerText(),{timeout:20000}).not.toBe(heroEnglish);
    await expect.poll(()=>page.locator('.card h3').first().innerText(),{timeout:20000}).not.toBe(cardEnglish);
    await expect(page.locator('#global-news-language-selector')).toHaveValue('hi');
  });
});
