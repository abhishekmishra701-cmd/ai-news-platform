(()=>{
'use strict';

/*
  Story-detail isolation shim.

  IMPORTANT: Do not replace /api/story-content here.
  The primary server reader contains the broader retrieval chain
  (original source -> direct reader -> syndicated/GDELT discovery -> Google discovery).
  Re-routing it to the narrower fallback caused valid stories to lose their
  brief and full report.
*/
const originalFetch=window.fetch.bind(window);

window.fetch=async function(input,init){
  const url=typeof input==='string'?input:input?.url||'';

  try{
    const response=await originalFetch(input,init);

    // The Supabase brief service is accepted only when it actually returns
    // both a usable brief and a distinct full report. Otherwise make the
    // Story Reader continue to its independent server retrieval path.
    if(url.includes('/functions/v1/story-brief-v2')&&response.ok){
      try{
        const data=await response.clone().json();
        const brief=Array.isArray(data?.brief?.points)?data.brief.points.filter(Boolean):[];
        const report=Array.isArray(data?.report?.paragraphs)?data.report.paragraphs.filter(Boolean):[];
        if(brief.length<2||report.length<2){
          return new Response(
            JSON.stringify({ok:false,error:'insufficient_grounded_content'}),
            {status:503,headers:{'Content-Type':'application/json'}}
          );
        }
      }catch{}
    }

    return response;
  }catch(error){
    throw error;
  }
};
})();