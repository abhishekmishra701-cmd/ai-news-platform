const CATEGORY_RULES = [
  ["Sports", /\b(sport|sports|football|soccer|cricket|tennis|basketball|hockey|olympic|fifa|ipl|wimbledon|championship|athlete|match|matches|tournament|asia cup|world cup|league|team|coach|player|goal|goals|score|scored|won|win|defeat|victory)\b/i],
  ["Geopolitics", /\b(geopolit|territorial dispute|military alliance|nato|war|ceasefire|missile|sanction|border conflict|troops|armed forces|defence policy|defense policy)\b/i],
  ["International Relations", /\b(diplomatic|diplomacy|bilateral|summit|foreign minister|foreign affairs|ambassador|treaty|relations between|international cooperation)\b/i],
  ["Technology", /\b(ai|artificial intelligence|semiconductor|chip|software|cyber|cybersecurity|technology|tech|robot|cloud computing|smartphone|apple|google|microsoft|nvidia|tesla)\b/i],
  ["Entertainment", /\b(movie|film|cinema|actor|actress|hollywood|bollywood|music|concert|album|streaming|netflix|celebrity|television|tv series|entertainment)\b/i],
  ["Science", /\b(science|scientist|research|space|nasa|astronomy|physics|biology|genome|medical research|discovery|laboratory)\b/i],
  ["Climate", /\b(climate|global warming|carbon|emission|emissions|renewable energy|solar power|wind power|drought|flood|wildfire|hurricane|cyclone|extreme weather)\b/i],
  ["Business", /\b(business|company|companies|corporate|earnings|revenue|profit|market|markets|stock|stocks|shares|ipo|merger|acquisition|economy|economic|bank|finance|investment|trade)\b/i],
  ["India", /\b(india|indian|new delhi|mumbai|modi|rupee|bjp|congress)\b/i],
  ["World", /\b(world|global|international)\b/i]
];

function scoreCategories(text) {
  return CATEGORY_RULES.map(([category, rule]) => {
    const matches = text.match(new RegExp(rule.source, rule.flags + (rule.flags.includes('g') ? '' : 'g')));
    return { category, score: matches ? matches.length : 0 };
  }).sort((a, b) => b.score - a.score);
}

export function inferCategoryFromStory(story) {
  const explicit = String(story?.category || "").trim();
  const text = [story?.headline, story?.summary, story?.body].filter(Boolean).join(" ");
  const ranked = scoreCategories(text);
  const top = ranked[0];
  const second = ranked[1];

  // Keep a valid explicit category unless the content has a materially stronger
  // signal for another category. This corrects stale/incorrect stored labels while
  // avoiding arbitrary reclassification of otherwise valid editorial categories.
  if (explicit && !["World", "General", "News"].includes(explicit)) {
    const explicitScore = ranked.find(x => x.category === explicit)?.score || 0;
    if (top && top.category !== explicit && top.score >= Math.max(2, explicitScore + 1)) {
      return { category: top.category, inferred: true };
    }
    return { category: explicit, inferred: false };
  }

  if (top?.score > 0) return { category: top.category, inferred: true };
  if (second?.score > 0) return { category: second.category, inferred: true };
  return { category: explicit || "World", inferred: true };
}
