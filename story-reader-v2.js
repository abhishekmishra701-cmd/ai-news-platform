(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
function load(src){const s=document.createElement('script');s.src=src;s.async=false;document.head.appendChild(s)}
load('./phase6a-runtime.js?v=p0-6');
load('./i18n-final.js?v=p0-5');
load('./phase6a-story-content-guard-v2.js?v=3');
load('./story-reader-retrieval-fallback.js?v=6');
load('./story-reader-core-v2.js?v=30');
load('./ui-shell-v2.js?v=6');
load('./story-report-recovery-v2.js?v=8');
load('./global-news-brand-override.js?v=4');
load('./ui-quality-fixes-v1.js?v=4');
load('./global-news-ui-fix-v2.js?v=5');
load('./phase6a-story-quality-v1.js?v=4');
load('./home-experience-v1.js?v=2');
load('./phase6a-e2e-stability-v1.js?v=1');
})();
