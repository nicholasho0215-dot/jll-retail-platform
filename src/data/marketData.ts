// Singapore retail market data — refreshed 11 Jun 2026.
// Market stats: URA Q1 2026 release (as analysed by Savills, CBRE, Knight Frank,
// Cushman & Wakefield), SingStat retail sales (Apr 2026), STB arrivals (Apr 2026).
// Rent levels follow Savills' prime-space basket (Orchard S$23.20 psf, suburban
// S$14.70 psf). Store moves and news reflect reported events to early Jun 2026.
// Deal pipeline, expiry radar and unit-level availability remain illustrative —
// that data is private and would feed from internal systems in production.

export interface RetailCluster {
  id: string;
  name: string;
  tier: "Prime" | "City Fringe" | "Suburban";
  lat: number;
  lng: number;
  rentPsf: number; // S$ psf/month, prime floor (Savills basket basis)
  rentChangeYoY: number; // %
  vacancy: number; // %
  intensity: number; // 0-1 heat scale for map colouring
  keyMalls: string[];
  hotCategories: string[];
  note: string;
}

export const clusters: RetailCluster[] = [
  {
    id: "orchard",
    lat: 1.3048, lng: 103.8318,
    name: "Orchard Road",
    tier: "Prime",
    rentPsf: 23.2, rentChangeYoY: 0.3, vacancy: 7.1, intensity: 0.65,
    keyMalls: ["ION Orchard", "Ngee Ann City", "Paragon", "Plaza Singapura", "313@Somerset"],
    hotCategories: ["Flagship F&B", "Beauty", "Luxury"],
    note: "Vacancy rose to 7.1% in Q1 26 (from 6.6%) with negative net absorption after closures. International retailers delaying rollouts; rents flat with landlords offering promo support on secondary floors.",
  },
  {
    id: "marina",
    lat: 1.2835, lng: 103.859,
    name: "Marina Bay / Downtown",
    tier: "Prime",
    rentPsf: 21.0, rentChangeYoY: 0.6, vacancy: 7.6, intensity: 0.6,
    keyMalls: ["Marina Bay Sands", "Marina Square", "Suntec City", "Raffles City"],
    hotCategories: ["Experiential", "Premium F&B", "Luxury"],
    note: "Other-city-area prime rents up 0.6% q-o-q — best performing submarket. MBS expansion and Marina Square redevelopment headline the 2028 supply wave.",
  },
  {
    id: "bugis",
    lat: 1.2966, lng: 103.853,
    name: "City Hall / Bugis",
    tier: "Prime",
    rentPsf: 19.4, rentChangeYoY: 0.6, vacancy: 5.6, intensity: 0.7,
    keyMalls: ["Bugis Junction", "Bugis+", "Funan", "CityLink Mall"],
    hotCategories: ["New-to-market F&B", "Youth Fashion", "Lifestyle"],
    note: "Chick-fil-A picked Bugis+ for its Singapore debut — the strong youth catchment keeps drawing first-store decisions from new-to-market brands.",
  },
  {
    id: "chinatown",
    lat: 1.2785, lng: 103.8442,
    name: "Chinatown / Tanjong Pagar",
    tier: "City Fringe",
    rentPsf: 16.8, rentChangeYoY: 0.2, vacancy: 8.0, intensity: 0.45,
    keyMalls: ["100AM", "Chinatown Point", "Guoco Tower retail"],
    hotCategories: ["F&B", "Chinese tea concepts", "Wellness"],
    note: "Highest vacancy among tracked clusters. CBD lunch traffic steady; Chinese tea chains (Molly Tea et al) the most active space takers in early 2026.",
  },
  {
    id: "harbourfront",
    lat: 1.2654, lng: 103.8222,
    name: "HarbourFront / Sentosa",
    tier: "City Fringe",
    rentPsf: 17.6, rentChangeYoY: 0.4, vacancy: 6.5, intensity: 0.6,
    keyMalls: ["VivoCity", "HarbourFront Centre"],
    hotCategories: ["Family", "F&B", "Athleisure"],
    note: "VivoCity remains a top-3 mall by footfall. HarbourFront Centre redevelopment is on the medium-term supply radar.",
  },
  {
    id: "paya-lebar",
    lat: 1.3177, lng: 103.8927,
    name: "Paya Lebar / Katong",
    tier: "City Fringe",
    rentPsf: 15.9, rentChangeYoY: 0.5, vacancy: 5.9, intensity: 0.55,
    keyMalls: ["PLQ Mall", "Paya Lebar Square", "i12 Katong", "Parkway Parade"],
    hotCategories: ["F&B", "Enrichment", "Fitness"],
    note: "East-side affluent catchment supports premium grocer and F&B demand; occupancy firm in well-managed malls.",
  },
  {
    id: "tampines",
    lat: 1.3536, lng: 103.945,
    name: "Tampines",
    tier: "Suburban",
    rentPsf: 15.2, rentChangeYoY: 0.8, vacancy: 4.0, intensity: 0.9,
    keyMalls: ["Tampines Mall", "Century Square", "Tampines 1"],
    hotCategories: ["Family", "F&B", "Fast Fashion"],
    note: "Suburban vacancy tightened to ~4.1% island-wide in Q1 26 and Tampines is the tightest regional centre — near-full occupancy, waiting lists for F&B units.",
  },
  {
    id: "jurong",
    lat: 1.3331, lng: 103.743,
    name: "Jurong East",
    tier: "Suburban",
    rentPsf: 15.0, rentChangeYoY: 0.7, vacancy: 4.4, intensity: 0.85,
    keyMalls: ["Jem", "Westgate", "IMM (outlet)"],
    hotCategories: ["F&B", "Wellness", "Outlet"],
    note: "BUBBLE House's Korean-style urban spa and Sushi Zushi at Westgate headline recent openings; wellness and experiential concepts absorbing space.",
  },
  {
    id: "woodlands",
    lat: 1.436, lng: 103.786,
    name: "Woodlands",
    tier: "Suburban",
    rentPsf: 14.1, rentChangeYoY: 0.9, vacancy: 4.7, intensity: 0.75,
    keyMalls: ["Causeway Point", "Woods Square"],
    hotCategories: ["Value", "F&B", "Services"],
    note: "JB-SG RTS Link (Dec 2026) expected to lift cross-border footfall; landlords repositioning tenant mix toward value and F&B.",
  },
  {
    id: "serangoon",
    lat: 1.3506, lng: 103.8718,
    name: "Serangoon / Hougang",
    tier: "Suburban",
    rentPsf: 14.8, rentChangeYoY: 0.4, vacancy: 4.5, intensity: 0.7,
    keyMalls: ["NEX", "Hougang Mall", "Heartland Mall"],
    hotCategories: ["Family", "F&B", "Enrichment"],
    note: "Isetan closed its NEX store in April 2026 after 15 years — a rare multi-floor anchor floorplate now in play in an otherwise tight corridor.",
  },
  {
    id: "punggol",
    lat: 1.4063, lng: 103.9021,
    name: "Punggol / Sengkang",
    tier: "Suburban",
    rentPsf: 13.8, rentChangeYoY: 1.0, vacancy: 5.0, intensity: 0.65,
    keyMalls: ["Waterway Point", "Compass One", "Punggol Coast Mall"],
    hotCategories: ["Family", "Enrichment", "F&B"],
    note: "Youngest demographic in SG; Punggol Digital District workers adding weekday traffic.",
  },
  {
    id: "bishan",
    lat: 1.36, lng: 103.8485,
    name: "Bishan / AMK",
    tier: "Suburban",
    rentPsf: 14.4, rentChangeYoY: 0.5, vacancy: 4.6, intensity: 0.6,
    keyMalls: ["Junction 8", "AMK Hub"],
    hotCategories: ["F&B", "Services", "Value Fashion"],
    note: "Stable heartland performer; strong transport interchange catchment.",
  },
];

