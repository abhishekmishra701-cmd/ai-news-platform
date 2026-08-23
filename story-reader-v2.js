(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__)return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
const originalFetch=window.fetch.bind(window);
const STORY_ENDPOINT='/functions/v1/story-brief';
function getActiveLocale(){const raw=document.documentElement.lang||window.__I18N_LOCALE__||window.__GLOBAL_NEWS_LOCALE__||localStorage.getItem('locale')||localStorage.getItem('globalNewsLanguage')||'en';return String(raw).toLowerCase().split('-')[0]}
function withLocale(input,init){const url=typeof input==='string'?input:(input&&input.url)||'';if(String(url).includes(STORY_ENDPOINT)&&init&&String(init.method||'GET').toUpperCase()==='POST'){try{const payload=JSON.parse(String(init.body||'{}'));payload.locale=getActiveLocale();return[input,{...init,body:JSON.stringify(payload)}]}catch(_){}}
return[input,init]}
window.fetch=async function(...args){const [input,init]=withLocale(args[0],args[1]);return originalFetch(input,init)};
const script=document.createElement('script');script.src='./story-reader-core-v2.js?v=6';script.async=false;document.head.appendChild(script);
})();
