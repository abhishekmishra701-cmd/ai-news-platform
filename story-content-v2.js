(()=>{
  'use strict';
  const MIN_DISTINCT=120;
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function meaningful(body,brief){
    const a=norm(body),b=norm(brief);
    if(a.length<MIN_DISTINCT) return false;
    if(a===b || a.includes('Coverage is currently filed under') || a.includes('source is represented in the live feed')) return false;
    return a.length>b.length+60 || !a.startsWith(b.slice(0,Math.min(80,b.length)));
  }
  function storyForOpenArticle(root){
    const text=norm(root.querySelector('h1')?.textContent);
    return (window.__GLOBAL_NEWS_API_STORIES__||window.__GLOBAL_NEWS_STORIES__||[]).find(s=>norm(s.headline)===text)||null;
  }
  function section(root,title){
    return [...root.querySelectorAll('h1,h2,h3')].find(h=>norm(h.textContent).toLowerCase()===title.toLowerCase());
  }
  function replaceAfter(heading,html){
    if(!heading) return;
    let n=heading.nextElementSibling;
    if(!n) return;
    n.innerHTML=html;
  }
  function enhance(root){
    const article=root.querySelector('#article')||root;
    if(!article || article.dataset.storyContentV2==='1') return;
    const briefHeading=section(article,'Story Brief');
    const reportHeading=section(article,'Full Report');
    if(!briefHeading || !reportHeading) return;
    const story=storyForOpenArticle(article)||{};
    const briefText=norm(story.summary||briefHeading.nextElementSibling?.textContent);
    const bodyText=norm(story.body||story.content||story.description||'');
    if(briefText){
      const sentences=briefText.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[briefText];
      const points=sentences.map(norm).filter(Boolean).slice(0,3);
      replaceAfter(briefHeading,`<ul>${points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`);
    }
    if(meaningful(bodyText,briefText)){
      replaceAfter(reportHeading,`<p class="story-content-v2-report">${esc(bodyText)}</p>`);
    }else{
      replaceAfter(reportHeading,'<div class="story-content-v2-limited"><strong>Additional source-grounded detail is not available for this story yet.</strong><br>This live update currently provides a short publisher summary only. The platform will not repeat that same text or fabricate a longer report. Open the original source when available for the publisher\'s complete article.</div>');
    }
    article.dataset.storyContentV2='1';
  }
  function scan(){ enhance(document.querySelector('#detail:not(.hidden)')||document.body); }
  const style=document.createElement('style');
  style.textContent='.story-content-v2-report{white-space:pre-line;line-height:1.75;color:#344054}.story-content-v2-limited{line-height:1.7;padding:15px 16px;border:1px solid #e4e7ec;border-radius:12px;background:#f8fafc;color:#475467}.story-section h2+ul{margin-top:10px;padding-left:22px}.story-section h2+ul li{margin-bottom:9px;line-height:1.65}';
  document.head.appendChild(style);
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(scan,0),true);
  setTimeout(scan,50);
})();
