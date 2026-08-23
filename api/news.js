import { inferCountryFromStory } from "../lib/country-inference.js";
import { inferCategoryFromStory } from "../lib/category-inference.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://nfqwnrmwyhcycjsfwqfl.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_FXSeGzRWwQ3FbyBWf_z80g_DHlcLcCl";
const NEWSDATA_URL = "https://newsdata.io/api/1/latest";
const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

const normalizeKey = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
const escId = (value) => encodeURIComponent(String(value || "")).replace(/%/g, "_");

function normalizeNewsDataStory(item) {
  const title = item.title || "Untitled story";
  const summary = item.description || item.content || "";
  const story = {
    id: `newsdata:${item.article_id || item.link || title}`,
    slug: item.article_id || null,
    headline: title,
    summary,
    body: item.content || summary,
    category: Array.isArray(item.category) ? item.category[0] : item.category,
    country: Array.isArray(item.country) ? item.country[0] : item.country,
    status: "published",
    verification_status: "developing",
    source_count: 1,
    correction_notice: null,
    published_at: item.pubDate || null,
    created_at: item.pubDate || null,
    updated_at: item.pubDate || null,
    source: "newsdata",
    sources: item.link ? [{ publisher: item.source_name || "NewsData", url: item.link, title }] : []
  };
  return normalizeExternalStory(story);
}

function normalizeGdeltStory(item, requestedCategory) {
  const title = item.title || "Untitled story";
  const summary = item.seendate ? `Live coverage indexed ${item.seendate}.` : "";
  const story = {
    id: `gdelt:${escId(item.url || title)}`,
    slug: item.url || null,
    headline: title,
    summary,
    body: summary,
    category: requestedCategory || null,
    country: null,
    status: "published",
    verification_status: "developing",
    source_count: 1,
    correction_notice: null,
    published_at: item.seendate || null,
    created_at: item.seendate || null,
    updated_at: item.seendate || null,
    source: "gdelt",
    sources: item.url ? [{ publisher: item.domain || "GDELT-indexed source", url: item.url, title }] : []
  };
  return normalizeExternalStory(story, requestedCategory);
}

function normalizeExternalStory(story, requestedCategory = null) {
  const country = inferCountryFromStory(story);
  const category = requestedCategory
    ? { category: requestedCategory, inferred: false }
    : inferCategoryFromStory(story);
  return {
    ...story,
    country: country.country || story.country || null,
    country_attribution: country.country ? (country.inferred ? "inferred_from_explicit_story_signal" : "source_data") : "unattributed",
    category: category.category || story.category || "World",
    category_attribution: category.inferred ? "inferred_from_story_signal" : "source_data"
  };
}

function normalizeSupabaseStory(story) {
  return normalizeExternalStory({ ...story, source: story.source || "supabase" });
}

function dedupeStories(stories) {
  const seen = new Set();
  return stories.filter((story) => {
    const key = normalizeKey(story.slug || story.url || story.sources?.[0]?.url || story.headline);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchNewsData(req, signal) {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];
  const url = new URL(NEWSDATA_URL);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("size", "20");
  const category = typeof req.query?.category === "string" ? req.query.category : null;
  const country = typeof req.query?.country === "string" ? req.query.country : null;
  if (category) url.searchParams.set("category", category);
  if (country) url.searchParams.set("country", country);
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload?.results) ? payload.results.map(normalizeNewsDataStory) : [];
}

function gdeltQuery(req) {
  const category = typeof req.query?.category === "string" ? req.query.category : "";
  const country = typeof req.query?.country === "string" ? req.query.country : "";
  if (category && country) return `(${category}) (${country})`;
  if (category) return category;
  if (country) return country;
  return "news";
}

async function fetchGdelt(req, signal) {
  const url = new URL(GDELT_URL);
  const requestedCategory = typeof req.query?.category === "string" ? req.query.category : null;
  url.searchParams.set("query", gdeltQuery(req));
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", "30");
  url.searchParams.set("sort", "datedesc");
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!response.ok) return [];
  const payload = await response.json();
  const rows = Array.isArray(payload?.articles) ? payload.articles : [];
  return rows.map((item) => normalizeGdeltStory(item, requestedCategory));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const id = typeof req.query?.id === "string" ? req.query.id : null;
  const fields = "id,slug,headline,summary,body,category,country,status,verification_status,source_count,correction_notice,published_at,created_at,updated_at";
  const base = id
    ? `news_stories?id=eq.${encodeURIComponent(id)}&select=*`
    : `news_stories?status=in.(verified,published,corrected,developing)&select=${fields}&order=published_at.desc.nullslast,created_at.desc`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    let supabaseStories = [];
    let supabaseError = null;
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${base}`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: "application/json" },
        signal: controller.signal
      });
      const text = await response.text();
      if (!response.ok) supabaseError = new Error(`Supabase ${response.status}`);
      else {
        try { supabaseStories = JSON.parse(text); } catch { supabaseError = new Error("Invalid Supabase response"); }
      }
    } catch (error) { supabaseError = error; }

    if (id) {
      const data = Array.isArray(supabaseStories) ? supabaseStories : [];
      if (data[0]) {
        try {
          const sr = await fetch(`${SUPABASE_URL}/rest/v1/news_sources?story_id=eq.${encodeURIComponent(id)}&select=publisher,url,title&order=created_at.asc`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: "application/json" }, signal: controller.signal
          });
          if (sr.ok) data[0].sources = await sr.json();
        } catch (_) {}
        return res.status(200).json(data.map(normalizeSupabaseStory));
      }
      return res.status(404).json({ error: "Story not found" });
    }

    const [newsDataStories, gdeltStories] = await Promise.all([
      fetchNewsData(req, controller.signal).catch(() => []),
      fetchGdelt(req, controller.signal).catch(() => [])
    ]);

    const merged = dedupeStories([
      ...(Array.isArray(supabaseStories) ? supabaseStories.map(normalizeSupabaseStory) : []),
      ...newsDataStories,
      ...gdeltStories
    ]).sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));

    res.setHeader("X-News-Source-Count", String(merged.length));
    res.setHeader("X-News-Sources", [supabaseStories.length ? "supabase" : "", newsDataStories.length ? "newsdata" : "", gdeltStories.length ? "gdelt" : ""].filter(Boolean).join(",") || "none");
    if (!merged.length && supabaseError && controller.signal.aborted) {
      return res.status(504).json({ error: "Upstream timeout" });
    }
    return res.status(200).json(merged);
  } finally {
    clearTimeout(timeout);
  }
}
