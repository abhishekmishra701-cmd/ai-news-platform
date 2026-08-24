(()=>{
'use strict';
const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:input?.url||'';
  try{
    if(url.endsWith('/api/story-content')&&init?.method==='POST'){
      return originalFetch('/api/story-content-fallback',init);
    }
    const response=await originalFetch(input,init);
    if(url.includes('/functions/v1/story-brief-v2')&&response.ok){
      try{
        const data=await response.clone().json();
        const brief=Array.isArray(data?.brief?.points)?data.brief.points.filter(Boolean):[];
        const report=Array.isArray(data?.report?.paragraphs)?data.report.paragraphs.filter(Boolean):[];
        if(brief.length<4||report.length<3){
          return new Response(JSON.stringify({ok:false,error:'insufficient_publisher_text'}),{status:503,headers:{'Content-Type':'application/json'}});
        }
      }catch{}
    }
    return response;
  }catch(e){
    return originalFetch(input,init);
  }
};
})();
