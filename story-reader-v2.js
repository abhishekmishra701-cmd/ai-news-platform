(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
function load(src){const s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('./phase6a-runtime.js?v=p0-2');
load('./i18n-final.js?v=p0-2');
load('./story-reader-retrieval-fallback.js?v=1');
load('./story-reader-core-v2.js?v=16');
})();
