(()=>{
'use strict';

const SUPABASE_URL='https://nfqwnrmwyhcycjsfwqfl.supabase.co';
const SUPABASE_KEY='sb_publishable_FXSeGzRWwQ3FbyBWf_z80g_DHlcLcCl';

function initStoryReader(){
  if(window.__GLOBAL_NEWS_STORY_READER_WORKING__) return;
  const home=document.querySelector('#home');
  const detail=document.querySelector('#detail');
  const article=document.querySelector('#article');
  if(!home||!detail||!article) return;
  window.__GLOBAL_NEWS_STORY_READER_WORKING__=true;

  const style=document.createElement('style');
  style.textContent=`
    #detail .detail-toolbar,#detail .back{display:none!important}
    .story-reader-wrap{max-width:980px;margin:0 auto}
    .story-reader-back{height:38px;background:#fff;color:#344054;border:1px solid #d0d5dd;border-radius:9px;padding:0 14px;font-weight:700;cursor:pointer;margin:0 0 18px}
    .story-reader-card{background:#fff;border:1px solid #e4e7ec;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(16,24,40,.06)}
    .story-reader-head{padding:34px 38px 28px;border-bottom:1px solid #eef0f3}
    .story-reader-kicker{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
    .story-reader-head h1{font-size:40px;line-height:1.12;margin:16px 0 12px;color:#101828}
    .story-reader-lead{font-size:17px;line-height:1.7;color:#475467;margin:0}
    .story-reader-section{padding:0 38px;margin-top:28px}
    .story-reader-section h2{font-size:19px;margin:0 0 12px;color:#101828}
    .story-reader-brief{background:#f8fafc;border:1px solid #e7ebf0;border-radius:15px;padding:20px 22px}
    .story-reader-label{font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.5px;color:#194185;margin-bottom:10px}
    .story-reader-brief ul,.story-reader-report ul{margin:0;padding-left:21px}
    .story-reader-brief li,.story-reader-report li{padding:7px 0;line-height:1.7;color:#344054}
    .story-reader-report{font-size:16px;line-height:1.85;color:#344054}
    .story-reader-report p{margin:0 0 16px}
    .story-reader-note{font-size:11px;color:#667085;margin:12px 0 14px;line-height:1.6}
    .story-reader-sources{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .story-reader-source{border:1px solid #e4e7ec;border-radius:13px;padding:16px;background:#fff}
    .story-reader-publisher{font-size:13px;font-weight:850;color:#101828}
    .story-reader-title{font-size:13px;font-weight:650;line-height:1.45;margin-top:7px;color:#344054}
    .story-reader-excerpt{font-size:12px;line-height:1.65;color:#667085;margin-top:9px}
    .story-reader-source a{display:inline-block;margin-top:11px;color:#2563eb;font-size:12px;font-weight:750;text-decoration:none}
    .story-reader-loading,.story-reader-empty{padding:14px;color:#667085;font-size:13px}
    .story-reader-error{padding:18px;border:1px solid #fedf89;border-radius:11px;background:#fffaeb;color:#b54708}
    @media(max-width:700px){.story-reader-head{padding:24px 20px}.story-reader-head h1{font-size:29px}.story-reader-section{padding:0 20px}.story-reader-sources{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function decode(value){
    let s=String(value??'');
    for(let i=0;i<8;i++){
      const ta=document.createElement('textarea');
      ta.innerHTML=s;
      const next=ta.value;
      if(next===s) break;
      s=next;
    }
    return s;
  }
  function esc(value){
    return decode(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function api(path,options){
    return fetch(SUPABASE_URL+'/rest/v1/'+path,Object.assign({headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,Accept:'application/json'}},options||{}));
  }
  function briefApi(id){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),9000);
    return fetch(SUPABASE_URL+'/functions/v1/story-brief',{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({story_id:id}),signal:controller.signal}).finally(()=>clearTimeout(timer));
  }
  function paragraphs(value){
    const text=decode(value).replace(/\r/g,'').trim();
    if(!text) return '';
    return text.split(/\n{2,}|\n|(?<=[.!?])\s+(?=[A-Z0-9“‘])/).map(x=>x.trim()).filter(Boolean).map(x=>'<p>'+esc(x)+'</p>').join('');
  }
  function flag(country){
    const flags={'India':'🇮🇳','Bangladesh':'🇧🇩','Pakistan':'🇵🇰','China':'🇨🇳','Japan':'🇯🇵','South Korea':'🇰🇷','Indonesia':'🇮🇩','Thailand':'🇹🇭','Greece':'🇬🇷','Ukraine':'🇺🇦','Russia':'🇷🇺','United Kingdom':'🇬🇧','United States':'🇺🇸','Canada':'🇨🇦','Australia':'🇦🇺','Saudi Arabia':'🇸🇦','United Arab Emirates':'🇦🇪','Israel':'🇮🇱','Iran':'🇮🇷','Qatar':'🇶🇦','Poland':'🇵🇱','France':'🇫🇷','Germany':'🇩🇪','Italy':'🇮🇹','Spain':'🇪🇸','Brazil':'🇧🇷'};
    return flags[country]||'🌐';
  }
  function report(body,summary,points){
    const b=decode(body).trim();
    const s=decode(summary).trim();
    const p=(Array.isArray(points)?points:[]).map(decode).map(x=>x.trim()).filter(x=>x.length>20);
    if(b.length>=450&&b!==s) return {html:paragraphs(b),note:''};
    if(p.length) return {html:'<div class="story-reader-label">Source-grounded report</div><ul>'+p.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>',note:'This report is synthesized only from source-grounded material available to the platform.'};
    if(s) return {html:paragraphs(s),note:'Only limited source material is currently available for this story.'};
    return {html:'<div class="story-reader-empty">A detailed report is not available yet.</div>',note:''};
  }
  function sourceCards(list){
    if(!list.length) return '<div class="story-reader-empty">Source details are not available for this story yet.</div>';
    return list.map(x=>'<div class="story-reader-source"><div class="story-reader-publisher">'+esc(x.publisher||'Source')+'</div><div class="story-reader-title">'+esc(x.title||'Original report')+'</div>'+(x.excerpt?'<div class="story-reader-excerpt">'+esc(x.excerpt)+'</div>':'')+(x.url?'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Open original source →</a>':'')+'</div>').join('');
  }
  function back(){
    detail.classList.add('hidden');
    home.classList.remove('hidden');
    article.innerHTML='';
    window.scrollTo(0,0);
  }
  async function openStory(id){
    if(!id) return;
    home.classList.add('hidden');
    detail.classList.remove('hidden');
    window.scrollTo(0,0);
    article.innerHTML='<div class="story-reader-wrap"><button type="button" class="story-reader-back">← Back to stories</button><div class="story-reader-loading">Opening story…</div></div>';
    article.querySelector('.story-reader-back').onclick=back;
    try{
      const response=await api('news_stories?id=eq.'+encodeURIComponent(id)+'&select=id,slug,headline,summary,body,category,country,verification_status,source_count,correction_notice');
      if(!response.ok) throw new Error('Story could not be loaded.');
      const rows=await response.json();
      const story=rows[0];
      if(!story) throw new Error('Story not found.');
      const status=decode(story.verification_status||'Unverified').toUpperCase();
      const country=decode(story.country||'Global');
      const loading=article.querySelector('.story-reader-loading');
      if(!loading) return;
      loading.outerHTML='<article class="story-reader-card"><header class="story-reader-head"><div class="story-reader-kicker"><span class="badge">'+esc(status)+'</span><span class="pill">'+esc(story.source_count||0)+' sources</span><span class="country-tag">'+flag(country)+' '+esc(country)+'</span><span class="pill">'+esc(story.category||'General')+'</span></div><h1>'+esc(story.headline||'')+'</h1><p class="story-reader-lead">'+esc(story.summary||'A source-grounded report compiled from available reporting.')+'</p></header><section class="story-reader-section"><h2>Story Brief</h2><div id="storyReaderBrief" class="story-reader-brief"><div class="story-reader-label">Source-grounded brief</div><div class="story-reader-loading">Preparing key points from available source material…</div></div></section><section class="story-reader-section"><h2>Full Report</h2><div id="storyReaderReport" class="story-reader-report">'+report(story.body,story.summary,[]).html+'</div></section><section class="story-reader-section"><h2>Sources & attribution</h2><div id="storyReaderSources" class="story-reader-sources"><div class="story-reader-loading">Loading source attribution…</div></div></section>'+(story.correction_notice?'<div class="story-reader-note"><strong>Correction:</strong> '+esc(story.correction_notice)+'</div>':'')+'<div class="story-reader-note">Verification: <strong>'+esc(status)+'</strong>. The brief is grounded in source material available to the platform. Developing or unverified reporting is not presented as confirmed fact.</div></article>';
      try{
        const briefResponse=await briefApi(id);
        if(!briefResponse.ok) throw new Error('brief unavailable');
        const data=await briefResponse.json();
        const points=Array.isArray(data?.brief?.points)?data.brief.points.filter(Boolean).slice(0,8):[];
        const sources=Array.isArray(data?.sources)?data.sources:[];
        const briefBox=document.querySelector('#storyReaderBrief');
        const reportBox=document.querySelector('#storyReaderReport');
        const sourceBox=document.querySelector('#storyReaderSources');
        if(briefBox) briefBox.innerHTML='<div class="story-reader-label">'+esc(data?.brief?.label||'Source-grounded brief')+'</div>'+(points.length?'<ul>'+points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul>':'<div class="story-reader-empty">A source-grounded brief is not available yet. Unsupported details will not be invented.</div>');
        const rendered=report(story.body,story.summary,points);
        if(reportBox) reportBox.innerHTML=rendered.html+(rendered.note?'<div class="story-reader-note">'+esc(rendered.note)+'</div>':'');
        if(sourceBox) sourceBox.innerHTML=sourceCards(sources);
      }catch(_){
        const briefBox=document.querySelector('#storyReaderBrief');
        const sourceBox=document.querySelector('#storyReaderSources');
        if(briefBox) briefBox.innerHTML='<div class="story-reader-label">Source-grounded brief</div><div class="story-reader-empty">The source brief is temporarily unavailable. Available story content remains visible.</div>';
        if(sourceBox) sourceBox.innerHTML='<div class="story-reader-empty">Source details are temporarily unavailable.</div>';
      }
    }catch(error){
      article.innerHTML='<div class="story-reader-wrap"><button type="button" class="story-reader-back">← Back to stories</button><div class="story-reader-error"><strong>Unable to prepare this story.</strong><br>'+esc(error.message||'Please try again.')+'</div></div>';
      article.querySelector('.story-reader-back').onclick=back;
    }
  }

  document.addEventListener('click',function(event){
    const button=event.target.closest('[data-open]');
    if(!button) return;
    event.preventDefault();
    event.stopPropagation();
    openStory(button.getAttribute('data-open'));
  },true);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initStoryReader,{once:true});
else initStoryReader();
})();
