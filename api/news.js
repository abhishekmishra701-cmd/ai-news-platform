import { inferCountryFromStory } from "../lib/country-inference.js";
import { inferCategoryFromStory } from "../lib/category-inference.js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://nfqwnrmwyhcycjsfwqfl.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_FXSeGzRWwQ3FbyBWf_z80g_DHlcLcCl";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const id = typeof req.query?.id === "string" ? req.query.id : null;
  const fields = "id,slug,headline,summary,body,category,country,status,verification_status,source_count,correction_notice,published_at,created_at,updated_at";
  const base = id
    ? `news_stories?id=eq.${encodeURIComponent(id)}&select=*`
    : `news_stories?status=in.(verified,published,corrected,developing)&select=${fields}&order=published_at.desc.nullslast,created_at.desc`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${base}`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: "application/json" }, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) return res.status(response.status).json({ error: "Supabase request failed", detail: text.slice(0, 500) });
    let data; try { data = JSON.parse(text); } catch { return res.status(502).json({ error: "Invalid Supabase response" }); }
    if (id && Array.isArray(data) && data[0]) {
      try {
        const sr = await fetch(`${SUPABASE_URL}/rest/v1/news_sources?story_id=eq.${encodeURIComponent(id)}&select=publisher,url,title&order=created_at.asc`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: "application/json" }, signal: controller.signal });
        if (sr.ok) data[0].sources = await sr.json();
      } catch (_) {}
    }
    if (Array.isArray(data)) {
      data = data.map((story) => {
        const attribution = inferCountryFromStory(story);
        const categorization = inferCategoryFromStory(story);
        return {
          ...story,
          country: attribution.country || story.country || null,
          country_attribution: attribution.country ? (attribution.inferred ? "inferred_from_explicit_story_signal" : "source_data") : "unattributed",
          category: categorization.category,
          category_attribution: categorization.inferred ? "inferred_from_story_signal" : "source_data"
        };
      });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.name === "AbortError" ? 504 : 502).json({ error: error.name === "AbortError" ? "Upstream timeout" : "Upstream unavailable" });
  } finally { clearTimeout(timeout); }
}
