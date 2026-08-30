(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;
function load(src,attr){const s=document.createElement('script');s.src=src;s.async=false;if(attr)s.dataset.gnReaderCore='1';document.head.appendChild(s)}
load('./story-click-direct-v4.js?v=1');
load('./story-navigation-v4.js?v=8');
load('./phase6a-runtime.js?v=p1-0');
load('./i18n-final.js?v=p0-8');
load('./phase6a-story-content-guard-v2.js?v=6');
load('./story-reader-retrieval-fallback.js?v=9');
load('./story-reader-core-v2.js?v=36',true);
load('./ui-shell-v2.js?v=9');
load('./story-report-recovery-v2.js?v=11');
load('./global-news-brand-override.js?v=7');
load('./ui-quality-fixes-v1.js?v=7');
load('./global-news-ui-fix-v2.js?v=8');
load('./phase6a-story-quality-v1.js?v=7');
load('./home-experience-v1.js?v=5');
load('./phase6a-e2e-stability-v1.js?v=4');
load('./story-click-fix-v2.js?v=5');
})();
