const { test, expect } = require('@playwright/test');

test.describe('Story Reader content quality', () => {
  test('limited-content story never repeats the brief as a fake full report', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const story={id:'limited-e2e',headline:'Example story with limited publisher text',summary:'A single source sentence is available from the live feed.',body:'',country:'India',verification_status:'developing',source_count:1,sources:[{publisher:'Example Publisher',title:'Example story with limited publisher text',url:'https://example.com/story'}]};
      window.__GLOBAL_NEWS_API_STORIES__=[story];
      window.__GLOBAL_NEWS_STORIES__=[story];
      const b=document.createElement('button');b.setAttribute('data-open','limited-e2e');document.body.appendChild(b);b.click();b.remove();
    });
    await expect(page.locator('#detail')).not.toHaveClass(/hidden/);
    await expect(page.locator('#storyReaderBrief')).toContainText('A single source sentence');
    await expect(page.locator('#storyReaderReport')).toContainText('Limited source content available');
    await expect(page.locator('#storyReaderReport')).not.toContainText('Coverage is currently filed under');
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
    await expect(page.locator('#storyReaderReport')).not.toContainText('Limited source content available');
  });
});
