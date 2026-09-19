function clean(v){return String(v??'').replace(/\u0000/g,'').replace(/\s+/g,' ').trim()}
function chunkText(input,max=360){const words=input.split(/\s+/),chunks=[];let current='';for(const word of words){const next=current?current+' '+word:word;if(next.length>max&&current){chunks.push(current);current=word}else current=next}if(current)chunks.push(current);return chunks}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function fetchJson(url,ms=8000,retries=1){let last;for(let attempt=0;attempt<=retries;attempt++){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{headers:{accept:'application/json','user-agent':'GlobalNews/2.1'},signal:c.signal});if(!r.ok)throw Error('http_'+r.status);return await r.json()}catch(e){last=e;if(attempt<retries)await sleep(350*(attempt+1))}finally{clearTimeout(t)}}throw last||Error('fetch_failed')}
async function googleTranslate(input,target){const params=new URLSearchParams({client:'gtx',sl:'auto',tl:target,dt:'t',dj:'0',ie:'UTF-8',oe:'UTF-8',q:input});const j=await fetchJson('https://translate.googleapis.com/translate_a/single?'+params.toString(),8000,1);const out=clean((j?.[0]||[]).map(x=>x?.[0]||'').join(''));if(!out)throw Error('google_empty');return out}
async function memoryTranslate(input,target){const chunks=chunkText(input),out=[];for(const chunk of chunks){const j=await fetchJson('https://api.mymemory.translated.net/get?q='+encodeURIComponent(chunk)+'&langpair=en|'+encodeURIComponent(target),8000,1);const translated=clean(j?.responseData?.translatedText);if(!translated)throw Error('memory_empty');out.push(translated);await sleep(80)}return clean(out.join(' '))}
const scriptRules={hi:/[\u0900-\u097F]/,mr:/[\u0900-\u097F]/,bn:/[\u0980-\u09FF]/,ur:/[\u0600-\u06FF]/,ar:/[\u0600-\u06FF]/,fa:/[\u0600-\u06FF]/,ru:/[\u0400-\u04FF]/,zh:/[\u3400-\u9FFF]/,ja:/[\u3040-\u30FF\u3400-\u9FFF]/,ko:/[\uAC00-\uD7AF]/,te:/[\u0C00-\u0C7F]/,ta:/[\u0B80-\u0BFF]/};
function plausible(v,target){if(!v)return false;if(v.length<2)return false;if(scriptRules[target]&&!scriptRules[target].test(v))return false;if(/^(translation unavailable|undefined|null)$/i.test(v))return false;return true}
export default async function handler(req,res){
res.setHeader('Cache-Control','public, max-age=300, s-maxage=300, stale-while-revalidate=3600');
if(req.method==='OPTIONS'){res.status(204).end();return}
if(req.method!=='POST'){res.status(405).json({error:'method_not_allowed'});return}
try{
const {text,to}=req.body||{},input=clean(text),target=clean(to).toLowerCase();
if(!input||!target||target==='en'){res.status(200).json({text:input,provider:'identity'});return}
if(input.length>12000){res.status(413).json({error:'text_too_long'});return}
let result=null;
try{const v=await googleTranslate(input,target);if(plausible(v,target))result={text:v,provider:'google'}}catch(e){console.warn('translate_google_failed',e?.message||'unknown')}
if(!result){try{const v=await memoryTranslate(input,target);if(plausible(v,target))result={text:v,provider:'mymemory'}}catch(e){console.warn('translate_mymemory_failed',e?.message||'unknown')}}
if(!result)throw Error('translation_unavailable');
res.status(200).json(result);
}catch(e){console.error('translate_failed',e?.message||'unknown');res.status(502).json({error:'translation_unavailable'})}
}