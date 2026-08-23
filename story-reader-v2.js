(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
const originalFetch=window.fetch.bind(window);
const SUPABASE_FUNCTION='/functions/v1/story-brief';
function decodeHtml(value){let current=String(value??'');for(let i=0;i<4;i++){const textarea=document.createElement('textarea');textarea.innerHTML=current;const decoded=textarea.value;if(decoded===current)break;current=decoded}return current}
function escapeHtml(value){return decodeHtml(value).replace(/[&<>\\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[c]))}
function enhanceReport(data){const paragraphs=Array.isArray(data?.report?.paragraphs)?data.report.paragraphs.filter(Boolean):[];const box=document.querySelector('#storyReaderReport');if(!box||!paragraphs.length)return;const briefPoints=Array.isArray(data?.brief?.points)?data.brief.points.filter(Boolean):[];const reportText=paragraphs.map(decodeHtml).join(' ').trim().toLowerCase();const briefText=briefPoints.map(decodeHtml).join(' ').trim().toLowerCase();if(!reportText)return;box.innerHTML='<div class="story-reader-label">'+escapeHtml(data?.report?.label||'Source-grounded report')+'</div>'+paragraphs.map(x=>'<p>'+escapeHtml(x)+'</p>').join('')+'<div class="story-reader-note">'+escapeHtml(data?.report?.coverage||'The report is grounded in source material available to the platform.')+'</div>';box.dataset.reportSource='story-brief-v6';box.dataset.briefWordCount=String(briefText.split(/\s+/).filter(Boolean).length);box.dataset.reportWordCount=String(reportText.split(/\s+/).filter(Boolean).length)}
window.fetch=async function(...args){const response=await originalFetch(...args);try{const input=args[0],url=typeof input==='string'?input:(input&&input.url)||'';if(String(url).includes(SUPABASE_FUNCTION))response.clone().json().then(data=>setTimeout(()=>enhanceReport(data),75)).catch(()=>{})}catch(_){}return response};
function load(src){const s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('./phase6a-runtime.js?v=p0-1');
load('./i18n-final.js?v=p0-1');
load('./story-reader-core-v2.js?v=8');
})();
