import {
  clusters, kpis, storeMoves, news, deals, expiries, mallSpaces, supplyPipeline,
  type RetailCluster, type MallSpaces,
} from "@/data/marketData";

// Built-in rule engine: entity extraction (clusters, malls, brands), scored
// multi-intent matching and short conversation memory. Used when no Claude
// API key is connected, and as the fallback when an API call fails.

const memory: { cluster?: RetailCluster; mall?: MallSpaces } = {};

const norm = (s: string) => s.toLowerCase().replace(/[^\w\s$&'+-]/g, " ").replace(/\s+/g, " ").trim();

const clusterAliases: Record<string, string> = {
  orchard: "orchard", somerset: "orchard", "ion": "orchard", paragon: "orchard",
  marina: "marina", suntec: "marina", raffles: "marina", downtown: "marina", cbd: "marina",
  bugis: "bugis", funan: "bugis", "city hall": "bugis",
  chinatown: "chinatown", "tanjong pagar": "chinatown", guoco: "chinatown",
  harbourfront: "harbourfront", vivocity: "harbourfront", vivo: "harbourfront", sentosa: "harbourfront",
  "paya lebar": "paya-lebar", katong: "paya-lebar", plq: "paya-lebar", parkway: "paya-lebar",
  tampines: "tampines", jewel: "tampines", changi: "tampines",
  jurong: "jurong", jem: "jurong", westgate: "jurong", imm: "jurong",
  woodlands: "woodlands", causeway: "woodlands",
  serangoon: "serangoon", nex: "serangoon", hougang: "serangoon",
  punggol: "punggol", sengkang: "punggol", waterway: "punggol", compass: "punggol",
  bishan: "bishan", "ang mo kio": "bishan", amk: "bishan", "junction 8": "bishan",
};

function findClusters(q: string): RetailCluster[] {
  const ids = new Set<string>();
  for (const [alias, id] of Object.entries(clusterAliases)) {
    if (q.includes(alias)) ids.add(id);
  }
  if (q.includes("suburban") || q.includes("heartland")) {
    // handled at the macro level, not as a single cluster
  }
  return clusters.filter((c) => ids.has(c.id));
}

function findMall(q: string): MallSpaces | undefined {
  return mallSpaces.find((m) => q.includes(m.mall.toLowerCase()));
}

function findBrand(q: string) {
  const move = storeMoves.find((m) => q.includes(m.brand.toLowerCase().split(" (")[0]));
  const deal = deals.find((d) => !d.tenant.includes("(conf.)") && q.includes(d.tenant.toLowerCase()));
  const expiry = expiries.find((e) => q.includes(e.tenant.toLowerCase()));
  return { move, deal, expiry };
}

const intentKeywords: Record<string, string[]> = {
  units: ["unit", "units", "space", "spaces", "available", "availability", "sqft", "floorplate", "free up", "freeing", "vacant unit", "lease out", "take over", "move in"],
  vacancy: ["vacancy", "vacancies", "occupancy", "occupied", "empty", "vacant"],
  rent: ["rent", "rents", "rental", "psf", "price", "prices", "pricing", "cost", "asking", "expensive", "cheap"],
  moves: ["open", "opened", "opening", "openings", "close", "closed", "closure", "closing", "exit", "exits", "new store", "movement", "movements", "launch"],
  news: ["news", "headline", "headlines", "story", "stories", "happened", "happening", "this week", "summarise", "summarize", "latest", "update"],
  pipeline: ["pipeline", "deal", "deals", "negotiat", "prospect", "viewing", "signed", "broker", "closing stage"],
  expiry: ["expiry", "expiries", "expiring", "expire", "renewal", "renewals", "lease end"],
  supply: ["supply", "new mall", "new malls", "upcoming", "completion", "completions", "development", "redevelopment"],
  tourism: ["tourist", "tourists", "visitor", "visitors", "arrival", "arrivals", "tourism", "stb"],
  compare: ["compare", " vs ", "versus", "better", "difference", "prime or suburban", "which is"],
  fnb: ["f&b", "food", "restaurant", "cafe", "coffee", "tea", "dining", "chicken", "burger"],
};

function scoreIntents(q: string): string[] {
  const scores: [string, number][] = Object.entries(intentKeywords).map(([intent, kws]) => [
    intent,
    kws.reduce((s, kw) => s + (q.includes(kw) ? (kw.length > 5 ? 2 : 1) : 0), 0),
  ]);
  return scores.filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([i]) => i);
}

const fmtMonth = (d: string) => new Date(d).toLocaleDateString("en-SG", { month: "short", year: "numeric" });

function unitLine(u: MallSpaces["units"][number]): string {
  const when = u.status === "vacant" ? "ready now" : `from ${fmtMonth(u.availableFrom)}`;
  return `• ${u.unit} — ${u.sqft.toLocaleString()} sqft, S$${u.askPsf} psf, ${when}${u.currentTenant ? ` (currently ${u.currentTenant})` : ""}. Suits: ${u.suitedFor.join(", ")}`;
}

function mallAnswer(mall: MallSpaces): string {
  memory.mall = mall;
  const lines = mall.units.map(unitLine);
  return `${mall.mall} (${mall.cluster}, ${mall.tier}) — ${mall.units.length} ${mall.units.length > 1 ? "opportunities" : "opportunity"} on the radar:\n\n${lines.join("\n")}`;
}

function clusterAnswer(c: RetailCluster, intents: string[]): string {
  memory.cluster = c;
  const parts: string[] = [];
  const wantAll = intents.length === 0;

  if (wantAll || intents.includes("rent")) {
    parts.push(`Prime rents in ${c.name} average S$${c.rentPsf} psf/mo (+${c.rentChangeYoY}% y-o-y).`);
  }
  if (wantAll || intents.includes("vacancy")) {
    parts.push(`Vacancy in ${c.name} is ${c.vacancy}% (${c.tier} tier).`);
  }
  if (wantAll) {
    parts.push(c.note);
    parts.push(`Key malls: ${c.keyMalls.join(", ")}. In demand: ${c.hotCategories.join(", ")}.`);
  }
  if (intents.includes("units")) {
    const inCluster = mallSpaces.filter((m) => c.keyMalls.some((km) => km.toLowerCase().includes(m.mall.toLowerCase()) || m.mall.toLowerCase().includes(km.toLowerCase())));
    if (inCluster.length) {
      parts.push(`Available space nearby:\n${inCluster.map((m) => `${m.mall}: ${m.units.length} unit${m.units.length > 1 ? "s" : ""} (${m.units.map((u) => u.unit).join(", ")})`).join("\n")}\nAsk me about a specific mall for details.`);
    } else {
      parts.push(`No tracked unit availability in ${c.name} right now — check the Space Finder tab for the full list.`);
    }
  }
  if (intents.includes("moves")) {
    const moves = storeMoves.filter((m) => m.cluster === c.name);
    if (moves.length) {
      parts.push(`Recent movements there: ${moves.map((m) => `${m.brand} (${m.type === "open" ? "opened" : "closing"}, ${m.location})`).join("; ")}.`);
    }
  }
  return parts.join(" ");
}

function compareClusters(a: RetailCluster, b: RetailCluster): string {
  const tighter = a.vacancy < b.vacancy ? a : b;
  return `${a.name}: S$${a.rentPsf} psf, ${a.vacancy}% vacancy (+${a.rentChangeYoY}% rent y-o-y) vs ${b.name}: S$${b.rentPsf} psf, ${b.vacancy}% vacancy (+${b.rentChangeYoY}%). ${tighter.name} is the tighter market — expect stiffer competition for units but stickier footfall. ${a.note.split(".")[0]}. ${b.note.split(".")[0]}.`;
}

function brandAnswer(q: string): string | null {
  const { move, deal, expiry } = findBrand(q);
  const parts: string[] = [];
  if (move) {
    parts.push(`${move.brand}: ${move.type === "open" ? "opened" : "closing/closed"} at ${move.location} (${fmtMonth(move.date)}${move.sqft ? `, ${move.sqft.toLocaleString()} sqft` : ""}). ${move.detail}`);
  }
  if (deal) {
    parts.push(`In our pipeline: ${deal.tenant} — ${deal.requirement}, targeting ${deal.target}, stage ${deal.stage} (~S$${deal.value}k/yr). Next: ${deal.nextAction}.`);
  }
  if (expiry) {
    parts.push(`Expiry radar: ${expiry.tenant} at ${expiry.mall} (${expiry.sqft.toLocaleString()} sqft) expires ${fmtMonth(expiry.expiry)} — urgency ${expiry.urgency}.`);
  }
  return parts.length ? parts.join("\n\n") : null;
}

const macroAnswers: Record<string, () => string> = {
  vacancy: () =>
    `Island-wide retail vacancy is ${kpis.islandVacancy.value}% (Q1 26), up ${kpis.islandVacancy.change}pp q-o-q — the first material rise after two years of tightening. Orchard climbed to 7.1% after closures; suburban tightened to ~4.1%. Tightest: Tampines (4.0%) and Jurong East (4.4%); loosest: Chinatown/Tanjong Pagar (8.0%).`,
  rent: () =>
    `Prime floor rents (Q1 26, Savills basket): Orchard S$${kpis.primeOrchardRent.value} psf/mo, suburban S$${kpis.suburbanRent.value} psf/mo — both flat q-o-q, with central-region rents dipping ~0.6%. Full-year calls: Knight Frank +2–4%, CBRE +1–2%, underpinned by supply of only ~0.3M sqft/yr through 2029.`,
  units: () => {
    const total = mallSpaces.reduce((s, m) => s + m.units.length, 0);
    const vacantTop = mallSpaces
      .map((m) => ({ mall: m.mall, n: m.units.filter((u) => u.status === "vacant").length }))
      .filter((m) => m.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 4);
    return `${total} units across ${mallSpaces.length} malls are vacant or freeing up. Most availability now: ${vacantTop.map((m) => `${m.mall} (${m.n})`).join(", ")}. Headline opportunities: the ex-Isetan floorplate at NEX (76,000 sqft) and the Cathay cinema box at Causeway Point. Ask about any mall by name, or open Space Finder.`;
  },
  moves: () => {
    const opens = storeMoves.filter((m) => m.type === "open").length;
    const closes = storeMoves.filter((m) => m.type === "close").length;
    const ntm = storeMoves.filter((m) => m.signal === "new-to-market").map((m) => m.brand);
    return `Recent movements: ${opens} openings vs ${closes} closures. New-to-market: ${ntm.join(", ")}. Biggest closures to watch: Isetan's NEX exit (anchor floorplate freed) and Cathay Cineplexes' liquidation. Full list in the Open/Close tab.`;
  },
  news: () => {
    const top = news.filter((n) => n.impact === "high").slice(0, 3);
    return `Top stories:\n\n${top.map((n, i) => `${i + 1}. ${n.headline} — ${n.summary}`).join("\n\n")}`;
  },
  pipeline: () => {
    const closing = deals.filter((d) => d.stage === "Negotiating" || d.stage === "Legal");
    return `${deals.length} active deals worth ~S$${(deals.reduce((a, d) => a + d.value, 0) / 1000).toFixed(1)}M est. annual rent. In closing stages: ${closing.map((d) => `${d.tenant} (${d.stage} — ${d.nextAction})`).join("; ")}.`;
  },
  expiry: () => {
    const urgent = expiries.filter((e) => e.urgency === "high");
    return `${expiries.length} major expiries on the radar. Most urgent: ${urgent.map((e) => `${e.tenant} at ${e.mall} (${e.sqft.toLocaleString()} sqft, ${fmtMonth(e.expiry)})`).join(" and ")}. Start renewal conversations now.`;
  },
  supply: () =>
    `New supply averages just ~300k sqft/yr through 2029 — under half the decade norm. 2026: ${supplyPipeline.filter((p) => p.nla !== null).map((p) => `${p.project} (${p.nla}k sqft, ${p.zone})`).join(", ")}. The big 2028 wave: MBS expansion retail and the Marina Square redevelopment.`,
  tourism: () =>
    `April arrivals were ${kpis.touristArrivals.value}M, easing ${Math.abs(kpis.touristArrivals.change)}% from March. STB still forecasts 17–18M arrivals for 2026 (S$31–32.5B receipts), so the full-year tourism tailwind for Orchard and Marina Bay remains intact.`,
  fnb: () => {
    const fb = storeMoves.filter((m) => m.category === "F&B" && m.type === "open");
    return `F&B is the most active leasing category. Recent openings: ${fb.map((m) => `${m.brand} (${m.location})`).join(", ")}. Chick-fil-A's Bugis+ debut headlines the US-chicken wave; Chinese premium tea (Molly Tea) is the most aggressive taker of small CBD units.`;
  },
  compare: () =>
    `Orchard prime S$23.20 psf at 7.1% vacancy (rising) vs suburban prime S$14.70 psf at ~4.1% (tightening). Suburban is the stronger story right now — near-full occupancy and F&B waiting lists. For expanding F&B I'd target Tampines or Jurong East first; Orchard currently favours tenants negotiating flagship deals.`,
};

const HELP = `I can answer from the platform's data — try:\n\n• "What's available at Suntec City?"\n• "Rents and vacancy in Tampines"\n• "Compare Orchard vs Jurong East"\n• "What happened to Isetan?"\n• "Any lease expiries coming up?"\n• "Summarise the top news"\n\nTip: connect a Claude API key in settings (⚙) for free-form AI answers.`;

export function answerLocally(question: string): string {
  const q = " " + norm(question) + " ";

  if (/^\s*(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(q.trim())) {
    return "Hello! Ask me about rents, vacancy, available units, store movements, news or the deal pipeline.";
  }
  if (/\b(thanks|thank you|cheers)\b/.test(q)) {
    return "Anytime. Anything else on the market?";
  }

  const brand = brandAnswer(q);
  if (brand) return brand;

  const mall = findMall(q);
  let found = findClusters(q);
  let intents = scoreIntents(q);

  // Short follow-ups: reuse the last entity ("what about rents there?")
  const refersBack = /\b(there|that|it|same|how about|what about)\b/.test(q);
  if (!mall && found.length === 0 && refersBack) {
    if (memory.mall) return mallAnswer(memory.mall);
    if (memory.cluster) found = [memory.cluster];
  }

  if (mall && (intents.length === 0 || intents.includes("units") || intents.includes("vacancy") || intents.includes("rent") || intents.includes("expiry"))) {
    return mallAnswer(mall);
  }

  if (intents.includes("compare")) {
    if (found.length >= 2) return compareClusters(found[0], found[1]);
    return macroAnswers.compare();
  }

  if (found.length === 1) {
    return clusterAnswer(found[0], intents.filter((i) => i !== "compare"));
  }
  if (found.length >= 2) {
    return compareClusters(found[0], found[1]);
  }

  // Macro: answer the top one or two intents
  intents = intents.filter((i) => i in macroAnswers);
  if (intents.length >= 2 && intents[0] !== intents[1]) {
    return `${macroAnswers[intents[0]]()}\n\n${macroAnswers[intents[1]]()}`;
  }
  if (intents.length === 1) {
    return macroAnswers[intents[0]]();
  }

  return HELP;
}
