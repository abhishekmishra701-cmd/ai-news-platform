/* Ensures multilingual UI is applied after the app finishes rendering. */
(function(){'use strict';
var running=false;
function current(){return (window.GlobalNewsI18n&&window.GlobalNewsI18n.getLanguage&&window.GlobalNewsI18n.getLanguage())||localStorage.getItem('globalNewsLanguage')||'en'}
function sync(){if(running)return;running=true;try{if(window.GlobalNewsI18n&&window.GlobalNewsI18n.apply)window.GlobalNewsI18n.apply();var sel=document.getElementById('global-news-language-selector');if(sel){sel.value=current();sel.setAttribute('title','Interface language — news stories remain in their original source language');}var legacy=document.getElementById('languageToggle');if(legacy)legacy.remove();}catch(e){console.error('i18n sync',e)}running=false}
function boot(){sync();var root=document.documentElement;var queued=false;new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync()})}).observe(root,{childList:true,subtree:true});[50,150,300,600,1200,2500].forEach(function(ms){setTimeout(sync,ms)});document.addEventListener('globalNewsLanguageChange',function(){[0,50,150].forEach(function(ms){setTimeout(sync,ms)})});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();