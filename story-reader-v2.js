(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
const originalFetch=window.fetch.bind(window);
const STORY_ENDPOINT='/functions/v1/story-brief';
function getActiveLocale(){const raw=document.documentElement.lang||window.__I18N_LOCALE__||window.__GLOBAL_NEWS_LOCALE__||localStorage.getItem('locale')||localStorage.getItem('globalNewsLanguage')||'en';return String(raw).toLowerCase().split('-')[0]}
function withLocale(input,init){const url=typeof input==='string'?input:(input&&input.url)||'';if(String(url).includes(STORY_ENDPOINT)&&init&&String(init.method||'GET').toUpperCase()==='POST'){try{const payload=JSON.parse(String(init.body||'{}'));payload.locale=getActiveLocale();return [input,{...init,body:JSON.stringify(payload)}]}catch(_){}}return [input,init]}
function decodeHtml(value){let current=String(value??'');for(let i=0;i<4;i++){const t=document.createElement('textarea');t.innerHTML=current;const decoded=t.value;if(decoded===current)break;current=decoded}return current}
function esc(v){return decodeHtml(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
function enhanceReport(data){const report=Array.isArray(data?.report?.paragraphs)?data.report.paragraphs.filter(Boolean):[];const box=document.querySelector('#storyReaderReport');if(!box||!report.length)return;box.innerHTML='<div class="story-reader-label">'+esc(data?.report?.label||'Full report')+'</div>'+report.map(x=>'<p>'+esc(x)+'</p>').join('');box.dataset.locale=String(data?.locale||getActiveLocale())}
window.fetch=async function(...args){let [input,init]=withLocale(args[0],args[1]);const response=await originalFetch(input,init);try{const url=typeof input==='string'?input:(input&&input.url)||'';if(String(url).includes(STORY_ENDPOINT))response.clone().json().then(data=>setTimeout(()=>enhanceReport(data),75)).catch(()=>{})}catch(_){}return response};
const script=document.createElement('script');script.src='./story-reader-core-v2.js?v=5';script.async=false;document.head.appendChild(script);
})();
