const CATEGORY_RULES = [
  ["Geopolitics", /\b(geopolit|territorial dispute|military alliance|nato|war|ceasefire|missile|sanction|defence|defense|border conflict|troops|armed forces)\b/i],
  ["International Relations", /\b(diplomatic|diplomacy|bilateral|summit|foreign minister|foreign affairs|ambassador|treaty|relations between|international cooperation)\b/i],
  ["Technology", /\b(ai|artificial intelligence|semiconductor|chip|software|cyber|cybersecurity|technology|tech|robot|cloud computing|smartphone|apple|google|microsoft|nvidia|tesla)\b/i],
  ["Entertainment", /\b(movie|film|cinema|actor|actress|hollywood|bollywood|music|concert|album|streaming|netflix|celebrity|television|tv series|entertainment)\b/i],
  ["Sports", /\b(sport|sports|football|soccer|cricket|tennis|basketball|olympic|fifa|ipl|wimbledon|championship|athlete|match|tournament)\b/i],
  ["Science", /\b(science|scientist|research|space|nasa|astronomy|physics|biology|genome|medical research|discovery|laboratory|climate study)\b/i],
  ["Climate", /\b(climate|global warming|carbon|emission|emissions|renewable energy|solar power|wind power|drought|flood|wildfire|hurricane|cyclone|extreme weather)\b/i],
  ["Business", /\b(business|company|companies|corporate|earnings|revenue|profit|market|markets|stock|stocks|shares|ipo|merger|acquisition|economy|economic|bank|finance|investment|trade)\b/i],
  ["India", /\b(india|indian|new delhi|mumbai|modi|rupee|bjp|congress)\b/i],
  ["World", /\b(world|global|international)\b/i]
];

export function inferCategoryFromStory(story) {
  const explicit = String(story?.category || "").trim();
  if (explicit && !["World", "General", "News"].includes(explicit)) return { category: explicit, inferred: false };
  const text = [story?.headline, story?.summary, story?.body].filter(Boolean).join(" ");
  for (const [category, rule] of CATEGORY_RULES) {
    if (rule.test(text)) return { category, inferred: true };
  }
  return { category: explicit || "World", inferred: true };
}
