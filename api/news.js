import { inferCountryFromStory } from "../lib/country-inference.js";
import { inferCategoryFromStory } from "../lib/category-inference.js";

const SUPABASE_URL=process.env.SUPABASE_URL||"https://nfqwnrmwyhcycjsfwqfl.supabase.co";
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||"sb_publishable_FXSeGzRWwQ3FbyBWf_z80g_DHlcLcCl";
const GDELT_URL="https://api.gdeltproject.org/api/v2/doc/doc";
const HOME_TOPICS=["world news","India news","international news","geopolitics","business news","technology news","science news","climate change","sports news","entertainment news"];\nconst GDELT_HOME_TOPICS=["world news","international news","breaking news","geopolitics","global economy","technology","climate change","public health","science","energy transition"];
function decodeEntities(value){return String(value||"").replace(/&#x([0-9a-f]+);?/gi,(_,hex)=>String.fromCodePoint(parseInt(hex,16))).replace(/&#([0-9]+);?/g,(_,num)=>String.fromCodePoint(parseInt(num,10))).replace(/&(amp|quot|apos|nbsp|#39|lt|gt);/gi,(_,name)=>({amp:"&",quot:'"',apos:"'",nbsp:" ","#39":"'",lt:"<",gt:">"}[name.toLowerCase()]||_));}
function clean(value){let out=String(value||"");for(let i=0;i<2;i++)out=decodeEntities(out).replace(/<[^>]*>/g," ");return decodeEntities(out).replace(/\s+/g," ").trim();}
const key=v=>clean(v).toLowerCase();
function uniqueTail(v){const a=clean(v).split(/\s+/);while(a.length>3&&a.slice(-2).join(' ').toLowerCase()===a.slice(-4,-2).join(' ').toLowerCase())a.splice(-2);return a.join(' ')}
function tidyHeadline(value,publisher=""){let h=uniqueTail(value);const p=clean(publisher);if(p){const suffix=new RegExp(`\\s*(?:[-|•]\s*)${p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\s+${p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})?\\s*$`,'i');h=h.replace(suffix,'').trim()}return h.replace(/\s+\|\s*$/,'').trim()}
function tidySummary(value,headline,publisher=""){let s=uniqueTail(value);const h=clean(headline);if(h&&s.toLowerCase().startsWith(h.toLowerCase()))s=s.slice(h.length).replace(/^[\s:–—-]+/,'');const p=clean(publisher);if(p)s=s.replace(new RegExp(`(?:\\s*[-|•]?\\s*${p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}){1,2}\\s*$`,'i'),'').trim();return s}
function validStory(s){const h=clean(s.headline);if(h.length<12)return false;if(/^(undefined|null|google news|gdelt)$/i.test(h))return false;const tokens=h.toLowerCase().split(/\W+/).filter(Boolean);if(tokens.length>6&&tokens.slice(-3).join(' ')===tokens.slice(-6,-3).join(' '))return false;return true}
async function text(url,timeout=10000){const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{signal:c.signal,headers:{Accept:"application/xml,text/xml,text/html,application/json","User-Agent":"GlobalNewsPlatform/1.0"}});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.text()}finally{clearTimeout(t)}}
async function json(url,opts={},timeout=10000){const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{...opts,signal:c.signal});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json()}finally{clearTimeout(t)}}
function classifyVerification(s,srcs){
  const raw=clean(s.verification_status).toLowerCase();
  const workflow=clean(s.status).toLowerCase();
  if(/^(confirmed|verified)$/.test(raw)||/^(verified|published|corrected)$/.test(workflow))return "confirmed";
  if(raw==="corrected")return "corrected";
  if(raw==="developing"||workflow==="developing")return "developing";
  if(raw==="unverified")return "unverified";
  const directPublisher=srcs.some(x=>x.url&&!/news\.google\.com|gdeltproject\.org/i.test(String(x.url))&&x.publisher&&!/^(google news|gdelt|gdelt-indexed source)$/i.test(String(x.publisher)));
  if(directPublisher)return "confirmed";
  return "unverified";
}
function normalize(s,requestedCategory){const srcs=Array.isArray(s.sources)?s.sources.map(x=>({...x,publisher:clean(x.publisher),title:tidyHeadline(x.title,x.publisher),url:clean(x.url||x.link)})):[];const publisher=srcs[0]?.publisher||s.source||"";const headline=tidyHeadline(s.headline,publisher);const summary=tidySummary(s.summary,headline,publisher);const body=clean(s.body);const cleaned={...s,headline,summary,body,sources:srcs};const country=inferCountryFromStory(cleaned),cat=requestedCategory?{category:requestedCategory}:inferCategoryFromStory(cleaned);return {...cleaned,country:country.country||cleaned.country||"Global",category:cat.category||cleaned.category||"World",verification_status:classifyVerification(cleaned,srcs),source_count:Number(cleaned.source_count||srcs.length||1)}}
async function supabase(){const fields="id,slug,headline,summary,body,category,country,status,verification_status,source_count,published_at,created_at,updated_at,news_sources(url,publisher,title,excerpt)";const u=`${SUPABASE_URL}/rest/v1/news_stories?status=in.(verified,published,corrected,developing,unverified)&select=${fields}&order=published_at.desc.nullslast,created_at.desc&limit=1000`;const rows=await json(u,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,Accept:"application/json"}},12000);return Array.isArray(rows)?rows.map(x=>normalize({...x,sources:Array.isArray(x.news_sources)?x.news_sources:[]})).filter(validStory):[]}
function topic(category){return ({India:"India",World:"World",Geopolitics:"geopolitics",'International Relations':"international relations",Business:"business",Technology:"technology",Entertainment:"entertainment",Sports:"sports",Science:"science",Climate:"climate change"}[category]||"world news")}
function xmlTag(block,name){const m=block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?clean(m[1].replace(/^<!\[CDATA\[|\]\]>$/g,"")):""}
function xmlAttr(block,name){const m=block.match(new RegExp(`<${name}[^>]*href=["']([^"']+)["']`,'i'));return m?decodeEntities(m[1]):""}
async function resolvePublisherUrl(url){
  const original=clean(url);
  if(!original)return "";
  try{
    const c=new AbortController(),t=setTimeout(()=>c.abort(),7000);
    try{
      const r=await fetch(original,{redirect:"follow",signal:c.signal,headers:{"User-Agent":"Mozilla/5.0 (compatible; GlobalNewsPlatform/4.0)","Accept":"text/html,application/xhtml+xml"}});
      const finalUrl=clean(r.url||original);
      if(finalUrl&&!/news\.google\.com/i.test(finalUrl))return finalUrl;
    }finally{clearTimeout(t)}
  }catch(_){}
  return /news\.google\.com/i.test(original) ? "" : original;
}
async function googleRows(xml,query,requestedCategory){
  const items=xml.match(/<item>[\s\S]*?<\/item>/gi)||[];
  const rows=await Promise.all(items.slice(0,100).map(async(b,i)=>{
    const publisher=xmlTag(b,"source")||"Google News";
    const rawTitle=xmlTag(b,"title");
    const headline=tidyHeadline(rawTitle,publisher);
    const rawSummary=xmlTag(b,"description");
    const summary=tidySummary(rawSummary,headline,publisher);
    const rawUrl=xmlTag(b,"link")||xmlAttr(b,"link");
    // Do not resolve publisher redirects while building the live feed. Redirect
    // resolution can stall the serverless response and silently drop whole source
    // batches. Preserve the RSS link here; the existing story reader resolves it
    // only when that individual story is opened.
    const url=clean(rawUrl);
    if(!url)return null;
    return normalize({id:`google:${query}:${i}:${key(url||headline).replace(/[^a-z0-9]+/g,"-").slice(0,120)}`,headline,summary,body:"",published_at:xmlTag(b,"pubDate"),source:"Google News RSS",verification_status:"",sources:[{publisher,url,title:headline}],source_count:1},requestedCategory);
  }));
  return rows.filter(Boolean).filter(validStory);
}
async function google(req){const requested=typeof req.query?.category==="string"?req.query.category:null;const queries=requested?[topic(requested)]:HOME_TOPICS;const settled=await Promise.allSettled(queries.map(async q=>googleRows(await text(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`,9000),q,requested)));return settled.flatMap(r=>r.status==="fulfilled"?r.value:[])}
async function gdeltQuery(q,requestedCategory){const u=new URL(GDELT_URL);u.searchParams.set("query",q);u.searchParams.set("mode","artlist");u.searchParams.set("format","json");u.searchParams.set("maxrecords","250");u.searchParams.set("sort","datedesc");const p=await json(u,{headers:{Accept:"application/json"}},10000);return Array.isArray(p?.articles)?p.articles.map((x,i)=>normalize({id:`gdelt:${q}:${i}:${key(x.url||x.title).replace(/[^a-z0-9]+/g,"-").slice(0,120)}`,headline:x.title,summary:"",body:"",published_at:x.seendate||null,source:"GDELT",sources:x.url?[{publisher:x.domain||"GDELT-indexed source",url:x.url,title:x.title}]:[],source_count:1},requestedCategory)).filter(validStory):[]}
async function gdelt(req){const requested=typeof req.query?.category==="string"?req.query.category:null;const queries=requested?[topic(requested)]:GDELT_HOME_TOPICS;const settled=await Promise.allSettled(queries.map(q=>gdeltQuery(q,requested)));return settled.flatMap(r=>r.status==="fulfilled"?r.value:[])}
function dedupe(rows){const seen=new Set();return rows.filter(x=>{const k=key(x.slug||x.sources?.[0]?.url||x.headline);if(!k||seen.has(k))return false;seen.add(k);return true})}
export default async function handler(req,res){res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});const id=typeof req.query?.id==="string"?req.query.id:null;if(id){try{const rows=await supabase();const row=rows.find(x=>String(x.id)===id);return row?res.status(200).json([row]):res.status(404).json({error:"Story not found"})}catch(e){return res.status(404).json({error:"Story not found"})}}const requested=typeof req.query?.category==="string"?req.query.category:null;const results=await Promise.allSettled([supabase(),google(req),gdelt(req)]);const names=["supabase","google","gdelt"],diagnostics={};results.forEach((r,i)=>diagnostics[names[i]]=r.status==="fulfilled"?{ok:true,count:r.value.length}:{ok:false,error:r.reason?.message||"failed"});let rows=[];results.forEach(r=>{if(r.status==="fulfilled")rows.push(...r.value)});rows=dedupe(rows).filter(x=>!requested||key(x.category)===key(requested)).sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0));res.setHeader("X-News-Source-Count",String(rows.length));res.setHeader("X-News-Sources",names.filter((n,i)=>results[i].status==="fulfilled"&&results[i].value.length).join(",")||"none");res.setHeader("X-News-Diagnostics",Buffer.from(JSON.stringify(diagnostics)).toString("base64"));return res.status(200).json(rows)}