// ---- Market pulse KPIs ----
export const kpis = {
  islandVacancy: { value: 6.8, change: 0.6, label: "Island-wide Vacancy", unit: "% · Q1 26", changeLabel: "pp q-o-q", direction: "down-good" },
  primeOrchardRent: { value: 23.2, change: 0, label: "Orchard Prime Rent", unit: "S$ psf/mo", changeLabel: "% q-o-q", direction: "up-good" },
  suburbanRent: { value: 14.7, change: 0, label: "Suburban Prime Rent", unit: "S$ psf/mo", changeLabel: "% q-o-q", direction: "up-good" },
  retailSalesGrowth: { value: 5.4, change: 0.6, label: "Retail Sales · Apr 26", unit: "% y-o-y", changeLabel: "pp vs Mar", direction: "up-good" },
  touristArrivals: { value: 1.33, change: -6.7, label: "Visitors · Apr 26", unit: "M", changeLabel: "% m-o-m", direction: "up-good" },
  newSupply: { value: 0.3, change: -62, label: "Avg Supply 2026–29", unit: "M sqft/yr", changeLabel: "% vs decade avg", direction: "neutral" },
};

// Prime rents, S$ psf/mo — Savills basket (Orchard, suburban) and Knight Frank
// island-wide prime average.
export const rentalTrend = [
  { quarter: "Q1 24", orchard: 22.6, suburban: 14.3, islandPrime: 27.4 },
  { quarter: "Q2 24", orchard: 22.7, suburban: 14.4, islandPrime: 27.5 },
  { quarter: "Q3 24", orchard: 22.8, suburban: 14.4, islandPrime: 27.6 },
  { quarter: "Q4 24", orchard: 22.9, suburban: 14.5, islandPrime: 27.7 },
  { quarter: "Q1 25", orchard: 22.9, suburban: 14.6, islandPrime: 27.8 },
  { quarter: "Q2 25", orchard: 23.0, suburban: 14.6, islandPrime: 27.9 },
  { quarter: "Q3 25", orchard: 23.1, suburban: 14.7, islandPrime: 28.1 },
  { quarter: "Q4 25", orchard: 23.2, suburban: 14.7, islandPrime: 28.5 },
  { quarter: "Q1 26", orchard: 23.2, suburban: 14.7, islandPrime: 28.6 },
];

