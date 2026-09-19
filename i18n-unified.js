(()=>{'use strict';
if(window.__GLOBAL_NEWS_I18N_UNIFIED__)return;window.__GLOBAL_NEWS_I18N_UNIFIED__=true;
const KEY='globalNewsLanguage',CACHE='gn-unified-i18n-v4:',RTL=new Set(['ar','ur','fa']);
const SUPPORTED=new Set(['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','mr','te','tr','ta','vi','ko','it','fa']);
const STATIC={
hi:{Home:'होम','🇮🇳 India':'भारत','IN India':'भारत',India:'भारत',World:'विश्व',Geopolitics:'भू-राजनीति','International Relations':'अंतरराष्ट्रीय संबंध',Business:'व्यवसाय',Technology:'प्रौद्योगिकी',Entertainment:'मनोरंजन',Sports:'खेल',Science:'विज्ञान',Climate:'जलवायु',Search:'खोजें','Read full story →':'पूरी खबर पढ़ें →','Back to stories':'खबरों पर वापस','Story Brief':'संक्षिप्त विवरण','Full Report':'विस्तृत रिपोर्ट','Sources & attribution':'स्रोत और श्रेय','Related Stories':'संबंधित खबरें','Translate this story':'इस खबर का अनुवाद करें','Most Spoken Languages in the World':'दुनिया में सबसे अधिक बोली जाने वाली भाषाएँ','Explore Worldwide Regions & countries':'दुनिया भर के क्षेत्र और देश','Explore Worldwide':'दुनिया भर में देखें','Regions & countries':'क्षेत्र और देश',Country:'देश','Top Stories · Worldwide':'शीर्ष खबरें · विश्वभर','Live news':'लाइव खबरें','Fact-checked':'तथ्य-जाँचा हुआ','Unbiased Reporting':'निष्पक्ष रिपोर्टिंग','Updated Regularly':'नियमित रूप से अपडेट','Powered by AI · Translations may not be 100% accurate.':'AI द्वारा संचालित · अनुवाद 100% सटीक न हो सकते हैं।','Story Brief is limited for this source.':'इस स्रोत के लिए संक्षिप्त विवरण सीमित है।','Detailed source report is currently unavailable.':'विस्तृत स्रोत रिपोर्ट फिलहाल उपलब्ध नहीं है।','Open original source ↗':'मूल स्रोत खोलें ↗','Global News aims to deliver accurate, unbiased, and source-attributed global news.':'Global News का उद्देश्य सटीक, निष्पक्ष और स्रोत-आधारित वैश्विक समाचार प्रदान करना है।','UNVERIFIED':'अप्रमाणित','VERIFIED':'सत्यापित','DEVELOPING':'विकासशील','No closely related stories found yet.':'अभी कोई निकटता से संबंधित खबर नहीं मिली।','API connected':'API जुड़ा हुआ है'},
fr:{Home:'Accueil','🇮🇳 India':'Inde','IN India':'Inde',India:'Inde',World:'Monde',Geopolitics:'Géopolitique','International Relations':'Relations internationales',Business:'Affaires',Technology:'Technologie',Entertainment:'Divertissement',Sports:'Sports',Science:'Science',Climate:'Climat',Search:'Rechercher','Read full story →':'Lire l’article complet →','Back to stories':'Retour aux actualités','Story Brief':'Résumé de l’article','Full Report':'Rapport complet','Sources & attribution':'Sources et attribution','Related Stories':'Articles connexes','Translate this story':'Traduire cet article','Most Spoken Languages in the World':'Langues les plus parlées au monde','Explore Worldwide Regions & countries':'Explorer les régions et pays du monde','Explore Worldwide':'Explorer le monde','Regions & countries':'Régions et pays',Country:'Pays','Top Stories · Worldwide':'Principales actualités · Monde','Live news':'Actualités en direct','Fact-checked':'Vérifié','Unbiased Reporting':'Information impartiale','Updated Regularly':'Mis à jour régulièrement','Powered by AI · Translations may not be 100% accurate.':'Propulsé par l’IA · Les traductions peuvent ne pas être exactes à 100 %.','Open original source ↗':'Ouvrir la source originale ↗','Global News aims to deliver accurate, unbiased, and source-attributed global news.':'Global News vise à fournir des informations mondiales exactes, impartiales et attribuées à leurs sources.','UNVERIFIED':'NON VÉRIFIÉ','VERIFIED':'VÉRIFIÉ','DEVELOPING':'EN DÉVELOPPEMENT','API connected':'API connectée'},
es:{Home:'Inicio','🇮🇳 India':'India','IN India':'India',India:'India',World:'Mundo',Geopolitics:'Geopolítica','International Relations':'Relaciones internacionales',Business:'Negocios',Technology:'Tecnología',Entertainment:'Entretenimiento',Sports:'Deportes',Science:'Ciencia',Climate:'Clima',Search:'Buscar','Read full story →':'Leer la historia completa →','Back to stories':'Volver a las noticias','Story Brief':'Resumen de la noticia','Full Report':'Informe completo','Sources & attribution':'Fuentes y atribución','Related Stories':'Historias relacionadas','Translate this story':'Traducir esta noticia','Most Spoken Languages in the World':'Idiomas más hablados del mundo','Explore Worldwide Regions & countries':'Explorar regiones y países del mundo','Explore Worldwide':'Explorar el mundo','Regions & countries':'Regiones y países',Country:'País','Top Stories · Worldwide':'Principales noticias · Mundo','Live news':'Noticias en directo','Fact-checked':'Verificado','Unbiased Reporting':'Información imparcial','Updated Regularly':'Actualizado periódicamente','Powered by AI · Translations may not be 100% accurate.':'Con tecnología de IA · Las traducciones pueden no ser 100 % precisas.','Open original source ↗':'Abrir fuente original ↗','Global News aims to deliver accurate, unbiased, and source-attributed global news.':'Global News busca ofrecer noticias mundiales precisas, imparciales y atribuidas a sus fuentes.','UNVERIFIED':'NO VERIFICADO','VERIFIED':'VERIFICADO','DEVELOPING':'EN DESARROLLO','API connected':'API conectada'},
zh:{Home:'首页','🇮🇳 India':'印度','IN India':'印度',India:'印度',World:'世界',Geopolitics:'地缘政治','International Relations':'国际关系',Business:'商业',Technology:'科技',Entertainment:'娱乐',Sports:'体育',Science:'科学',Climate:'气候',Search:'搜索','Read full story →':'阅读完整报道 →','Back to stories':'返回新闻','Story Brief':'新闻摘要','Full Report':'完整报告','Sources & attribution':'来源与归属','Related Stories':'相关新闻','Translate this story':'翻译这篇新闻','Most Spoken Languages in the World':'世界上使用人数最多的语言','Explore Worldwide Regions & countries':'探索全球地区和国家','Explore Worldwide':'探索全球','Regions & countries':'地区和国家',Country:'国家','Top Stories · Worldwide':'全球热门新闻','Live news':'实时新闻','Fact-checked':'已核实','Unbiased Reporting':'公正报道','Updated Regularly':'定期更新','Powered by AI · Translations may not be 100% accurate.':'由人工智能驱动 · 翻译可能并非 100% 准确','Open original source ↗':'打开原始来源 ↗','Global News aims to deliver accurate, unbiased, and source-attributed global news.':'Global News 致力于提供准确、公正并注明来源的全球新闻。','UNVERIFIED':'未核实','VERIFIED':'已核实','DEVELOPING':'发展中','API connected':'API 已连接'},
ur:{Home:'ہوم','🇮🇳 India':'بھارت','IN India':'بھارت',India:'بھارت',World:'دنیا',Geopolitics:'جغرافیائی سیاست','International Relations':'بین الاقوامی تعلقات',Business:'کاروبار',Technology:'ٹیکنالوجی',Entertainment:'تفریح',Sports:'کھیل',Science:'سائنس',Climate:'آب و ہوا',Search:'تلاش','Read full story →':'مکمل خبر پڑھیں →','Back to stories':'خبروں پر واپس','Story Brief':'مختصر خلاصہ','Full Report':'مکمل رپورٹ','Sources & attribution':'ذرائع اور حوالہ','Related Stories':'متعلقہ خبریں','Translate this story':'اس خبر کا ترجمہ کریں','Most Spoken Languages in the World':'دنیا میں سب سے زیادہ بولی جانے والی زبانیں','Explore Worldwide Regions & countries':'دنیا بھر کے خطے اور ممالک','Explore Worldwide':'دنیا بھر میں دیکھیں','Regions & countries':'علاقے اور ممالک',Country:'ملک','Top Stories · Worldwide':'اہم خبریں · دنیا بھر','Live news':'براہِ راست خبریں','Fact-checked':'تصدیق شدہ','Unbiased Reporting':'غیر جانبدار رپورٹنگ','Updated Regularly':'باقاعدگی سے اپ ڈیٹ','Powered by AI · Translations may not be 100% accurate.':'AI کے ذریعے · ترجمہ 100٪ درست نہ بھی ہو سکتا ہے','Open original source ↗':'اصل ذریعہ کھولیں ↗','Global News aims to deliver accurate, unbiased, and source-attributed global news.':'Global News کا مقصد درست، غیر جانبدار اور ماخذ کے ساتھ عالمی خبریں فراہم کرنا ہے۔','UNVERIFIED':'غیر تصدیق شدہ','VERIFIED':'تصدیق شدہ','DEVELOPING':'ترقی پذیر','API connected':'API منسلک ہے'}
};
const lang=()=>{const v=localStorage.getItem(KEY)||'en';return SUPPORTED.has(v)?v:'en'};
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
const remember=(el,attr,value)=>{if(el.dataset[attr]===undefined)el.dataset[attr]=value};
const selectors=[
'#nav button','.state','.notice','.hero h1','.hero p','.hero .read','.hero .badge','.hero .pill','.hero .country-tag',
'.sectionhead h2','.count','.card h3','.card p','.card .read','.card .badge','.card .pill','.card .country-tag',
'.explorer-title','.explorer-title span','.explorer-hint','.country-picker label','.region-row button',
'.footer','.story-reader-back','.story-reader-head h1','.story-reader-head>p','.story-reader-head .badge','.story-reader-head .country-tag',
'.story-reader-section h2','#storyReaderBrief li','#storyReaderBrief .story-reader-limited','#storyReaderBrief .story-reader-error',
'#storyReaderReport p','#storyReaderReport .story-reader-label','#storyReaderReport .story-reader-note','#storyReaderReport .story-reader-limited','#storyReaderReport .story-reader-error',
'.story-reader-source .story-source-title','.ai-story-meta span',
'.ai-sidebar .side-title','.ai-sidebar .side-meta','.ai-sidebar .ai-translate-note','.ai-sidebar .ai-trust','.ai-sidebar .ai-footer-strip span',
'.ai-footer-strip span','.ai-side-card h3','.story-reader-loading-box'
];
function canonical(el){if(!el)return '';if(el.id==='q')return 'Search global stories, topics, countries or sources…';if(el.id==='countrySearch')return 'Search or select country…';if(el.dataset.gnFinalOriginal!==undefined)return clean(el.dataset.gnFinalOriginal);if(el.dataset.gnUnifiedCanonical!==undefined)return el.dataset.gnUnifiedCanonical;const v=clean(el.textContent);el.dataset.gnUnifiedCanonical=v;return v}
function original(el){if(!el)return '';if(el.dataset.gnUnifiedOriginal!==undefined)return el.dataset.gnUnifiedOriginal;const v=canonical(el);el.dataset.gnUnifiedOriginal=v;return v}
function phOriginal(el){if(!el)return '';if(el.id==='q')return 'Search global stories, topics, countries or sources…';if(el.id==='countrySearch')return 'Search or select country…';if(el.dataset.gnUnifiedPlaceholder!==undefined)return el.dataset.gnUnifiedPlaceholder;const v=el.getAttribute('placeholder')||'';el.dataset.gnUnifiedPlaceholder=v;return v}
function nodes(){const out=[];for(const s of selectors)for(const el of document.querySelectorAll(s)){if(!el.isConnected||el.closest('.ai-langs')||el.closest('.story-reader-source a'))continue;original(el);out.push(el)}return [...new Set(out)]}
function restore(){for(const el of nodes())el.textContent=el.dataset.gnUnifiedOriginal;for(const sel of ['#q','#countrySearch']){const e=document.querySelector(sel);if(e&&e.dataset.gnUnifiedPlaceholder!==undefined)e.placeholder=e.dataset.gnUnifiedPlaceholder}}
function pattern(text,to){
let m=text.match(/^(\d[\d,]*)\s+sources?$/i);if(m){const n=m[1];if(to==='hi')return n+' स्रोत';if(to==='es')return n+' fuentes';if(to==='fr')return n+' sources';if(to==='zh')return n+' 个来源';if(to==='ur')return n+' ذرائع'}
m=text.match(/^Live news · (\d[\d,]*) stories available$/i);if(m){const n=m[1];if(to==='hi')return 'लाइव खबरें · '+n+' खबरें उपलब्ध हैं';if(to==='es')return 'Noticias en directo · '+n+' noticias disponibles';if(to==='fr')return 'Actualités en direct · '+n+' actualités disponibles';if(to==='zh')return '实时新闻 · '+n+' 条新闻可用';if(to==='ur')return 'براہِ راست خبریں · '+n+' خبریں دستیاب ہیں'}
m=text.match(/^(\d[\d,]*) stories$/i);if(m){const n=m[1];if(to==='hi')return n+' खबरें';if(to==='es')return n+' noticias';if(to==='fr')return n+' actualités';if(to==='zh')return n+' 条新闻';if(to==='ur')return n+' خبریں'}
m=text.match(/^(.+?) Stories$/i);if(m){const n=m[1];if(to==='hi')return n==='Top'?'शीर्ष खबरें':n+' की खबरें';if(to==='es')return 'Noticias de '+n;if(to==='fr')return 'Actualités de '+n;if(to==='zh')return n+'新闻';if(to==='ur')return n+' کی خبریں'}
return '';
}
function shouldTranslate(src,el){if(!src||src.length>12000)return false;if(/^https?:\/\//i.test(src))return false;if(el.closest('.ai-story-meta')&&/^(\d+\s+min read|◷)/i.test(src))return false;return true}
async function translate(src,to){
if(to==='en')return src;
const d=STATIC[to]||{},p=pattern(src,to);if(d[src])return d[src];if(p)return p;
const key=CACHE+to+':'+src;try{const hit=localStorage.getItem(key);if(hit)return hit}catch(_){}
try{const r=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:src,to}),cache:'no-store'});if(r.ok){const j=await r.json(),v=clean(j?.text);if(v&&v!==src){try{localStorage.setItem(key,v)}catch(_){}return v}}}catch(_){}
return src;
}
let applying=false,scheduled=0,run=0,suppressUntil=0;
async function apply(){
if(applying)return;applying=true;const id=++run,to=lang();try{
document.documentElement.lang=to;document.documentElement.dir=RTL.has(to)?'rtl':'ltr';
const list=nodes();
if(to==='en'){restore();return}
for(let i=0;i<list.length;i+=6){
if(id!==run||lang()!==to)break;
await Promise.all(list.slice(i,i+6).map(async el=>{const src=el.dataset.gnUnifiedOriginal||original(el);if(!shouldTranslate(src,el))return;const v=await translate(src,to);if(id===run&&lang()===to&&el.isConnected&&v)el.textContent=v}));
}
for(const sel of ['#q','#countrySearch']){const e=document.querySelector(sel);if(e){const src=phOriginal(e);const v=(STATIC[to]||{})[src]||await translate(src,to);if(v)e.placeholder=v}}
}catch(_){ }finally{applying=false;suppressUntil=Date.now()+350}
}
function schedule(ms=60){clearTimeout(scheduled);scheduled=setTimeout(apply,ms)}
function start(){
schedule(0);
window.addEventListener('global-news-language-change',()=>{run++;schedule(0)});
window.addEventListener('global-news-home-rendered',()=>schedule(20));
window.addEventListener('global-news-story-content-rendered',()=>schedule(20));
window.addEventListener('global-news-sidebar-rendered',()=>schedule(20));
window.addEventListener('scroll',()=>schedule(80),{passive:true});
window.addEventListener('global-news-home-rendered',()=>schedule(30));
new MutationObserver(ms=>{if(applying||Date.now()<suppressUntil)return;if(ms.some(m=>m.type==='childList'&&m.addedNodes.length))schedule(70)}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();