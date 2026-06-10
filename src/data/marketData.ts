// Singapore retail market data — snapshot as of Q1 2026.
// In production these feed from URA REALIS, data.gov.sg, SingStat and news APIs.

export interface RetailCluster {
  id: string;
  name: string;
  tier: "Prime" | "City Fringe" | "Suburban";
  rentPsf: number; // S$ psf/month, prime floor
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
    name: "Orchard Road",
    tier: "Prime",
    rentPsf: 36.4, rentChangeYoY: 3.2, vacancy: 6.1, intensity: 1.0,
    keyMalls: ["ION Orchard", "Ngee Ann City", "Paragon", "Plaza Singapura", "313@Somerset"],
    hotCategories: ["Luxury", "Beauty", "Flagship F&B"],
    note: "Tight prime floor availability; luxury brands competing for flagship space. Tourist recovery driving rents.",
  },
  {
    id: "marina",
    name: "Marina Bay / Downtown",
    tier: "Prime",
    rentPsf: 32.8, rentChangeYoY: 2.5, vacancy: 7.4, intensity: 0.85,
    keyMalls: ["Marina Bay Sands", "Marina Square", "Suntec City", "Raffles City"],
    hotCategories: ["Luxury", "Experiential", "Premium F&B"],
    note: "MBS premium retail outperforming; Suntec repositioning ongoing with convention traffic back at full strength.",
  },
  {
    id: "bugis",
    name: "City Hall / Bugis",
    tier: "Prime",
    rentPsf: 28.6, rentChangeYoY: 2.1, vacancy: 5.8, intensity: 0.8,
    keyMalls: ["Bugis Junction", "Bugis+", "Funan", "CityLink Mall"],
    hotCategories: ["Youth Fashion", "F&B", "Lifestyle"],
    note: "Strong youth catchment; Funan tech-lifestyle positioning attracting new-to-market concepts.",
  },
  {
    id: "chinatown",
    name: "Chinatown / Tanjong Pagar",
    tier: "City Fringe",
    rentPsf: 22.4, rentChangeYoY: 1.8, vacancy: 8.2, intensity: 0.6,
    keyMalls: ["100AM", "Chinatown Point", "Guoco Tower retail"],
    hotCategories: ["F&B", "Korean concepts", "Wellness"],
    note: "CBD lunch crowd fully back; Korean F&B operators actively seeking 800-1,500 sqft units.",
  },
  {
    id: "harbourfront",
    name: "HarbourFront / Sentosa",
    tier: "City Fringe",
    rentPsf: 24.1, rentChangeYoY: 1.2, vacancy: 6.9, intensity: 0.65,
    keyMalls: ["VivoCity", "HarbourFront Centre"],
    hotCategories: ["Family", "F&B", "Athleisure"],
    note: "VivoCity consistently top-3 mall by footfall; Sentosa gateway traffic supports experiential retail.",
  },
  {
    id: "paya-lebar",
    name: "Paya Lebar / Katong",
    tier: "City Fringe",
    rentPsf: 20.8, rentChangeYoY: 2.4, vacancy: 7.1, intensity: 0.55,
    keyMalls: ["PLQ Mall", "Paya Lebar Square", "i12 Katong", "Parkway Parade"],
    hotCategories: ["F&B", "Enrichment", "Fitness"],
    note: "Commercial hub maturing; East-side affluent catchment driving premium grocer and F&B demand.",
  },
  {
    id: "tampines",
    name: "Tampines",
    tier: "Suburban",
    rentPsf: 19.6, rentChangeYoY: 2.8, vacancy: 4.3, intensity: 0.7,
    keyMalls: ["Tampines Mall", "Century Square", "Tampines 1"],
    hotCategories: ["Family", "Fast Fashion", "F&B"],
    note: "One of the tightest suburban markets — regional centre catchment of 250k+ residents, near-full occupancy.",
  },
  {
    id: "jurong",
    name: "Jurong East",
    tier: "Suburban",
    rentPsf: 19.2, rentChangeYoY: 3.5, vacancy: 4.8, intensity: 0.7,
    keyMalls: ["Jem", "Westgate", "IMM (outlet)"],
    hotCategories: ["Outlet", "Family", "F&B"],
    note: "Jurong Lake District momentum building ahead of new office supply; IMM remains top outlet destination.",
  },
  {
    id: "woodlands",
    name: "Woodlands",
    tier: "Suburban",
    rentPsf: 17.8, rentChangeYoY: 1.9, vacancy: 5.2, intensity: 0.5,
    keyMalls: ["Causeway Point", "Woods Square"],
    hotCategories: ["Value", "F&B", "Services"],
    note: "JB-SG RTS Link (2026 opening) expected to lift cross-border footfall significantly.",
  },
  {
    id: "serangoon",
    name: "Serangoon / Hougang",
    tier: "Suburban",
    rentPsf: 18.9, rentChangeYoY: 2.2, vacancy: 4.6, intensity: 0.6,
    keyMalls: ["NEX", "Hougang Mall", "Heartland Mall"],
    hotCategories: ["Family", "F&B", "Enrichment"],
    note: "NEX anchors the north-east corridor; consistently high weekend footfall and waiting list for F&B units.",
  },
  {
    id: "punggol",
    name: "Punggol / Sengkang",
    tier: "Suburban",
    rentPsf: 17.2, rentChangeYoY: 3.1, vacancy: 5.5, intensity: 0.5,
    keyMalls: ["Waterway Point", "Compass One", "Punggol Coast Mall"],
    hotCategories: ["Family", "Enrichment", "F&B"],
    note: "Youngest demographic in SG; Punggol Digital District workers adding weekday traffic from 2025.",
  },
  {
    id: "bishan",
    name: "Bishan / AMK",
    tier: "Suburban",
    rentPsf: 18.4, rentChangeYoY: 1.6, vacancy: 4.9, intensity: 0.55,
    keyMalls: ["Junction 8", "AMK Hub"],
    hotCategories: ["F&B", "Services", "Value Fashion"],
    note: "Stable heartland performer; strong transport interchange catchment.",
  },
];

