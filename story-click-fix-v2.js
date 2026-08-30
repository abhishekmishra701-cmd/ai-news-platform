(()=>{'use strict';
if(window.__GN_STORY_CLICK_FIX_V4__)return;
window.__GN_STORY_CLICK_FIX_V4__=true;
const story=id=>{const m=window.__GLOBAL_NEWS_STORY_MAP__;if(m&&typeof m.get==='function'&&m.get(String(id)))return m.get(String(id));for(const p of [window.__GLOBAL_NEWS_API_STORIES__,window.__GLOBAL_NEWS_STORIES__,window.stories])if(Array.isArray(p)){const s=p.find(x=>String(x?.id)===String(id)||String(x?.story_id)===String(id));if(s)return s}return null};
const ensure=()=>{if(typeof window.__GLOBAL_NEWS_OPEN_STORY__==='function')return;if(!document.querySelector('script[data-gn-click-reader]')){const s=document.createElement('script');s.src='./story-reader-core-v2.js?v=35';s.async=false;s.dataset.gnClickReader='1';document.head.appendChild(s)}};
const open=id=>{let n=0;const t=setInterval(()=>{ensure();const fn=window.__GLOBAL_NEWS_OPEN_STORY__;if(fn&&story(id)){clearInterval(t);try{fn(String(id))}catch(e){console.warn('story click failed',e)}return}if(++n>500){clearInterval(t);console.warn('story click timeout',id)}},40)};
const css=document.createElement('style');css.id='gn-story-click-v4-css';css.textContent='.hero .read,.card .read,.gn-editorial-card button[data-open]{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:38px!important;height:38px!important;position:relative!important;z-index:1000!important;pointer-events:auto!important;cursor:pointer!important}';document.head.appendChild(css);
document.addEventListener('click',e=>{const el=e.target?.closest?.('[data-open]');if(!el)return;const id=el.getAttribute('data-open');if(!id)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(id)},true);
})();