// Island-wide private retail vacancy, % (URA basis)
export const vacancyTrend = [
  { quarter: "Q1 24", vacancy: 7.4 },
  { quarter: "Q2 24", vacancy: 7.2 },
  { quarter: "Q3 24", vacancy: 7.0 },
  { quarter: "Q4 24", vacancy: 6.8 },
  { quarter: "Q1 25", vacancy: 6.8 },
  { quarter: "Q2 25", vacancy: 6.6 },
  { quarter: "Q3 25", vacancy: 6.5 },
  { quarter: "Q4 25", vacancy: 6.2 },
  { quarter: "Q1 26", vacancy: 6.8 },
];

export const supplyPipeline: { project: string; zone: string; nla: number | null; opening: string }[] = [
  { project: "CanningHill Square", zone: "Clarke Quay", nla: 87, opening: "2026" },
  { project: "Parc Point", zone: "Tengah", nla: 75, opening: "2026" },
  { project: "Marina Square redev.", zone: "Marina Centre", nla: null, opening: "2028" },
  { project: "Forum Mall redev.", zone: "Orchard", nla: null, opening: "2028" },
  { project: "MBS expansion retail", zone: "Marina Bay", nla: null, opening: "2028" },
];

// ---- Shop openings / closings tracker ----
export interface StoreMove {
  id: number;
  type: "open" | "close";
  brand: string;
  category: "F&B" | "Fashion" | "Beauty" | "Lifestyle" | "Luxury" | "Services" | "Entertainment";
  location: string;
  cluster: string;
  date: string;
  sqft?: number;
  detail: string;
  signal: "expansion" | "new-to-market" | "consolidation" | "exit" | "relocation";
}

