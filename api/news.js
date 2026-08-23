import { inferCountryFromStory } from "../lib/country-inference.js";
import { inferCategoryFromStory } from "../lib/category-inference.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://nfqwnrmwyhcycjsfwqfl.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_FXSeGzRWwQ3FbyBWf_z80g_DHlcLcCl";
const NEWSDATA_URL = "https://newsdata.io/api/1/latest";
const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

const normalizeKey = (v) => String(v || "").toLowerCase().replace(/\s+/g, " ").trim();
const escId = (v) => encodeURIComponent(String(v || "")).replace(/%/g, "_");

function normalizeExternalStory(story, requestedCategory = null) {
  const country = inferCountryFromStory(story);
  const category = requestedCategory ? { category: requestedCategory, inferred: false } : inferCategoryFromStory(story);
  return { ...story, country: country.country || story.country || null, country_attribution: country.country ? (country.inferred ? "inferred_from_explicit_story_signal" : "source_data") : "unattributed", category: category.category || story.category || "World", category_attribution: category.inferred ? "inferred_from_story_signal" : "source_data" };
}
function normalizeSupabaseStory(story) { return normalizeExternalStory({ ...story, source: story.source || "supabase" }); }
function normalizeNewsDataStory(item) {
  const title = item.title || "Untitled story";
  const summary = item.description || item.content || "";
  return normalizeExternalStory({ id: `newsdata:${item.article_id || item.link || title}`, slug: item.article_id || null, headline: title, summary, body: item.content || summary, category: Array.isArray(item.category) ? item.category[0] : item.category, country: Array.isArray(item.country) ? item.country[0] : item.country, status: "published", verification_status: "developing", source_count: 1, correction_notice: null, published_at: item.pubDate || null, created_at: item.pubDate || null, updated_at: item.pubDate || null, source: "newsdata", sources: item.link ? [{ publisher: item.source_name || "NewsData", url: item.link, title }] : [] });
}
function normalizeGdeltStory(item, requestedCategory) {
  const title = item.title || "Untitled story";
  const summary = item.seendate ? `Live coverage indexed ${item.seendate}.` : "";
  return normalizeExternalStory({ id: `gdelt:${escId(item.url || title)}`, slug: item.url || null, headline: title, summary, body: summary, category: requestedCategory || null, country: null, status: "published", verification_status: "developing", source_count: 1, correction_notice: null, published_at: item.seendate || null, created_at: item.seendate || null, updated_at: item.seendate || null, source: "gdelt", sources: item.url ? [{ publisher: item.domain || "GDELT-indexed source", url: item.url, title }] : [] }, requestedCategory);
}
function dedupeStories(stories) { const seen = new Set(); return stories.filter((s) => { const key = normalizeKey(s.slug || s.url || s.sources?.[0]?.url || s.headline); if (!key || seen.has(key)) return false; seen.add(key); return true; }); }
async function fetchJson(url, options = {}, timeoutMs = 7000) { const c = new AbortController(); const t = setTimeout(() => c.abort(), timeoutMs); try { const r = await fetch(url, { ...options, signal: c.signal }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return await r.json(); } finally { clearTimeout(t); } }
async function fetchSupabase(id) {
  const fields = "id,slug,headline,summary,body,category,country,status,verification_status,source_count,correction_notice,published_at,created_at,updated_at";
  const base = id ? `news_stories?id=eq.${encodeURIComponent(id)}&select=*` : `news_stories?status=in.(verified,published,corrected,developing)&select=${fields}&order=published_at.desc.nullslast,created_at.desc&limit=200`;
  const data = await fetchJson(`${SUPABASE_URL}/rest/v1/${base}`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: "application/json" } });
  return Array.isArray(data) ? data : [];
}
function gdeltQuery(req) { const category = typeof req.query?.category === "string" ? req.query.category : ""; const country = typeof req.query?.country === "string" ? req.query.country : ""; return category && country ? `(${category}) (${country})` : category || country || "news"; }
async function fetchNewsData(req) { const key = process.env.NEWSDATA_API_KEY; if (!key) return []; const u = new URL(NEWSDATA_URL); u.searchParams.set("apikey", key); u.searchParams.set("size", "30"); if (req.query?.category) u.searchParams.set("category", req.query.category); if (req.query?.country) u.searchParams.set("country", req.query.country); const p = await fetchJson(u, { headers: { Accept: "application/json" } }); return Array.isArray(p?.results) ? p.results.map(normalizeNewsDataStory) : []; }
async function fetchGdelt(req) { const u = new URL(GDELT_URL); const category = typeof req.query?.category === "string" ? req.query.category : null; u.searchParams.set("query", gdeltQuery(req)); u.searchParams.set("mode", "artlist"); u.searchParams.set("format", "json"); u.searchParams.set("maxrecords", "30"); u.searchParams.set("sort", "datedesc"); const p = await fetchJson(u, { headers: { Accept: "application/json" } }); return Array.isArray(p?.articles) ? p.articles.map((x) => normalizeGdeltStory(x, category)) : []; }

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const id = typeof req.query?.id === "string" ? req.query.id : null;
  const results = await Promise.allSettled([fetchSupabase(id), id ? Promise.resolve([]) : fetchNewsData(req), id ? Promise.resolve([]) : fetchGdelt(req)]);
  const names = ["supabase", "newsdata", "gdelt"];
  const diagnostics = {};
  results.forEach((r, i) => diagnostics[names[i]] = r.status === "fulfilled" ? { ok: true, count: r.value.length } : { ok: false, error: r.reason?.message || "failed" });
  const supabaseStories = results[0].status === "fulfilled" ? results[0].value : [];
  if (id) {
    const row = supabaseStories[0];
    if (!row) return res.status(404).json({ error: "Story not found", diagnostics });
    try { row.sources = await fetchJson(`${SUPABASE_URL}/rest/v1/news_sources?story_id=eq.${encodeURIComponent(id)}&select=publisher,url,title&order=created_at.asc`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: "application/json" } }, 5000); } catch (_) {}
    return res.status(200).json([normalizeSupabaseStory(row)]);
  }
  const newsDataStories = results[1].status === "fulfilled" ? results[1].value : [];
  const gdeltStories = results[2].status === "fulfilled" ? results[2].value : [];
  const merged = dedupeStories([...supabaseStories.map(normalizeSupabaseStory), ...newsDataStories, ...gdeltStories]).sort((a,b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
  res.setHeader("X-News-Source-Count", String(merged.length));
  res.setHeader("X-News-Sources", names.filter((n,i) => results[i].status === "fulfilled" && results[i].value.length).join(",") || "none");
  return res.status(200).json(merged);
}
