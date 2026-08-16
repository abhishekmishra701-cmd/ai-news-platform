(()=>{
  'use strict';
  const MIN_BODY=260;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function enhance(root){
    const brief=root.querySelector('#storyBrief');
    const body=root.querySelector('.story-v2-body');
    if(!brief||!body) return;
    const list=[...brief.querySelectorAll('li')].map(x=>x.textContent.trim()).filter(Boolean);
    if(list.length<2) return;
    const current=body.textContent.trim();
    if(current.length>=MIN_BODY && !/^The full report is not available yet/i.test(current)) return;
    body.innerHTML=`<div class="story-content-v2-label">What the available sources report</div><ul class="story-content-v2-points">${list.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="story-content-v2-note">This is a source-grounded platform brief. It is intentionally limited to facts that could be extracted from the available reporting. Open the original source for the publisher's complete article and additional context.</p>`;
  }
  const style=document.createElement('style');
  style.textContent='.story-content-v2-label{font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.5px;color:#194185;margin-bottom:12px}.story-content-v2-points{margin:0;padding-left:22px}.story-content-v2-points li{margin:0 0 12px;line-height:1.75;color:#344054}.story-content-v2-note{margin-top:18px;padding:13px 15px;border-radius:10px;background:#f8fafc;border:1px solid #e4e7ec;color:#667085;font-size:12px;line-height:1.65}';
  document.head.appendChild(style);
  const observer=new MutationObserver(()=>{const root=document.querySelector('.story-v2');if(root) enhance(root);});
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
})();
