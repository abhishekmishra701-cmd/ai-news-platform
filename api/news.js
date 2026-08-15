const SUPABASE_URL = 'https://nfqwnrmwyhcycjsfwqfl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FXSeGzRWwQ3FbyBWf_z80g_DHlcLcCl';

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  Accept: 'application/json'
};

async function supabase(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers,
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 300)}`);
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  try {
    const id = typeof req.query?.id === 'string' ? req.query.id : '';
    if (id) {
      const stories = await supabase(`news_stories?id=eq.${encodeURIComponent(id)}&status=in.(verified,published,corrected)&select=*`);
      if (!stories.length) return res.status(404).json({ error: 'Story not found' });
      const sources = await supabase(`news_sources?story_id=eq.${encodeURIComponent(id)}&select=publisher,url,title&order=created_at.asc`);
      return res.status(200).json({ story: stories[0], sources });
    }
    const stories = await supabase('news_stories?status=in.(verified,published,corrected)&select=id,slug,headline,summary,body,category,status,verification_status,source_count,correction_notice,published_at,created_at,updated_at&order=published_at.desc.nullslast,created_at.desc');
    return res.status(200).json({ stories });
  } catch (error) {
    return res.status(502).json({ error: error?.name === 'AbortError' ? 'Upstream timeout' : (error?.message || 'News API unavailable') });
  }
};
