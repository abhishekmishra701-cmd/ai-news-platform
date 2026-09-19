(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__)return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
function load(src,done){const s=document.createElement('script');s.src=src;s.async=false;if(done)s.onload=done;document.head.appendChild(s)}
function loadReader(){load('./story-reader-core-v3.js?v=9');load('./ui-shell-v2.js?v=18')}
load('./phase6a-runtime.js?v=p1-14',()=>{
  if(window.__GLOBAL_NEWS_I18N_READY__) loadReader();
  else {window.addEventListener('global-news-i18n-ready',loadReader,{once:true});setTimeout(loadReader,5000)}
});
})();
