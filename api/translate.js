function clean(v){return String(v??'').replace(/\u0000/g,'').replace(/\s+/g,' ').trim()}
function chunkText(input,max=420){const words=input.split(/\s+/),chunks=[];let current='';for(const word of words){const next=current?current+' '+word:word;if(next.length>max&&current){chunks.push(current);current=word}else current=next}if(current)chunks.push(current);return chunks}
async function fetchJson(url,ms=3000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{headers:{accept:'application/json','user-agent':'GlobalNews/2.0'},signal:c.signal});if(!r.ok)throw Error('http_'+r.status);return await r.json()}finally{clearTimeout(t)}}
async function googleTranslate(input,target){const params='client=gtx&sl=en&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(input);const j=await fetchJson('https://translate.googleapis.com/translate_a/single?'+params,3000);const out=clean((j?.[0]||[]).map(x=>x?.[0]||'').join(''));if(!out)throw Error('google_empty');return out}
async function memoryTranslate(input,target){const chunks=chunkText(input),out=[];for(const chunk of chunks){const j=await fetchJson('https://api.mymemory.translated.net/get?q='+encodeURIComponent(chunk)+'&langpair=en|'+encodeURIComponent(target),3000);const translated=clean(j?.responseData?.translatedText);if(!translated)throw Error('memory_empty');out.push(translated)}return clean(out.join(' '))}
const scriptRules={hi:/[\u0900-\u097F]/,mr:/[\u0900-\u097F]/,bn:/[\u0980-\u09FF]/,ur:/[\u0600-\u06FF]/,ar:/[\u0600-\u06FF]/,fa:/[\u0600-\u06FF]/,ru:/[\u0400-\u04FF]/,zh:/[\u3400-\u9FFF]/,ja:/[\u3040-\u30FF\u3400-\u9FFF]/,ko:/[\uAC00-\uD7AF]/,te:/[\u0C00-\u0C7F]/,ta:/[\u0B80-\u0BFF]/};
function plausible(v,target){if(!v)return false;if(scriptRules[target]&&!scriptRules[target].test(v))return false;if(/^(translation unavailable|undefined|null)$/i.test(v))return false;return true}
export default async function handler(req,res){
res.setHeader('Cache-Control','public, max-age=300, s-maxage=300, stale-while-revalidate=3600');
if(req.method==='OPTIONS'){res.status(204).end();return}
if(req.method!=='POST'){res.status(405).json({error:'method_not_allowed'});return}
try{
const {text,to}=req.body||{},input=clean(text),target=clean(to).toLowerCase();
if(!input||!target||target==='en'){res.status(200).json({text:input,provider:'identity'});return}
if(input.length>12000){res.status(413).json({error:'text_too_long'});return}
let result=null;
try{const v=await googleTranslate(input,target);if(plausible(v,target))result={text:v,provider:'google'}}catch(_){}
if(!result){try{const v=await memoryTranslate(input,target);if(plausible(v,target))result={text:v,provider:'mymemory'}}catch(_){}}
if(!result)throw Error('translation_unavailable');
res.status(200).json(result);
}catch(_){res.status(502).json({error:'translation_unavailable'})}
}