// ---- Market pulse KPIs ----
export const kpis = {
  islandVacancy: { value: 6.5, change: -0.4, label: "Island-wide Vacancy", unit: "%", direction: "down-good" },
  primeOrchardRent: { value: 36.4, change: 3.2, label: "Prime Orchard Rent", unit: "S$ psf/mo", direction: "up-good" },
  suburbanRent: { value: 18.7, change: 2.5, label: "Avg Suburban Rent", unit: "S$ psf/mo", direction: "up-good" },
  retailSalesIdx: { value: 108.2, change: 4.1, label: "Retail Sales Index", unit: "(2017=100)", direction: "up-good" },
  touristArrivals: { value: 1.62, change: 8.3, label: "Monthly Visitors", unit: "M", direction: "up-good" },
  newSupply: { value: 0.82, change: 0, label: "2026 New Supply", unit: "M sqft NLA", direction: "neutral" },
};

export const rentalTrend = [
  { quarter: "Q1 24", orchard: 33.1, suburban: 17.4, cityFringe: 21.2 },
  { quarter: "Q2 24", orchard: 33.8, suburban: 17.6, cityFringe: 21.5 },
  { quarter: "Q3 24", orchard: 34.2, suburban: 17.9, cityFringe: 21.9 },
  { quarter: "Q4 24", orchard: 34.9, suburban: 18.1, cityFringe: 22.2 },
  { quarter: "Q1 25", orchard: 35.2, suburban: 18.2, cityFringe: 22.4 },
  { quarter: "Q2 25", orchard: 35.6, suburban: 18.4, cityFringe: 22.7 },
  { quarter: "Q3 25", orchard: 35.9, suburban: 18.5, cityFringe: 22.9 },
  { quarter: "Q4 25", orchard: 36.1, suburban: 18.6, cityFringe: 23.1 },
  { quarter: "Q1 26", orchard: 36.4, suburban: 18.7, cityFringe: 23.3 },
];

export const vacancyTrend = [
  { quarter: "Q1 24", vacancy: 7.6 },
  { quarter: "Q2 24", vacancy: 7.4 },
  { quarter: "Q3 24", vacancy: 7.2 },
  { quarter: "Q4 24", vacancy: 7.1 },
  { quarter: "Q1 25", vacancy: 6.9 },
  { quarter: "Q2 25", vacancy: 6.8 },
  { quarter: "Q3 25", vacancy: 6.7 },
  { quarter: "Q4 25", vacancy: 6.6 },
  { quarter: "Q1 26", vacancy: 6.5 },
];

