(function(){
  const I18N={
    en:{language:'Language',search:'Search',country:'Country',latest:'Latest News',loading:'Loading news...',noResults:'No news found.',placeholder:'Search news...'},
    hi:{language:'भाषा',search:'खोजें',country:'देश',latest:'ताज़ा खबरें',loading:'खबरें लोड हो रही हैं...',noResults:'कोई खबर नहीं मिली।',placeholder:'खबरें खोजें...'}
  };
  const KEY='ai-news-platform-language';
  function lang(){return localStorage.getItem(KEY)==='hi'?'hi':'en'}
  function setText(root,l){
    root.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(I18N[l][k]) el.textContent=I18N[l][k]});
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;if(I18N[l][k]) el.placeholder=I18N[l][k]});
    document.documentElement.lang=l;
  }
  function mount(){
    if(document.getElementById('language-switcher')) return;
    const host=document.querySelector('header')||document.body;
    const wrap=document.createElement('div');wrap.id='language-switcher';wrap.style.cssText='display:flex;align-items:center;gap:6px;margin-left:auto;';
    const label=document.createElement('label');label.htmlFor='language-select';label.dataset.i18n='language';
    const select=document.createElement('select');select.id='language-select';select.setAttribute('aria-label','Language');
    select.innerHTML='<option value="en">English</option><option value="hi">हिन्दी</option>';
    select.value=lang();select.addEventListener('change',()=>{localStorage.setItem(KEY,select.value);setText(document,select.value);document.dispatchEvent(new CustomEvent('languagechange',{detail:{language:select.value}}));});
    wrap.append(label,select);host.appendChild(wrap);setText(document,select.value);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
  window.AINewsI18n={setLanguage:l=>{localStorage.setItem(KEY,l==='hi'?'hi':'en');const s=document.getElementById('language-select');if(s){s.value=lang();s.dispatchEvent(new Event('change'));}},getLanguage:lang,translate:k=>I18N[lang()][k]||I18N.en[k]||k};
})();
