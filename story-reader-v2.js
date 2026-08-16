(()=>{
'use strict';

// Compatibility loader: keep the proven reader isolated and integrate the
// structured report returned by story-brief v6 without duplicating the brief.
if(window.__GLOBAL_NEWS_STORY_READER_LOADER__) return;
window.__GLOBAL_NEWS_STORY_READER_LOADER__=true;

const originalFetch=window.fetch.bind(window);
const SUPABASE_FUNCTION='/functions/v1/story-brief';

function decodeHtml(value){
  // Source feeds can contain entities that have been encoded more than once
  // (e.g. &amp;#8216;). Decode repeatedly until the value is stable so users
  // never see raw HTML entities in the reader.
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
  return decodeHtml(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function renderParagraphs(items){
  return items.map(x=>'<p>'+escapeHtml(x)+'</p>').join('');
}
function enhanceReport(data){
  const paragraphs=Array.isArray(data?.report?.paragraphs)?data.report.paragraphs.filter(Boolean):[];
  const box=document.querySelector('#storyReaderReport');
  if(!box||!paragraphs.length) return;
  const briefPoints=Array.isArray(data?.brief?.points)?data.brief.points.filter(Boolean):[];
  const reportText=paragraphs.map(decodeHtml).join(' ').trim().toLowerCase();
  const briefText=briefPoints.map(decodeHtml).join(' ').trim().toLowerCase();
  if(!reportText) return;
  // Decode upstream HTML entities (including numeric entities such as
  // &#8216;/&#8217; and double-encoded forms) before escaping for safe display.
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
script.src='./story-reader-core-v2.js?v=4';
script.async=false;
document.head.appendChild(script);
})();