export const supplyPipeline = [
  { project: "Punggol Coast Mall Ph 2", zone: "Punggol", nla: 120, opening: "Q3 2026" },
  { project: "Jurong Lake District retail", zone: "Jurong East", nla: 280, opening: "Q1 2027" },
  { project: "One Holland Village ext.", zone: "Holland V", nla: 85, opening: "Q4 2026" },
  { project: "Pasir Ris Mall (new)", zone: "Pasir Ris", nla: 195, opening: "Q2 2026" },
  { project: "Bukit Timah CC retail", zone: "Bukit Timah", nla: 60, opening: "Q4 2026" },
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
  { id: 1, type: "open", brand: "Shake Shack", category: "F&B", location: "Tampines Mall #01-32", cluster: "Tampines", date: "2026-06-08", sqft: 2800, detail: "8th SG outlet — first in the east heartlands. Signals confidence in suburban premium F&B.", signal: "expansion" },
  { id: 2, type: "open", brand: "Setsugekka (Tokyo)", category: "F&B", location: "ION Orchard B2", cluster: "Orchard Road", date: "2026-06-05", sqft: 950, detail: "First SEA outlet for the Michelin-listed soba bar. New-to-market Japanese F&B wave continues.", signal: "new-to-market" },
  { id: 3, type: "close", brand: "Esprit", category: "Fashion", location: "Suntec City #01-415", cluster: "Marina Bay / Downtown", date: "2026-06-03", sqft: 3200, detail: "Final SG store closure — completes regional exit. 3,200 sqft prime unit now available.", signal: "exit" },
  { id: 4, type: "open", brand: "Oh!Some", category: "Lifestyle", location: "Bugis Junction L2", cluster: "City Hall / Bugis", date: "2026-06-01", sqft: 4500, detail: "Chinese lifestyle retailer's 3rd SG store in 8 months — aggressive expansion play.", signal: "expansion" },
  { id: 5, type: "open", brand: "Aesop", category: "Beauty", location: "Jem #01-24", cluster: "Jurong East", date: "2026-05-28", sqft: 680, detail: "First west-side standalone — premium beauty pushing into suburban malls.", signal: "expansion" },
  { id: 6, type: "close", brand: "Cotton On Kids", category: "Fashion", location: "NEX #02-18", cluster: "Serangoon / Hougang", date: "2026-05-26", sqft: 1400, detail: "Consolidating into main-line stores. Unit reportedly pre-committed to enrichment operator.", signal: "consolidation" },
  { id: 7, type: "open", brand: "Pop Mart (flagship)", category: "Lifestyle", location: "313@Somerset #01-11", cluster: "Orchard Road", date: "2026-05-24", sqft: 3100, detail: "Largest SEA flagship; collectibles category still running hot with queue management on weekends.", signal: "expansion" },
  { id: 8, type: "open", brand: "Blue Bottle Coffee", category: "F&B", location: "Raffles City #01-20", cluster: "City Hall / Bugis", date: "2026-05-20", sqft: 1600, detail: "Long-awaited SG entry. Specialty coffee segment intensifying — watch %Arabica response.", signal: "new-to-market" },
  { id: 9, type: "close", brand: "Sasa Cosmetics", category: "Beauty", location: "Causeway Point #01-09", cluster: "Woodlands", date: "2026-05-18", sqft: 900, detail: "Down to 4 SG stores from 22 peak. HK beauty chains losing ground to KR/CN entrants.", signal: "consolidation" },
  { id: 10, type: "open", brand: "Nintendo Store", category: "Entertainment", location: "VivoCity L1 (ex-Forever21)", cluster: "HarbourFront / Sentosa", date: "2026-05-15", sqft: 8200, detail: "First official SEA Nintendo store — destination retail anchor, expected 2-hr queues at launch.", signal: "new-to-market" },
  { id: 11, type: "close", brand: "Fun Toast", category: "F&B", location: "AMK Hub B1", cluster: "Bishan / AMK", date: "2026-05-12", sqft: 1100, detail: "Lease-end exit; landlord seeking premium coffee concept at +15% rent.", signal: "exit" },
  { id: 12, type: "open", brand: "Lululemon", category: "Fashion", location: "PLQ Mall #01-15", cluster: "Paya Lebar / Katong", date: "2026-05-10", sqft: 2400, detail: "East-side expansion continues; athleisure demand resilient post-pandemic.", signal: "expansion" },
  { id: 13, type: "open", brand: "Luckin Coffee", category: "F&B", location: "Waterway Point B1", cluster: "Punggol / Sengkang", date: "2026-05-08", sqft: 750, detail: "42nd SG outlet in 30 months — fastest F&B rollout in SG history.", signal: "expansion" },
  { id: 14, type: "close", brand: "Robinsons (pop-up)", category: "Lifestyle", location: "Marina Square L2", cluster: "Marina Bay / Downtown", date: "2026-05-05", sqft: 5200, detail: "Online-to-offline experiment ends after 14 months. Large-format space back on market.", signal: "exit" },
  { id: 15, type: "open", brand: "Gentle Monster", category: "Luxury", location: "Ngee Ann City L1", cluster: "Orchard Road", date: "2026-05-02", sqft: 2900, detail: "KR eyewear label upgrades to duplex flagship — experiential luxury format.", signal: "expansion" },
];

