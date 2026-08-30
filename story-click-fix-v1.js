(()=>{'use strict';
if(window.__GN_STORY_CLICK_FIX_V1__)return;
window.__GN_STORY_CLICK_FIX_V1__=true;
const bind=()=>{
  document.querySelectorAll('[data-open]').forEach(el=>{
    if(el.dataset.gnDirectStoryBound==='1')return;
    el.dataset.gnDirectStoryBound='1';
    el.addEventListener('click',e=>{
      const id=el.getAttribute('data-open');
      if(!id)return;
      const open=window.__GLOBAL_NEWS_OPEN_STORY__;
      if(typeof open!=='function')return;
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      open(String(id));
    },true);
  });
};
const mo=new MutationObserver(bind);
function start(){bind();mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