export const storeMoves: StoreMove[] = [
  { id: 1, type: "open", brand: "The Upcycled Playground", category: "Entertainment", location: "Woodleigh Mall", cluster: "Serangoon / Hougang", date: "2026-06-01", detail: "Free kids play area built from upcycled materials — landlords leaning on family anchors to drive heartland footfall.", signal: "new-to-market" },
  { id: 2, type: "open", brand: "Chick-fil-A", category: "F&B", location: "Bugis+", cluster: "City Hall / Bugis", date: "2026-05-30", detail: "The US chicken giant's Singapore debut — one of the year's most-watched new-to-market entries; queues from day one.", signal: "new-to-market" },
  { id: 3, type: "open", brand: "Lotteria", category: "F&B", location: "Jewel Changi Airport", cluster: "Tampines", date: "2026-05-22", detail: "Korean burger chain lands at Jewel as part of its SEA expansion — airport retail still a launchpad for first stores.", signal: "new-to-market" },
  { id: 4, type: "open", brand: "BUBBLE House", category: "Lifestyle", location: "Jurong East", cluster: "Jurong East", date: "2026-05-17", detail: "Korean-style urban spa with capsule beds and soaking pools — wellness/experiential concepts absorbing larger suburban floorplates.", signal: "new-to-market" },
  { id: 5, type: "open", brand: "Sushi Zushi Charcoal Grill & Sushiya", category: "F&B", location: "Westgate", cluster: "Jurong East", date: "2026-05-12", detail: "Japanese grill-and-sushi concept adds to Westgate's F&B refresh.", signal: "expansion" },
  { id: 6, type: "close", brand: "Cathay Cineplexes", category: "Entertainment", location: "Island-wide", cluster: "Marina Bay / Downtown", date: "2026-05-08", detail: "Voluntary liquidation — large cinema boxes returning to the market. Landlords studying entertainment, fitness and event-hall conversions.", signal: "exit" },
  { id: 7, type: "close", brand: "Snow City", category: "Entertainment", location: "Jurong East (Science Centre)", cluster: "Jurong East", date: "2026-05-26", detail: "Closing 30 Sep 2026 after a 26-year run; farewell campaign underway.", signal: "exit" },
  { id: 8, type: "close", brand: "Isetan", category: "Lifestyle", location: "NEX, Serangoon", cluster: "Serangoon / Hougang", date: "2026-04-30", detail: "Closed after 15 years at NEX amid the department-store shake-up. Isetan Scotts is now its sole SG store; multi-floor floorplate freed.", signal: "exit" },
  { id: 9, type: "open", brand: "Molly Tea", category: "F&B", location: "CBD & city malls (multiple)", cluster: "Chinatown / Tanjong Pagar", date: "2026-04-20", detail: "Chinese premium tea chain among the most active takers of new space in early 2026 (CBRE) — jasmine-tea wave following the bubble-tea boom.", signal: "new-to-market" },
  { id: 10, type: "open", brand: "Tutto", category: "F&B", location: "City area", cluster: "Marina Bay / Downtown", date: "2026-04-10", detail: "Among the F&B operators leading Q1 2026 leasing demand alongside Jumboree and Molly Tea (CBRE commentary on URA stats).", signal: "new-to-market" },
  { id: 11, type: "open", brand: "Jumboree", category: "F&B", location: "Suburban malls (multiple)", cluster: "Tampines", date: "2026-03-28", detail: "Family-dining concept cited by CBRE among the quarter's notable space takers.", signal: "expansion" },
  { id: 12, type: "close", brand: "Isetan", category: "Lifestyle", location: "Tampines Mall", cluster: "Tampines", date: "2026-03-15", detail: "Earlier exit in the chain's consolidation — operations realigned 'for long-term sustainability' per management.", signal: "consolidation" },
];

export const weeklyVelocity = [
  { week: "W18", opens: 4, closes: 3 },
  { week: "W19", opens: 5, closes: 3 },
  { week: "W20", opens: 4, closes: 2 },
  { week: "W21", opens: 6, closes: 4 },
  { week: "W22", opens: 5, closes: 3 },
  { week: "W23", opens: 6, closes: 2 },
];

// ---- News ----
export interface NewsItem {
  id: number;
  headline: string;
  source: string;
  date: string;
  category: "Market" | "Deals" | "Brands" | "Policy" | "Competitor";
  summary: string;
  impact: "high" | "medium" | "low";
}