export const weeklyVelocity = [
  { week: "W18", opens: 4, closes: 2 },
  { week: "W19", opens: 6, closes: 3 },
  { week: "W20", opens: 5, closes: 2 },
  { week: "W21", opens: 7, closes: 4 },
  { week: "W22", opens: 5, closes: 1 },
  { week: "W23", opens: 8, closes: 3 },
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
  { id: 1, headline: "URA Q1 2026: retail rents up 0.9% q-o-q, fourth straight quarter of growth", source: "Business Times", date: "2026-06-09", category: "Market", summary: "Central region rents +0.9%; vacancy tightened to 6.5%. Suburban malls near full occupancy — landlords regaining pricing power in renewals.", impact: "high" },
  { id: 2, headline: "Chinese tea chain HeyTea signs 12-store SG expansion deal", source: "Straits Times", date: "2026-06-08", category: "Brands", summary: "Aggressive island-wide rollout targeting heartland malls; reportedly paying above-market rents to secure prime B1 units near MRT entrances.", impact: "high" },
  { id: 3, headline: "RTS Link on track for Dec 2026 — Woodlands retail braces for JB shopper wave", source: "CNA", date: "2026-06-07", category: "Market", summary: "Causeway Point and Woods Square landlords already repositioning tenant mix toward cross-border value shoppers and F&B.", impact: "medium" },
  { id: 4, headline: "Frasers Centrepoint Trust acquires 50% stake in NEX for S$652m", source: "Business Times", date: "2026-06-05", category: "Deals", summary: "Implied cap rate ~4.8%. Suburban mall valuations holding firm; institutional appetite for heartland retail remains strong.", impact: "high" },
  { id: 5, headline: "CBRE forecasts prime Orchard rents to grow 3-4% in 2026", source: "Retail Asia", date: "2026-06-04", category: "Competitor", summary: "Competitor research cites limited new supply and luxury demand. Aligns with our house view of 3.2% — useful validation point for client pitches.", impact: "medium" },
  { id: 6, headline: "GST tourist refund digitisation cuts processing to 3 minutes", source: "CNA", date: "2026-06-02", category: "Policy", summary: "Smoother tax-free shopping expected to lift luxury conversion rates on Orchard; brands tracking basket-size impact.", impact: "low" },
  { id: 7, headline: "Don Don Donki to slow SG expansion after 18th store", source: "Straits Times", date: "2026-05-30", category: "Brands", summary: "JP discount retailer hitting saturation; will focus on renewals. Large-format (15-25k sqft) demand may soften in suburban malls.", impact: "medium" },
  { id: 8, headline: "Savills: SG retail investment volume hits S$2.1B in H1, +38% y-o-y", source: "Retail Asia", date: "2026-05-28", category: "Competitor", summary: "Strata retail and suburban malls leading. More owners may test the market — watch for leasing mandates from new owners.", impact: "medium" },
  { id: 9, headline: "Orchard Road rejuvenation: URA unveils pedestrianisation pilot for 2027", source: "Business Times", date: "2026-05-26", category: "Policy", summary: "Weekend car-free zones between Scotts and Bideford. Landlords broadly positive; F&B spillover seating opportunities flagged.", impact: "high" },
  { id: 10, headline: "Muji opens 'Muji Base' concept — first co-working retail hybrid in SEA", source: "Retail Asia", date: "2026-05-24", category: "Brands", summary: "8,000 sqft at Funan blends retail, café and workspace. Hybrid formats gaining traction with landlords seeking traffic anchors.", impact: "low" },
];

// ---- Deal pipeline ----
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
  { id: 1, tenant: "HeyTea", category: "F&B", requirement: "600-900 sqft, B1 near MRT", target: "Tampines Mall / NEX", stage: "Negotiating", value: 420, broker: "SL", nextAction: "Counter-offer due Thu", daysInStage: 6 },
  { id: 2, tenant: "Arc'teryx", category: "Fashion", requirement: "2,500 sqft flagship", target: "ION Orchard L1", stage: "Legal", value: 1850, broker: "NK", nextAction: "LOI signed — lease docs w/ legal", daysInStage: 12 },
  { id: 3, tenant: "Regional bank (conf.)", category: "Services", requirement: "1,200 sqft branch", target: "Jem / Westgate", stage: "Viewing", value: 360, broker: "SL", nextAction: "Site tour Fri 2pm", daysInStage: 3 },
  { id: 4, tenant: "Korean BBQ group", category: "F&B", requirement: "3,000-4,000 sqft", target: "PLQ / i12 Katong", stage: "Prospecting", value: 780, broker: "JT", nextAction: "Shortlist 5 units by Wed", daysInStage: 2 },
  { id: 5, tenant: "Lego Certified Store", category: "Lifestyle", requirement: "1,800 sqft", target: "VivoCity L2", stage: "Negotiating", value: 690, broker: "NK", nextAction: "Landlord revert on fit-out period", daysInStage: 9 },
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
