function clean(v){return String(v??'').replace(/\u0000/g,'').replace(/\s+/g,' ').trim()}

function chunkText(input,max=420){
  const words=input.split(/\s+/);const chunks=[];let current='';
  for(const word of words){
    const next=current?`${current} ${word}`:word;
    if(next.length>max&&current){chunks.push(current);current=word}else current=next;
  }
  if(current)chunks.push(current);return chunks;
}

async function googleTranslate(input,target){
  const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(input);
  const r=await fetch(url,{headers:{accept:'application/json','user-agent':'GlobalNews/1.0'}});
  if(!r.ok)throw new Error('google_'+r.status);
  const j=await r.json();const out=clean((j?.[0]||[]).map(x=>x?.[0]||'').join(''));
  if(!out)throw new Error('google_empty');return out;
}

async function memoryTranslate(input,target){
  const chunks=chunkText(input);const out=[];
  for(const chunk of chunks){
    const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(chunk)+'&langpair=en|'+encodeURIComponent(target);
    const r=await fetch(url,{headers:{accept:'application/json'}});
    if(!r.ok)throw new Error('memory_'+r.status);
    const j=await r.json();const translated=clean(j?.responseData?.translatedText);
    if(!translated)throw new Error('memory_empty');out.push(translated);
  }
  return clean(out.join(' '));
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, max-age=0');
  if(req.method==='OPTIONS'){res.status(204).end();return}
  if(req.method!=='POST'){res.status(405).json({error:'method_not_allowed'});return}
  try{
    const {text,to}=req.body||{};const input=clean(text),target=clean(to).toLowerCase();
    if(!input||!target||target==='en'){res.status(200).json({text:input,provider:'identity'});return}
    if(input.length>12000){res.status(413).json({error:'text_too_long'});return}
    let out='';let provider='';
    try{out=await googleTranslate(input,target);provider='google'}catch(_){out=await memoryTranslate(input,target);provider='mymemory'}
    if(!out)throw new Error('empty_translation');
    res.status(200).json({text:out,provider});
  }catch(_){res.status(502).json({error:'translation_unavailable'})}
}
