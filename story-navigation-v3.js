(()=>{'use strict';
if(window.__GN_STORY_NAV_V3__)return;
window.__GN_STORY_NAV_V3__=true;
const urlFor=id=>{const u=new URL(window.location.href);u.searchParams.set('story',String(id));return u.pathname+u.search};
const convert=()=>{document.querySelectorAll('[data-open]').forEach(el=>{const id=el.getAttribute('data-open');if(!id||el.dataset.gnNavV3==='1')return;el.dataset.gnNavV3='1';const a=document.createElement('a');a.href=urlFor(id);a.className=el.className;a.innerHTML=el.innerHTML;for(const x of [...el.attributes])if(!['data-open','class','id'].includes(x.name))a.setAttribute(x.name,x.value);a.dataset.gnStoryNav='1';a.style.cursor='pointer';el.replaceWith(a)})};
const openFromUrl=()=>{const id=new URL(window.location.href).searchParams.get('story');if(!id)return false;const tryOpen=()=>{const open=window.__GLOBAL_NEWS_OPEN_STORY__;if(typeof open!=='function')return false;try{open(String(id));const u=new URL(window.location.href);u.searchParams.delete('story');history.replaceState({},'',u.pathname+(u.search?u.search:'')+(u.hash||''));return true}catch(e){console.warn('story URL navigation failed',e);return false}};if(tryOpen())return true;let n=0;const t=setInterval(()=>{if(tryOpen()||++n>60)clearInterval(t)},250);return true};
const start=()=>{convert();openFromUrl();const mo=new MutationObserver(convert);mo.observe(document.body,{childList:true,subtree:true});setInterval(convert,500)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
