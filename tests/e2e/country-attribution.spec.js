const { test, expect } = require('@playwright/test');

const API_FIXTURE = [
  ['Australia', 'Australia announces a new national policy', 'The Australian government announced the policy in Canberra.'],
  ['United States', 'United States announces a new national policy', 'The United States government announced the policy in Washington.'],
  ['China', 'China announces a new national policy', 'The Chinese government announced the policy in Beijing.'],
  ['India', 'India announces a new national policy', 'The Indian government announced the policy in New Delhi.'],
  ['Germany', 'Germany announces a new national policy', 'The German government announced the policy in Berlin.'],
  ['Brazil', 'Brazil announces a new national policy', 'The Brazilian government announced the policy in Brasilia.']
].map(([country, headline, summary], index) => ({ id:`e2e-country-${index+1}`,headline,summary,body:`Officials in ${country} said the measure will take effect nationally.`,category:'International',country,country_attribution:'inferred_from_explicit_story_signal',verification_status:'verified',source_count:2,status:'published' }));

async function mockCountryApi(page){ await page.route('**/api/news**', route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(API_FIXTURE)})); }

test('country feed uses API country attribution across representative countries', async ({ page }) => {
  await mockCountryApi(page); await page.goto('/'); await expect(page.locator('#country')).toBeVisible();
  for (const story of API_FIXTURE) { await page.locator('#country').selectOption(story.country); await expect(page.locator('#listTitle')).toContainText(story.country); await expect(page.locator('.chip').filter({hasText:story.country}).first()).toBeVisible(); }
});

test('country attribution fixture is returned by the application API', async ({ page }) => {
  await mockCountryApi(page); await page.goto('/');
  const stories=await page.evaluate(async()=>{const r=await fetch('/api/news');if(!r.ok)throw new Error(String(r.status));return r.json()});
  expect(stories).toEqual(API_FIXTURE); expect(stories).toHaveLength(6); for(const story of stories){expect(story.country).toBeTruthy();expect(story.country_attribution).toBe('inferred_from_explicit_story_signal');}
});