(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__)return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
function load(src){const s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
// Keep the Story Reader deterministic: one reader core, one UI shell, one i18n layer.
load('./phase6a-runtime.js?v=p1-1');
load('./i18n-final.js?v=p0-9');
load('./story-reader-core-v3.js?v=1');
load('./ui-shell-v2.js?v=10');
})();
