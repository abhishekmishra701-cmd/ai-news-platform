(()=>{'use strict';
if(window.__AI_NEWS_REPORT_RECOVERY_V2__) return;
window.__AI_NEWS_REPORT_RECOVERY_V2__=true;
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const esc=v=>clean(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function currentStory(){
  const h=clean(document.querySelector('#article .story-reader-head h1')?.textContent||'');
  const pools=[window.__GLOBAL_NEWS_API_STORIES__,window.__GLOBAL_NEWS_STORIES__];
  for(const p of pools){if(Array.isArray(p)){const s=p.find(x=>clean(x?.headline||x?.title)===h);if(s)return s}}
  return null;
}
function variants(headline){
  const h=clean(headline).replace(/\s+-\s+The Portugal News$/i,'').trim();
  const v=[h,h.replace(/^Portugal to have a new\s+/i,'Portugal '),h.replace(/^to have a new\s+/i,''),h.split(/\s+/).slice(0,9).join(' ')];
  return [...new Set(v.filter(x=>x.length>=18))];
}
async function ask(story,headline){
  try{const r=await fetch('/api/story-content',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({story:{...story,headline,summary:story.summary||'',body:story.body||''}}),cache:'no-store'});if(!r.ok)return null;const d=await r.json();const b=Array.isArray(d?.brief?.points)?d.brief.points.filter(Boolean):[];const p=Array.isArray(d?.report?.paragraphs)?d.report.paragraphs.filter(Boolean):[];return b.length>=1&&p.length>=1?d:null}catch{return null}}
async function recover(){
  const report=document.querySelector('#storyReaderReport'),brief=document.querySelector('#storyReaderBrief');
  if(!report||!brief||report.dataset.reportStatus!=='unavailable')return;
  const story=currentStory(); if(!story)return;
  const hs=variants(story.headline||'');
  const results=await Promise.all(hs.map(h=>ask(story,h)));
  const d=results.find(x=>x&&Array.isArray(x.report?.paragraphs)&&x.report.paragraphs.length>=1); if(!d)return;
  const bp=Array.isArray(d.brief?.points)?d.brief.points.filter(Boolean).slice(0,6):[];
  const rp=Array.isArray(d.report?.paragraphs)?d.report.paragraphs.filter(Boolean).slice(0,12):[];
  if(bp.length)brief.innerHTML='<ul>'+bp.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  if(rp.length){report.innerHTML='<div class="story-reader-label">'+esc(d.report?.label||'Source-grounded full report')+'</div>'+rp.map(x=>'<p>'+esc(x)+'</p>').join('')+(d.report?.coverage?'<div class="story-reader-note">'+esc(d.report.coverage)+'</div>':'');report.dataset.reportSource='recovery-v2';report.dataset.reportStatus='success'}
}
const mo=new MutationObserver(()=>setTimeout(()=>{const detail=document.querySelector('#detail');if(detail&&!detail.classList.contains('hidden'))recover()},150));
function init(){const a=document.querySelector('#article');if(a)mo.observe(a,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
