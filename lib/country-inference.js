const COUNTRY_RULES = [
  ["United States", /\b(united states|u\.s\.?|u\.s\.a\.?|usa|america|american|washington|new york|california|texas|florida)\b/i],
  ["Australia", /\b(australia|australian|sydney|melbourne|canberra)\b/i],
  ["China", /\b(china|chinese|beijing|shanghai)\b/i],
  ["India", /\b(india|indian|new delhi|mumbai|bengaluru|bangalore|kolkata|chennai)\b/i],
  ["Japan", /\b(japan|japanese|tokyo)\b/i],
  ["South Korea", /\b(south korea|korean|seoul)\b/i],
  ["United Kingdom", /\b(united kingdom|u\.k\.?|uk|britain|british|england|london)\b/i],
  ["France", /\b(france|french|paris)\b/i],
  ["Germany", /\b(germany|german|berlin)\b/i],
  ["Russia", /\b(russia|russian|moscow|kremlin)\b/i],
  ["Ukraine", /\b(ukraine|ukrainian|kyiv|kiev)\b/i],
  ["Israel", /\b(israel|israeli|jerusalem|tel aviv)\b/i],
  ["Iran", /\b(iran|iranian|tehran)\b/i],
  ["Saudi Arabia", /\b(saudi arabia|saudi|riyadh)\b/i],
  ["United Arab Emirates", /\b(united arab emirates|uae|dubai|abu dhabi)\b/i],
  ["Canada", /\b(canada|canadian|ottawa|toronto)\b/i],
  ["Mexico", /\b(mexico|mexican|mexico city)\b/i],
  ["Brazil", /\b(brazil|brazilian|brasilia)\b/i],
  ["Argentina", /\b(argentina|argentine|buenos aires)\b/i],
  ["Singapore", /\b(singapore|singaporean)\b/i],
  ["Indonesia", /\b(indonesia|indonesian|jakarta)\b/i],
  ["Pakistan", /\b(pakistan|pakistani|islamabad|karachi)\b/i],
  ["Bangladesh", /\b(bangladesh|bangladeshi|dhaka)\b/i],
  ["Sri Lanka", /\b(sri lanka|sri lankan|colombo)\b/i],
  ["Nepal", /\b(nepal|nepali|kathmandu)\b/i],
  ["Egypt", /\b(egypt|egyptian|cairo)\b/i],
  ["South Africa", /\b(south africa|south african|johannesburg|cape town)\b/i]
];

export function inferCountryFromStory(story) {
  if (story?.country && String(story.country).trim()) return { country: String(story.country).trim(), inferred: false };
  const text = [story?.headline, story?.summary, story?.body].filter(Boolean).join(" ");
  if (!text) return { country: null, inferred: false };
  const matches = COUNTRY_RULES.filter(([, pattern]) => pattern.test(text)).map(([country]) => country);
  const unique = [...new Set(matches)];
  return unique.length === 1 ? { country: unique[0], inferred: true } : { country: null, inferred: false };
}
