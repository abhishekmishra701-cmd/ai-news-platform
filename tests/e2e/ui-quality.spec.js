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


  test('story reader translates shell, sidebar, and source-grounded article content together', async ({ page }) => {
    await page.goto('/');
    await expect.poll(()=>page.evaluate(()=>Array.isArray(window.__GLOBAL_NEWS_API_STORIES__)&&window.__GLOBAL_NEWS_API_STORIES__.length),{timeout:30000}).toBeGreaterThan(0);
    const open=page.locator('[data-open]').first();
    await expect(open).toBeVisible();
    await open.click();
    await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
    await expect(page.locator('#storyReaderBrief')).toBeVisible({timeout:30000});
    const englishTitle=await page.locator('.story-reader-head h1').innerText();
    await page.locator('#aiStoryLanguage').selectOption('hi');
    await expect.poll(()=>page.locator('.story-reader-back').innerText(),{timeout:30000}).toContain('खबरों');
    await expect.poll(()=>page.locator('.story-reader-section h2').first().innerText(),{timeout:30000}).toContain('संक्षिप्त');
    await expect.poll(()=>page.locator('.ai-side-card h3').first().innerText(),{timeout:30000}).toContain('संबंधित');
    await expect.poll(()=>page.locator('.story-reader-head h1').innerText(),{timeout:30000}).not.toBe(englishTitle);
  });

  test('language translation does not return cross-language placeholder text', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#global-news-language-selector')).toBeVisible();
    await page.locator('#global-news-language-selector').selectOption('fr');
    await expect.poll(()=>page.locator('#countrySearch').getAttribute('placeholder'),{timeout:30000}).toMatch(/[A-Za-zÀ-ÿ]/);
    await expect(page.locator('#countrySearch')).not.toHaveAttribute('placeholder',/[㐀-鿿]/);
  });


  test('French selection stays French across homepage and Story Reader without Chinese/English leakage', async ({ page }) => {
    await page.goto('/');
    await expect.poll(()=>page.evaluate(()=>Array.isArray(window.__GLOBAL_NEWS_API_STORIES__)&&window.__GLOBAL_NEWS_API_STORIES__.length),{timeout:30000}).toBeGreaterThan(0);
    await page.locator('#global-news-language-selector').selectOption('fr');
    await expect.poll(()=>page.locator('#q').getAttribute('placeholder'),{timeout:30000}).toBe('Rechercher des actualités, sujets, pays ou sources…');
    await expect(page.locator('#q')).not.toHaveAttribute('placeholder',/[㐀-鿿]/);
    const open=page.locator('[data-open]').first();
    await expect(open).toBeVisible();
    await open.click();
    await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
    await expect.poll(()=>page.locator('.story-reader-back').innerText(),{timeout:30000}).toContain('Retour');
    await expect.poll(()=>page.locator('.story-reader-section h2').first().innerText(),{timeout:30000}).toContain('Résumé');
    await expect.poll(()=>page.locator('.ai-side-card h3').first().innerText(),{timeout:30000}).toContain('Articles connexes');
    await expect(page.locator('.ai-side-card h3').first()).not.toContainText('Related');
    await expect(page.locator('.story-reader-back')).not.toContainText('Back to stories');
  });


  test('language state is single-source-of-truth and switching back to English clears prior translation', async ({ page }) => {
    await page.goto('/');
    await expect.poll(()=>page.evaluate(()=>Array.isArray(window.__GLOBAL_NEWS_API_STORIES__)&&window.__GLOBAL_NEWS_API_STORIES__.length),{timeout:30000}).toBeGreaterThan(0);
    await page.locator('#global-news-language-selector').selectOption('ru');
    await expect.poll(()=>page.locator('#nav').innerText(),{timeout:30000}).toContain('Главная');
    await expect(page.locator('#global-news-language-selector')).toHaveValue('ru');
    await page.locator('#global-news-language-selector').selectOption('en');
    await expect.poll(()=>page.locator('#nav').innerText(),{timeout:30000}).toContain('Home');
    await expect(page.locator('#global-news-language-selector')).toHaveValue('en');
    await expect(page.locator('#nav').innerText()).not.toContain('Главная');
  });

  test('PM India source article returns source-grounded Story Brief and Full Report', async ({ request }) => {
    const response=await request.post('/api/story-content',{data:{story:{
      headline:'PM inaugurates International Conference on “The Future of Environment and Climate Dynamics”',
      summary:'Prime Minister Narendra Modi inaugurated the international conference in New Delhi.',
      country:'India',category:'Climate',publisher:'PM India',
      sources:[{publisher:'PM India',title:'PM inaugurates International Conference on “The Future of Environment and Climate Dynamics”',url:'https://www.pmindia.gov.in/en/news_updates/pm-to-inaugurate-international-conference-on-the-future-of-environment-and-climate-dynamics-on-19-september/'}]
    }}});
    expect(response.ok()).toBeTruthy();
    const body=await response.json();
    expect(body.retrieval.status).toBe('success');
    expect(body.brief.points.length).toBeGreaterThanOrEqual(2);
    expect(body.report.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(body.source.publisher).toMatch(/PM India/i);
  });


  test('translation API returns real target-language text', async ({ request }) => {
    const response = await request.post('/api/translate', {
      data: { text: 'Pune Businessman Fakes Immigration Issue To Hide Trip With Woman From Wife', to: 'fr' }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.text).toBeTruthy();
    expect(body.text).not.toContain('Pune Businessman Fakes Immigration Issue');
    expect(body.text).toMatch(/[À-ÿA-Za-z]/);
  });

  test('switching Hindi to French never leaves translated homepage content in the previous language', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero h1')).toBeVisible({timeout:30000});
    const english = await page.locator('.hero h1').innerText();
    await page.locator('#global-news-language-selector').selectOption('hi');
    await expect.poll(()=>page.locator('.hero h1').innerText(),{timeout:30000}).not.toBe(english);
    await page.locator('#global-news-language-selector').selectOption('fr');
    await expect.poll(()=>page.locator('#q').getAttribute('placeholder'),{timeout:30000}).toBe('Rechercher des actualités, sujets, pays ou sources…');
    await expect.poll(()=>page.locator('.hero h1').innerText(),{timeout:30000}).not.toBe(english);
    await expect(page.locator('.hero h1')).not.toContainText(/[अ-ह]/);
  });

});
