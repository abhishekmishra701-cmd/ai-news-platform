(()=>{'use strict';
if(window.__GN_RELATED_NAV_HOTFIX_V3__)return;window.__GN_RELATED_NAV_HOTFIX_V3__=true;
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
function resolveId(btn){let id=clean(btn.getAttribute('data-open')||btn.getAttribute('data-story-id'));if(id)return id;const title=clean(btn.querySelector('.side-title')?.textContent).toLowerCase();if(!title)return '';for(const pool of [window.__GLOBAL_NEWS_API_STORIES__,window.__GLOBAL_NEWS_STORIES__,window.stories])if(Array.isArray(pool)){const s=pool.find(x=>clean(x?.headline||x?.title).toLowerCase()===title);if(s)return String(s.id??s.story_id??'')}return ''}
function go(btn){const id=resolveId(btn);if(!id)return false;const fn=window.__GLOBAL_NEWS_OPEN_STORY__;if(typeof fn==='function'){fn(id);return true}window.__GN_PENDING_RELATED_ID__=id;return false}
function handle(e){const btn=e.target?.closest?.('.ai-side-card .side-link');if(!btn)return;const id=resolveId(btn);if(!id)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();go(btn)}
document.addEventListener('click',handle,true);
document.addEventListener('pointerdown',e=>{const btn=e.target?.closest?.('.ai-side-card .side-link');if(btn){btn.style.cursor='pointer'}},true);
})();
