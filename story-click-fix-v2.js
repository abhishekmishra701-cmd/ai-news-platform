(()=>{'use strict';
if(window.__GN_STORY_CLICK_FIX_V3__)return;
window.__GN_STORY_CLICK_FIX_V3__=true;
const stories=()=>[window.__GLOBAL_NEWS_API_STORIES__,window.__GLOBAL_NEWS_STORIES__,window.stories].find(Array.isArray)||[];
const ready=id=>stories().some(s=>String(s?.id)===String(id)||String(s?.story_id)===String(id));
const open=id=>{let n=0;const t=setInterval(()=>{const fn=window.__GLOBAL_NEWS_OPEN_STORY__;if(typeof fn==='function'&&ready(id)){clearInterval(t);try{fn(String(id))}catch(e){console.warn('story click failed',e)}return}if(++n>400)clearInterval(t)},50)};
const css=document.createElement('style');css.id='gn-story-click-v3-css';css.textContent='.hero .read,.card .read,.gn-editorial-card button[data-open]{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:38px!important;height:38px!important;position:relative!important;z-index:100!important;pointer-events:auto!important;cursor:pointer!important}';document.head.appendChild(css);
document.addEventListener('click',e=>{const el=e.target?.closest?.('[data-open]');if(!el)return;const id=el.getAttribute('data-open');if(!id)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open(id)},true);
})();
