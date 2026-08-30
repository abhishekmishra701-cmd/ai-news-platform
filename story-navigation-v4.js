(()=>{'use strict';
if(window.__GN_STORY_NAV_V4__)return;
window.__GN_STORY_NAV_V4__=true;
const canonicalUrl=id=>{const u=new URL(window.location.href);u.searchParams.set('story',String(id));return u.pathname+(u.search?u.search:'')+(u.hash||'')};
const openWhenReady=(id,fromUrl=false)=>{let n=0;const t=setInterval(()=>{const open=window.__GLOBAL_NEWS_OPEN_STORY__;if(typeof open!=='function'){if(++n>300)clearInterval(t);return}clearInterval(t);try{open(String(id));if(fromUrl){const u=new URL(window.location.href);u.searchParams.delete('story');history.replaceState({},'',u.pathname+(u.search?u.search:'')+(u.hash||''));}}catch(e){console.warn('story open failed',e)}},50)};
const consumeStoryUrl=()=>{const u=new URL(window.location.href),id=u.searchParams.get('story');if(!id)return false;openWhenReady(id,true);return true};
const click=e=>{const el=e.target?.closest?.('[data-open]');if(!el)return;const id=el.getAttribute('data-open');if(!id)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
if(typeof window.__GLOBAL_NEWS_OPEN_STORY__==='function'){
 try{window.__GLOBAL_NEWS_OPEN_STORY__(String(id));return}catch(err){console.warn('direct story open failed',err)}
}
window.history.pushState({},'',canonicalUrl(id));openWhenReady(id,false);
};
document.addEventListener('click',click,true);
const start=()=>consumeStoryUrl();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('popstate',()=>{const u=new URL(window.location.href),id=u.searchParams.get('story');if(id)openWhenReady(id,true);else if(typeof window.__GLOBAL_NEWS_BACK_STORY__==='function')window.__GLOBAL_NEWS_BACK_STORY__()});
})();
