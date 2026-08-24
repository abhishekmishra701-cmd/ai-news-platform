const { test, expect } = require('@playwright/test');

const REAL_SOURCE = 'https://devpolicy.org/malnutrition-pervasive-but-can-be-fixed-20190211/';

test.describe('Story Reader content quality', () => {
  test('limited-content story never repeats the brief as a fake full report', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const story={id:'limited-e2e',headline:'Example story with limited publisher text',summary:'A single source sentence is available from the live feed.',body:'',country:'India',verification_status:'developing',source_count:1,sources:[{publisher:'Example Publisher',title:'Example story with limited publisher text',url:'https://example.com/story'}]};
      window.__GLOBAL_NEWS_API_STORIES__=[story];window.__GLOBAL_NEWS_STORIES__=[story];
      const b=document.createElement('button');b.setAttribute('data-open','limited-e2e');document.body.appendChild(b);b.click();b.remove();
    });
    await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
    await expect(page.locator('#storyReaderBrief')).toContainText('A single source sentence');
    await expect(page.locator('#storyReaderReport')).toContainText('Full Report could not be retrieved');
    await expect(page.locator('#storyReaderReport')).not.toContainText('A single source sentence is available from the live feed.');
    await expect(page.locator('#storyReaderSources a')).toHaveAttribute('href','https://example.com/story');
  });

  test('substantive body produces report detail distinct from the brief', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const story={id:'full-e2e',headline:'Example story with substantive source reporting',summary:'The first confirmed development was reported by the source. Officials said the situation was being monitored.',body:'The first confirmed development was reported by the source. Officials said the situation was being monitored. A later update added that emergency teams were deployed to assess the impact across several affected areas. Authorities also asked residents to follow official guidance while investigators gathered more information about the incident and its consequences. The publisher said further verified updates would be issued as new facts became available from responsible agencies and local officials.',country:'Global',verification_status:'verified',source_count:1,sources:[{publisher:'Example Publisher',title:'Example story with substantive source reporting',url:'https://example.com/full'}]};
      window.__GLOBAL_NEWS_API_STORIES__=[story];window.__GLOBAL_NEWS_STORIES__=[story];
      const b=document.createElement('button');b.setAttribute('data-open','full-e2e');document.body.appendChild(b);b.click();b.remove();
    });
    await expect(page.locator('#storyReaderReport')).toContainText('A later update added');
    await expect(page.locator('#storyReaderReport')).not.toContainText('Full Report could not be retrieved');
  });

  test('live-feed architecture sends the complete story payload to the isolated source reader endpoint', async ({ page }) => {
    let captured=null;
    await page.route('**/api/story-content', async route => {
      captured=JSON.parse(route.request().postData() || '{}');
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,brief:{points:['The publisher confirmed a later development involving emergency response teams.','Authorities provided additional verified context and said further updates would follow.','Officials said the situation remained under active assessment.','The publisher reported that additional verified information would be released after review.']},report:{label:'Source-grounded full report',paragraphs:['The publisher reported a later development involving emergency response teams.','Authorities provided additional verified context and said further updates would follow.','The publisher also reported that additional verified information would be released as officials completed their assessment.']},source:{publisher:'Example Publisher',title:'Live feed source story',url:'https://example.com/live'}})});
    });
    await page.goto('/');
    await page.evaluate(() => {
      const story={id:'live-feed-e2e',headline:'Live feed source story',summary:'A short verified source summary.',body:'',country:'Global',verification_status:'developing',source_count:1,sources:[{publisher:'Example Publisher',title:'Live feed source story',url:'https://example.com/live'}]};
      window.__GLOBAL_NEWS_API_STORIES__=[story];window.__GLOBAL_NEWS_STORIES__=[story];
      const b=document.createElement('button');b.setAttribute('data-open','live-feed-e2e');document.body.appendChild(b);b.click();b.remove();
    });
    await expect.poll(()=>captured,{timeout:12000}).not.toBeNull();
    await expect(page.locator('#storyReaderReport')).toContainText('later development involving emergency response teams');
    expect(captured.story.sources[0].url).toBe('https://example.com/live');
    expect(captured.story.headline).toBe('Live feed source story');
  });

  test('REAL integration: live-feed story with no body retrieves publisher content into Full Report', async ({ page }) => {
    await page.route('**/api/news', async route => {
      const story={id:'real-source-e2e',headline:'Malnutrition: a pervasive problem, but one that can be fixed',summary:'A live-feed item with a headline and source attribution but no stored article body.',body:'',country:'Global',category:'World',verification_status:'developing',source_count:1,sources:[{publisher:'Devpolicy Blog',title:'Malnutrition: a pervasive problem, but one that can be fixed',url:REAL_SOURCE}]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([story])});
    });
    await page.goto('/');
    const open=page.locator('[data-open="real-source-e2e"]').first();
    await expect(open).toBeVisible();
    await open.click();
    await expect(page.locator('#storyReaderReport')).toContainText('double burden', {timeout:30000});
    await expect(page.locator('#storyReaderReport')).toContainText('national nutrition policy');
    await expect(page.locator('#storyReaderReport')).not.toContainText('Full Report could not be retrieved');
    await expect(page.locator('#storyReaderReport')).not.toContainText('A live-feed item with a headline and source attribution but no stored article body.');
    await expect(page.locator('#storyReaderSources a')).toHaveAttribute('href',REAL_SOURCE);
  });

  test('REAL endpoint: isolated source retrieval returns 4-6 brief points and a distinct full report', async ({ page }) => {
    await page.goto('/');
    const result=await page.evaluate(async ({ source }) => {
      const response=await fetch('/api/story-content',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({story:{id:'endpoint-real-e2e',headline:'Malnutrition: a pervasive problem, but one that can be fixed',summary:'A live-feed story with no stored body.',body:'',category:'World',verification_status:'developing',source_count:1,sources:[{publisher:'Devpolicy Blog',title:'Malnutrition: a pervasive problem, but one that can be fixed',url:source}]}})});
      return {status:response.status,data:await response.json()};
    }, {source:REAL_SOURCE});
    expect(result.status).toBe(200);
    expect(result.data.ok).toBe(true);
    expect(result.data.brief.points.length).toBeGreaterThanOrEqual(4);
    expect(result.data.brief.points.length).toBeLessThanOrEqual(6);
    expect(result.data.report.paragraphs.length).toBeGreaterThanOrEqual(3);
    expect(result.data.report.paragraphs.join(' ')).toContain('Pacific');
    expect(result.data.report.paragraphs.join(' ')).not.toContain(result.data.brief.points[0]);
  });
});
