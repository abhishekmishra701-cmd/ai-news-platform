(()=>{
'use strict';
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;

const originalFetch=window.fetch.bind(window);
const SUPABASE_FUNCTION='/functions/v1/story-brief';

function decodeHtml(value){
  let current=String(value??'');
  for(let i=0;i<4;i++){
    const textarea=document.createElement('textarea');
    textarea.innerHTML=current;
    const decoded=textarea.value;
    if(decoded===current) break;
    current=decoded;
  }
  return current;
}
function escapeHtml(value){
  return decodeHtml(value).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
}
function enhanceReport(data){
  const paragraphs=Array.isArray(data?.report?.paragraphs)?data.report.paragraphs.filter(Boolean):[];
  const box=document.querySelector('#storyReaderReport');
  if(!box||!paragraphs.length) return;
  const briefPoints=Array.isArray(data?.brief?.points)?data.brief.points.filter(Boolean):[];
  const reportText=paragraphs.map(decodeHtml).join(' ').trim().toLowerCase();
  const briefText=briefPoints.map(decodeHtml).join(' ').trim().toLowerCase();
  if(!reportText) return;
  box.innerHTML='<div class="story-reader-label">'+escapeHtml(data?.report?.label||'Source-grounded report')+'</div>'+paragraphs.map(x=>'<p>'+escapeHtml(x)+'</p>').join('')+'<div class="story-reader-note">'+escapeHtml(data?.report?.coverage||'The report is grounded in source material available to the platform.')+'</div>';
  box.dataset.reportSource='story-brief-v6';
  box.dataset.briefWordCount=String(briefText.split(/\s+/).filter(Boolean).length);
  box.dataset.reportWordCount=String(reportText.split(/\s+/).filter(Boolean).length);
}

async function reconcileCountryFeed(){
  try{
    const response=await originalFetch('/api/news',{headers:{Accept:'application/json'}});
    if(!response.ok) return;
    const payload=await response.json();
    if(!Array.isArray(payload)) return;
    window.__GLOBAL_NEWS_API_STORIES__=payload;
    const flag=(c)=>({'India':'🇮🇳','China':'🇨🇳','Japan':'🇯🇵','South Korea':'🇰🇷','Australia':'🇦🇺','United States':'🇺🇸','Canada':'🇨🇦','United Kingdom':'🇬🇧','France':'🇫🇷','Germany':'🇩🇪','Russia':'🇷🇺','Ukraine':'🇺🇦','Israel':'🇮🇱','Iran':'🇮🇷','Saudi Arabia':'🇸🇦','United Arab Emirates':'🇦🇪','Pakistan':'🇵🇰','Bangladesh':'🇧🇩','Sri Lanka':'🇱🇰','Nepal':'🇳🇵','Singapore':'🇸🇬','Indonesia':'🇮🇩','South Africa':'🇿🇦','Egypt':'🇪🇬','Brazil':'🇧🇷','Argentina':'🇦🇷','Mexico':'🇲🇽'})[c]||'🌐';
    const countryOf=s=>String(s?.country||'').trim();
    const regions={'Asia':['India','China','Japan','South Korea','Indonesia','Singapore','Thailand','Vietnam','Malaysia','Philippines','Pakistan','Bangladesh','Sri Lanka','Nepal'],'Europe':['Austria','Belgium','Bulgaria','Croatia','Cyprus','Czechia','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Ireland','Italy','Latvia','Lithuania','Luxembourg','Malta','Netherlands','Poland','Portugal','Romania','Slovakia','Slovenia','Spain','Sweden','United Kingdom','Switzerland','Norway','Iceland','Ukraine','Russia','Serbia','Albania','Bosnia and Herzegovina','Montenegro','North Macedonia','Moldova','Belarus'],'North America':['United States','Canada','Mexico'],'South America':['Brazil','Argentina','Chile','Colombia','Peru','Venezuela','Ecuador','Bolivia','Uruguay','Paraguay','Guyana','Suriname'],'Middle East':['Saudi Arabia','United Arab Emirates','Israel','Iran','Iraq','Qatar','Kuwait','Oman','Jordan','Egypt','Türkiye','Bahrain','Lebanon','Yemen'],'Africa':['South Africa','Nigeria','Kenya','Ethiopia','Ghana','Morocco','Algeria','Tunisia','Tanzania','Uganda','Zimbabwe','Rwanda','Senegal','Ivory Coast','Cameroon','Democratic Republic of the Congo'],'Oceania':['Australia','New Zealand','Fiji','Papua New Guinea','Samoa','Tonga']};
    const esc=v=>decodeHtml(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const badge=v=>'<span class="badge">'+esc(String(v||'unverified').toUpperCase())+'</span>';
    const state=()=>{const cat=document.querySelector('#nav button[data-cat].active');const countryMode=document.querySelector('#nav button[data-mode="country"].active');const search=document.querySelector('#q');const country=document.querySelector('#countrySearch');const reg=document.querySelector('#regions button.active');return {category:cat?.dataset.cat||'Home',india:!!countryMode,search:String(search?.value||'').trim().toLowerCase(),country:String(country?.value||'').trim(),region:String(reg?.dataset.region||'All')}};
    function render(forcedCountry){
      const st=state();let data=payload.slice();let selected=forcedCountry|| (st.india?'India':st.country);
      if(selected) data=data.filter(s=>countryOf(s).toLowerCase()===selected.toLowerCase());
      if(st.category!=='Home') data=data.filter(s=>String(s.category||'').toLowerCase()===st.category.toLowerCase());
      if(!selected&&st.region!=='All'){const allowed=regions[st.region]||[];data=data.filter(s=>allowed.some(c=>countryOf(s).toLowerCase()===c.toLowerCase()))}
      if(st.search)data=data.filter(s=>(String(s.headline)+' '+String(s.summary)+' '+String(s.category)+' '+countryOf(s)).toLowerCase().includes(st.search));
      const grid=document.querySelector('#grid'),hero=document.querySelector('#hero');if(!grid||!hero)return;
      const card=s=>'<article class="card"><div class="label-row">'+badge(s.verification_status)+' <span class="pill">'+esc(s.source_count||0)+' sources</span> <span class="country-tag">'+flag(countryOf(s))+' '+esc(countryOf(s)||'Global')+'</span></div><h3>'+esc(s.headline||'')+'</h3><p style="font-size:12px;color:#667085">'+esc(s.category||'General')+(s.updated_at?' · '+esc(new Date(s.updated_at).toLocaleString()):'')+'</p><p>'+esc(s.summary||'')+'</p><button class="read" data-open="'+esc(s.id)+'">Read full story →</button></article>';
      const featured=st.category==='Home'&&!st.search&&!selected&&st.region==='All'&&!st.india&&data[0];
      hero.innerHTML=featured?'<div class="hero">'+badge(featured.verification_status)+' <span class="pill">'+esc(featured.source_count||0)+' sources</span> <span class="country-tag">'+flag(countryOf(featured))+' '+esc(countryOf(featured)||'Global')+'</span><h1>'+esc(featured.headline||'')+'</h1><p>'+esc(featured.summary||'')+'</p><button class="read" data-open="'+esc(featured.id)+'">Read full story →</button></div>':'';
      const cards=featured?data.slice(1):data;grid.innerHTML=cards.length?cards.map(card).join(''):'<div class="empty"><h3>No stories available for this selection right now</h3><p>Try another country, region or Worldwide.</p></div>';
      const title=document.querySelector('#listTitle');const count=document.querySelector('#storyCount');if(title)title.textContent=selected?(flag(selected)+' '+selected+' Stories'):st.region!=='All'?st.region+' Stories':st.category==='Home'?'Top Stories · Worldwide':st.category+' Stories';if(count)count.textContent=data.length+' stories';
    }
    const rerender=()=>setTimeout(()=>render(),0);
    render();
    document.addEventListener('click',rerender,false);
    document.addEventListener('input',rerender,false);
    document.addEventListener('keydown',e=>{if(e.key==='Enter')setTimeout(()=>render(),0)},false);
    const countryMenu=document.querySelector('#countryMenu');
    if(countryMenu){
      countryMenu.addEventListener('click',event=>{
        const option=event.target.closest('[data-country]');
        if(!option) return;
        const country=option.getAttribute('data-country');
        setTimeout(()=>{
          const input=document.querySelector('#countrySearch');
          if(input) input.value=country;
          render(country);
        },0);
      },false);
    }
    window.__GLOBAL_NEWS_COUNTRY_RENDER__=render;
    window.__GLOBAL_NEWS_COUNTRY_RECONCILED__=true;
  }catch(_){/* keep existing feed if API reconciliation is unavailable */}
}

window.fetch=async function(...args){
  const response=await originalFetch(...args);
  try{
    const input=args[0];const url=typeof input==='string'?input:(input&&input.url)||'';
    if(String(url).includes(SUPABASE_FUNCTION))response.clone().json().then(data=>setTimeout(()=>enhanceReport(data),75)).catch(()=>{});
  }catch(_){ }
  return response;
};

const script=document.createElement('script');script.src='./story-reader-core-v2.js?v=4';script.async=false;document.head.appendChild(script);
setTimeout(reconcileCountryFeed,150);
})();
