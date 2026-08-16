(()=>{
'use strict';

// Compatibility loader: keep the proven reader isolated and integrate the
// structured report returned by story-brief v6 without duplicating the brief.
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;

const originalFetch=window.fetch.bind(window);
const SUPABASE_FUNCTION='/functions/v1/story-brief';

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function renderParagraphs(items){
  return items.map(x=>'<p>'+escapeHtml(x)+'</p>').join('');
}
function enhanceReport(data){
  const paragraphs=Array.isArray(data?.report?.paragraphs)?data.report.paragraphs.filter(Boolean):[];
  const box=document.querySelector('#storyReaderReport');
  if(!box||!paragraphs.length) return;
  const briefPoints=Array.isArray(data?.brief?.points)?data.brief.points.filter(Boolean):[];
  const reportText=paragraphs.join(' ').trim().toLowerCase();
  const briefText=briefPoints.join(' ').trim().toLowerCase();
  if(!reportText) return;
  // Full Report is rendered only from the dedicated report payload. Brief
  // points are never reused as the report body.
  box.innerHTML='<div class="story-reader-label">'+escapeHtml(data?.report?.label||'Source-grounded report')+'</div>'+renderParagraphs(paragraphs)+'<div class="story-reader-note">'+escapeHtml(data?.report?.coverage||'The report is grounded in source material available to the platform.')+'</div>';
  box.dataset.reportSource='story-brief-v6';
  box.dataset.briefWordCount=String(briefText.split(/\s+/).filter(Boolean).length);
  box.dataset.reportWordCount=String(reportText.split(/\s+/).filter(Boolean).length);
}

window.fetch=async function(...args){
  const response=await originalFetch(...args);
  try{
    const input=args[0];
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(String(url).includes(SUPABASE_FUNCTION)){
      response.clone().json().then(data=>{
        setTimeout(()=>enhanceReport(data),75);
      }).catch(()=>{});
    }
  }catch(_){/* preserve normal fetch behaviour */}
  return response;
};

const script=document.createElement('script');
script.src='./story-reader-core-v2.js?v=2';
script.async=false;
document.head.appendChild(script);
})();