export const news: NewsItem[] = [
  { id: 1, headline: "Island-wide retail vacancy climbs to 6.8% in Q1 2026", source: "Savills Research", date: "2026-04-28", category: "Market", summary: "Up from 6.2% in Q4 25 — first material rise after two years of tightening. Orchard hit 7.1% with negative net absorption after closures; suburban tightened to ~4.1%.", impact: "high" },
  { id: 2, headline: "Prime retail rents tipped to grow 1–4% in 2026 despite Q1 dip", source: "EdgeProp / Knight Frank", date: "2026-04-24", category: "Market", summary: "Central-region rents slipped ~0.6% in Q1. Knight Frank holds a 2–4% full-year growth call, CBRE 1–2%, citing supply below half the historical average through 2029.", impact: "high" },
  { id: 3, headline: "Retail sales rise 5.4% y-o-y in April", source: "SingStat", date: "2026-06-05", category: "Market", summary: "Acceleration from March's 4.8%. F&B services also firmer — consumer sentiment supportive heading into GSS season.", impact: "medium" },
  { id: 4, headline: "Cathay Cineplexes enters voluntary liquidation", source: "Business Times", date: "2026-05-08", category: "Brands", summary: "End of a 90-year cinema brand's run. Large cinema boxes return to the market — affected landlords weighing entertainment, fitness and event-space conversions.", impact: "high" },
  { id: 5, headline: "Isetan shuts NEX store after 15 years; Scotts now sole outlet", source: "Malay Mail", date: "2026-04-18", category: "Brands", summary: "Department-store consolidation continues (Tampines closed earlier). A rare multi-floor suburban anchor floorplate is now available in a tight corridor.", impact: "high" },
  { id: 6, headline: "Chick-fil-A makes Singapore debut at Bugis+", source: "CNA", date: "2026-05-30", category: "Brands", summary: "Most-anticipated US F&B entry of the year. New-to-market F&B (Lotteria at Jewel, Molly Tea, Tutto) continues to drive leasing demand.", impact: "medium" },
  { id: 7, headline: "New retail supply to average just ~300k sqft a year through 2029", source: "Cushman & Wakefield", date: "2026-05-10", category: "Market", summary: "Less than half the decade average of 800k sqft. Orchard takes only 10% of the pipeline; next big wave is 2028 (MBS expansion, Marina Square redevelopment).", impact: "high" },
  { id: 8, headline: "STB forecasts 17–18M visitor arrivals for 2026", source: "STB / OCBC", date: "2026-05-15", category: "Policy", summary: "Tourism receipts projected at S$31–32.5B. April arrivals were 1.33M, easing from March's 1.43M — a watch item for Orchard and Marina Bay retail.", impact: "medium" },
  { id: 9, headline: "Great Singapore Sale 2026 launches mid-June", source: "Marketing-Interactive", date: "2026-06-08", category: "Market", summary: "GSS runs to mid-August. Landlords coordinating atrium activations; F&B and beauty expected to lead promotional traffic.", impact: "low" },
  { id: 10, headline: "Snow City to close after 26 years", source: "Marketing-Interactive", date: "2026-05-26", category: "Brands", summary: "Indoor snow attraction shuts 30 Sep 2026 with a farewell campaign — another large experiential box for the west-side market to absorb.", impact: "low" },
];

// ---- Deal pipeline (illustrative — internal data in production) ----
export interface Deal {
  id: number;
  tenant: string;
  category: string;
  requirement: string;
  target: string;
  stage: "Prospecting" | "Viewing" | "Negotiating" | "Legal" | "Signed";
  value: number; // est. annual rent S$k
  broker: string;
  nextAction: string;
  daysInStage: number;
}

export const deals: Deal[] = [
  { id: 1, tenant: "Molly Tea", category: "F&B", requirement: "600-900 sqft, B1 near MRT", target: "Tampines Mall / NEX", stage: "Negotiating", value: 420, broker: "SL", nextAction: "Counter-offer due Thu", daysInStage: 6 },
  { id: 2, tenant: "Arc'teryx", category: "Fashion", requirement: "2,500 sqft flagship", target: "ION Orchard L1", stage: "Legal", value: 1850, broker: "NK", nextAction: "LOI signed — lease docs w/ legal", daysInStage: 12 },
  { id: 3, tenant: "Regional bank (conf.)", category: "Services", requirement: "1,200 sqft branch", target: "Jem / Westgate", stage: "Viewing", value: 360, broker: "SL", nextAction: "Site tour Fri 2pm", daysInStage: 3 },
  { id: 4, tenant: "Korean BBQ group", category: "F&B", requirement: "3,000-4,000 sqft", target: "PLQ / i12 Katong", stage: "Prospecting", value: 780, broker: "JT", nextAction: "Shortlist 5 units by Wed", daysInStage: 2 },
  { id: 5, tenant: "Activity entertainment op (conf.)", category: "Entertainment", requirement: "25,000+ sqft anchor", target: "NEX ex-Isetan floorplate", stage: "Prospecting", value: 2400, broker: "NK", nextAction: "Feasibility deck for landlord", daysInStage: 4 },
  { id: 6, tenant: "Oh!Some", category: "Lifestyle", requirement: "4,000+ sqft", target: "Causeway Point", stage: "Signed", value: 940, broker: "JT", nextAction: "Handover 1 Jul", daysInStage: 1 },
  { id: 7, tenant: "Specialty grocer", category: "F&B", requirement: "8,000 sqft anchor", target: "Punggol Coast Mall", stage: "Viewing", value: 1280, broker: "SL", nextAction: "Second viewing + footfall data", daysInStage: 5 },
];

