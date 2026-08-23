function clean(v){return String(v??'').replace(/\u0000/g,'').replace(/\s+/g,' ').trim()}
export default async function handler(req,res){
  if(req.method==='OPTIONS'){res.status(204).end();return}
  if(req.method!=='POST'){res.status(405).json({error:'method_not_allowed'});return}
  try{
    const {text,to}=req.body||{};const input=clean(text),target=clean(to);
    if(!input||!target||target==='en'){res.status(200).json({text:input});return}
    if(input.length>12000){res.status(413).json({error:'text_too_long'});return}
    const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl='+encodeURIComponent(target)+'&dt=t&q='+encodeURIComponent(input);
    const r=await fetch(url,{headers:{'user-agent':'GlobalNews/1.0'}});
    if(!r.ok)throw new Error('upstream_'+r.status);
    const j=await r.json();const out=clean((j?.[0]||[]).map(x=>x?.[0]||'').join(''));
    if(!out||out===input)throw new Error('empty_translation');
    res.status(200).json({text:out});
  }catch(_){res.status(502).json({error:'translation_unavailable'})}
}
