(()=>{'use strict';
const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:input?.url||'';
  try{
    if(url.endsWith('/api/story-content')&&init?.method==='POST'){
      return originalFetch('/api/story-content-fallback',init);
    }
  }catch{}
  return originalFetch(input,init);
};
})();