export const expiries = [
  { tenant: "Uniqlo", mall: "Bugis+ L1-L2", expiry: "2026-09-30", sqft: 12000, urgency: "high" },
  { tenant: "Food Republic", mall: "VivoCity L3", expiry: "2026-10-31", sqft: 18500, urgency: "high" },
  { tenant: "Best Denki", mall: "Ngee Ann City L5", expiry: "2026-12-31", sqft: 22000, urgency: "medium" },
  { tenant: "H&M", mall: "Jem L1", expiry: "2027-02-28", sqft: 15000, urgency: "medium" },
  { tenant: "Kopitiam", mall: "NEX B2", expiry: "2027-04-30", sqft: 9800, urgency: "low" },
];

// ---- Mall space availability (vacant / expiring / confirmed-exit units) ----
// Illustrative inventory anchored to reported events (Isetan NEX, Cathay
// liquidation); unit-level availability is private data in production.
export interface MallUnit {
  unit: string;
  level: string;
  sqft: number;
  status: "vacant" | "expiring" | "notice";
  availableFrom: string;
  currentTenant?: string;
  askPsf: number;
  suitedFor: string[];
}

export interface MallSpaces {
  mall: string;
  cluster: string;
  tier: "Prime" | "City Fringe" | "Suburban";
  units: MallUnit[];
}

