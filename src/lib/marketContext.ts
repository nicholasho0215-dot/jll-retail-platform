import { clusters, kpis, storeMoves, news, deals, expiries, mallSpaces, supplyPipeline, rentalTrend, vacancyTrend } from "@/data/marketData";

// Serialize the platform dataset into a compact context block shared by the
// Claude system prompt and grounding for the built-in engine's fallbacks.
export function buildMarketContext(): string {
  const lines: string[] = [];

  lines.push("## Market KPIs (Q1 2026 unless noted)");
  for (const k of Object.values(kpis)) {
    lines.push(`- ${k.label}: ${k.value} ${k.unit} (change: ${k.change}${k.changeLabel || ""})`);
  }

  lines.push("\n## Retail clusters (rent = S$ psf/mo prime, Savills basket)");
  for (const c of clusters) {
    lines.push(`- ${c.name} [${c.tier}]: rent ${c.rentPsf}, +${c.rentChangeYoY}% y-o-y, vacancy ${c.vacancy}%. Malls: ${c.keyMalls.join(", ")}. Hot: ${c.hotCategories.join(", ")}. ${c.note}`);
  }

  lines.push("\n## Rent trend (quarterly, S$ psf/mo)");
  lines.push(rentalTrend.map((r) => `${r.quarter}: Orchard ${r.orchard} / suburban ${r.suburban} / island prime ${r.islandPrime}`).join("; "));

  lines.push("\n## Island vacancy trend (%)");
  lines.push(vacancyTrend.map((v) => `${v.quarter}: ${v.vacancy}`).join("; "));

  lines.push("\n## Store openings & closures (recent)");
  for (const m of storeMoves) {
    lines.push(`- ${m.date} ${m.type.toUpperCase()}: ${m.brand} (${m.category}) at ${m.location}${m.sqft ? `, ${m.sqft} sqft` : ""} [${m.signal}] — ${m.detail}`);
  }

  lines.push("\n## News");
  for (const n of news) {
    lines.push(`- ${n.date} [${n.category}/${n.impact}] ${n.headline} (${n.source}) — ${n.summary}`);
  }

  lines.push("\n## Supply pipeline");
  for (const p of supplyPipeline) {
    lines.push(`- ${p.project} (${p.zone}): ${p.nla !== null ? `${p.nla}k sqft` : "NLA TBC"}, ${p.opening}`);
  }

  lines.push("\n## Internal deal pipeline (confidential, illustrative)");
  for (const d of deals) {
    lines.push(`- ${d.tenant} (${d.category}): ${d.requirement}, target ${d.target}, stage ${d.stage}, ~S$${d.value}k/yr, broker ${d.broker}, next: ${d.nextAction}`);
  }

  lines.push("\n## Lease expiry radar");
  for (const e of expiries) {
    lines.push(`- ${e.tenant} at ${e.mall}: ${e.sqft} sqft, expires ${e.expiry}, urgency ${e.urgency}`);
  }

  lines.push("\n## Unit availability by mall (Space Finder)");
  for (const m of mallSpaces) {
    lines.push(`- ${m.mall} (${m.cluster}, ${m.tier}):`);
    for (const u of m.units) {
      lines.push(`  - ${u.unit} ${u.level}, ${u.sqft} sqft, ${u.status}, available ${u.availableFrom}${u.currentTenant ? `, currently ${u.currentTenant}` : ""}, ask S$${u.askPsf} psf. Suits: ${u.suitedFor.join(", ")}`);
    }
  }

  return lines.join("\n");
}

export const SYSTEM_PROMPT = `You are the Retail Pulse Market Assistant — an expert analyst for JLL's Singapore retail leasing team, embedded in their intelligence platform.

Ground every answer in the platform data below. It is a snapshot as of 11 June 2026 (URA Q1 2026 statistics, SingStat April 2026, STB April 2026, curated news). If asked about something outside this data, say so briefly and answer from general knowledge of the Singapore retail market, clearly flagging it as outside the snapshot.

Style: concise and broker-friendly. Lead with the number or the answer, then one or two sentences of colour. Use S$ psf/mo for rents. Plain text only — no markdown headers or tables; short dashes-style lists are fine. Most answers should be 2-5 sentences; unit listings can be longer.

The deal pipeline and expiry radar are confidential internal data — fine to discuss here (internal tool), never invent additions to them.`;
