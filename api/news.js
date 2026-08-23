import { inferCountryFromStory } from "../lib/country-inference.js";
import { inferCategoryFromStory } from "../lib/category-inference.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://nfqwnrmwyhcycjsfwqfl.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_FXSeGzRWwQ3FbyBWf_z80g_DHlcLcCl";
const NEWSDATA_URL = "https://newsdata.io/api/1/latest";

const normalizeKey = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();

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
    source_count: Array.isArray(item.source_url) ? item.source_url.length : 1,
    correction_notice: null,
    published_at: item.pubDate || null,
    created_at: item.pubDate || null,
    updated_at: item.pubDate || null,
    source: "newsdata",
    sources: item.link ? [{ publisher: item.source_name || "NewsData", url: item.link, title }] : []
  };
  const country = inferCountryFromStory(story);
  const category = inferCategoryFromStory(story);
  return {
    ...story,
    country: country.country || story.country || null,
    country_attribution: country.country ? (country.inferred ? "inferred_from_explicit_story_signal" : "source_data") : "unattributed",
    category: category.category,
    category_attribution: category.inferred ? "inferred_from_story_signal" : "source_data"
  };
}

function normalizeSupabaseStory(story) {
  const country = inferCountryFromStory(story);
  const category = inferCategoryFromStory(story);
  return {
    ...story,
    source: story.source || "supabase",
    country: country.country || story.country || null,
    country_attribution: country.country ? (country.inferred ? "inferred_from_explicit_story_signal" : "source_data") : "unattributed",
    category: category.category,
    category_attribution: category.inferred ? "inferred_from_story_signal" : "source_data"
  };
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
  url.searchParams.set("size", "10");
  const category = typeof req.query?.category === "string" ? req.query.category : null;
  const country = typeof req.query?.country === "string" ? req.query.country : null;
  if (category) url.searchParams.set("category", category);
  if (country) url.searchParams.set("country", country);
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload?.results) ? payload.results.map(normalizeNewsDataStory) : [];
}

export default async function handler(req, res) {
  // Live news must never be served as a stale 304/empty browser response.
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
  const timeout = setTimeout(() => controller.abort(), 8000);
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

    const newsDataStories = await fetchNewsData(req, controller.signal).catch(() => []);
    const merged = dedupeStories([...(Array.isArray(supabaseStories) ? supabaseStories.map(normalizeSupabaseStory) : []), ...newsDataStories])
      .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));

    if (!merged.length && supabaseError) {
      return res.status(supabaseError.name === "AbortError" ? 504 : 502).json({
        error: supabaseError.name === "AbortError" ? "Upstream timeout" : "Upstream unavailable"
      });
    }
    return res.status(200).json(merged);
  } finally {
    clearTimeout(timeout);
  }
}