export const mallSpaces: MallSpaces[] = [
  {
    mall: "NEX", cluster: "Serangoon", tier: "Suburban",
    units: [
      { unit: "Ex-Isetan floorplate", level: "L1–L4", sqft: 76000, status: "vacant", availableFrom: "2026-05-01", currentTenant: "Former Isetan (closed Apr 26)", askPsf: 9.5, suitedFor: ["Anchor", "Activity & entertainment", "Flagship grocer"] },
      { unit: "#03-55", level: "L3", sqft: 760, status: "vacant", availableFrom: "2026-06-01", askPsf: 16.5, suitedFor: ["F&B", "Services"] },
    ],
  },
  {
    mall: "ION Orchard", cluster: "Orchard Road", tier: "Prime",
    units: [
      { unit: "#B3-12", level: "B3", sqft: 850, status: "vacant", availableFrom: "2026-06-01", askPsf: 34.0, suitedFor: ["F&B", "Beauty"] },
      { unit: "#04-08", level: "L4", sqft: 1650, status: "expiring", availableFrom: "2026-10-01", currentTenant: "International fashion label", askPsf: 26.0, suitedFor: ["Fashion", "Lifestyle"] },
      { unit: "#B4-22", level: "B4", sqft: 480, status: "vacant", availableFrom: "2026-06-15", askPsf: 36.0, suitedFor: ["F&B kiosk", "Specialty tea"] },
    ],
  },
  {
    mall: "Ngee Ann City", cluster: "Orchard Road", tier: "Prime",
    units: [
      { unit: "#05-19", level: "L5", sqft: 2100, status: "expiring", availableFrom: "2026-12-31", currentTenant: "Best Denki (partial)", askPsf: 22.0, suitedFor: ["Lifestyle", "Electronics"] },
      { unit: "#B2-05", level: "B2", sqft: 720, status: "vacant", availableFrom: "2026-07-01", askPsf: 28.0, suitedFor: ["F&B", "Bakery"] },
    ],
  },
  {
    mall: "Suntec City", cluster: "Marina / City Hall", tier: "Prime",
    units: [
      { unit: "#01-44", level: "L1", sqft: 3200, status: "notice", availableFrom: "2026-08-01", currentTenant: "Fashion retailer (regional exit)", askPsf: 21.0, suitedFor: ["Fashion anchor", "Sports"] },
      { unit: "#02-330", level: "L2", sqft: 1450, status: "vacant", availableFrom: "2026-06-01", askPsf: 19.5, suitedFor: ["F&B", "Services"] },
      { unit: "#03-08", level: "L3", sqft: 980, status: "expiring", availableFrom: "2027-01-01", currentTenant: "Typo", askPsf: 18.0, suitedFor: ["Lifestyle", "Gifts"] },
    ],
  },
  {
    mall: "Raffles City", cluster: "Marina / City Hall", tier: "Prime",
    units: [
      { unit: "#B1-16", level: "B1", sqft: 640, status: "vacant", availableFrom: "2026-06-20", askPsf: 24.0, suitedFor: ["F&B", "Grab & go"] },
      { unit: "#02-25", level: "L2", sqft: 1900, status: "expiring", availableFrom: "2026-11-01", currentTenant: "Beauty multi-brand", askPsf: 21.5, suitedFor: ["Beauty", "Wellness"] },
    ],
  },
  {
    mall: "VivoCity", cluster: "HarbourFront", tier: "City Fringe",
    units: [
      { unit: "#02-88", level: "L2", sqft: 2400, status: "expiring", availableFrom: "2026-09-01", currentTenant: "Entertainment op (downsizing)", askPsf: 16.5, suitedFor: ["Entertainment", "Family"] },
      { unit: "#01-160", level: "L1", sqft: 1100, status: "vacant", availableFrom: "2026-06-01", askPsf: 20.0, suitedFor: ["F&B", "Waterfront dining"] },
      { unit: "#B2-30", level: "B2", sqft: 560, status: "vacant", availableFrom: "2026-07-01", askPsf: 18.0, suitedFor: ["F&B kiosk", "Beauty"] },
    ],
  },
  {
    mall: "Bugis Junction", cluster: "Bugis / Bras Basah", tier: "City Fringe",
    units: [
      { unit: "#03-14", level: "L3", sqft: 1750, status: "expiring", availableFrom: "2026-09-30", currentTenant: "Uniqlo (consolidating to Bugis+)", askPsf: 15.5, suitedFor: ["Fashion", "Lifestyle"] },
      { unit: "#01-78", level: "L1", sqft: 890, status: "vacant", availableFrom: "2026-06-10", askPsf: 17.5, suitedFor: ["F&B", "Street-front"] },
    ],
  },
  {
    mall: "Causeway Point", cluster: "Woodlands", tier: "Suburban",
    units: [
      { unit: "#07-01 (cinema)", level: "L7", sqft: 26000, status: "notice", availableFrom: "2026-08-01", currentTenant: "Cathay Cineplexes (liquidation)", askPsf: 6.5, suitedFor: ["Cinema", "Entertainment", "Fitness"] },
      { unit: "#02-19", level: "L2", sqft: 950, status: "vacant", availableFrom: "2026-06-01", askPsf: 14.5, suitedFor: ["F&B", "RTS-bound traffic"] },
    ],
  },
  {
    mall: "Tampines Mall", cluster: "Tampines", tier: "Suburban",
    units: [
      { unit: "#04-30", level: "L4", sqft: 1500, status: "expiring", availableFrom: "2026-10-01", currentTenant: "Bookstore (partial)", askPsf: 13.5, suitedFor: ["Education", "Lifestyle"] },
      { unit: "#B1-09", level: "B1", sqft: 420, status: "vacant", availableFrom: "2026-06-01", askPsf: 15.5, suitedFor: ["F&B kiosk", "Bubble tea"] },
    ],
  },
  {
    mall: "JEM", cluster: "Jurong East", tier: "Suburban",
    units: [
      { unit: "#01-12", level: "L1", sqft: 2050, status: "expiring", availableFrom: "2027-02-28", currentTenant: "H&M (format review)", askPsf: 15.0, suitedFor: ["Fashion", "Lifestyle anchor"] },
      { unit: "#04-19", level: "L4", sqft: 680, status: "vacant", availableFrom: "2026-06-01", askPsf: 13.0, suitedFor: ["F&B", "Enrichment"] },
      { unit: "#05-02", level: "L5", sqft: 1150, status: "expiring", availableFrom: "2026-09-01", currentTenant: "Fitness operator (renegotiating)", askPsf: 11.5, suitedFor: ["Wellness", "Fitness"] },
    ],
  },
];
