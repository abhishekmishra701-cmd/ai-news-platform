(()=>{'use strict';
if(window.__GN_STORY_CLICK_ABSOLUTE_V5__)return;
window.__GN_STORY_CLICK_ABSOLUTE_V5__=true;
const getStory=id=>{const m=window.__GLOBAL_NEWS_STORY_MAP__;if(m&&typeof m.get==='function'){const s=m.get(String(id));if(s)return s}for(const p of [window.__GLOBAL_NEWS_API_STORIES__,window.__GLOBAL_NEWS_STORIES__,window.stories])if(Array.isArray(p)){const s=p.find(x=>String(x?.id)===String(id)||String(x?.story_id)===String(id));if(s)return s}return null};
const waitOpen=id=>{let n=0;const t=setInterval(()=>{const fn=window.__GLOBAL_NEWS_OPEN_STORY__;if(typeof fn==='function'&&getStory(id)){clearInterval(t);try{fn(String(id))}catch(e){console.error('absolute story open failed',e)}return}if(++n>600){clearInterval(t);console.error('absolute story open timeout',id)}},25)};
const intercept=e=>{const el=e.target?.closest?.('[data-open]');if(!el)return;const id=el.getAttribute('data-open');if(!id)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();waitOpen(id)};
window.addEventListener('click',intercept,true);
window.addEventListener('pointerup',e=>{const el=e.target?.closest?.('[data-open]');if(el){el.style.pointerEvents='auto';el.style.cursor='pointer'}},true);
})();
