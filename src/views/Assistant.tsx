import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { clusters, kpis, storeMoves, news, deals, expiries, mallSpaces } from "@/data/marketData";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

// Rule-based assistant grounded in the platform dataset.
// Production build swaps this for a Claude API call with the same data as context.
function answer(q: string): string {
  const s = q.toLowerCase();

  const findCluster = () =>
    clusters.find((c) => {
      const tokens = c.name.toLowerCase().split(/[\s/]+/).filter((t) => t.length > 3);
      return tokens.some((t) => s.includes(t)) || c.keyMalls.some((m) => s.includes(m.toLowerCase()));
    });

  if (/(unit|space|sqft|available|free up|freeing)/.test(s)) {
    const mall = mallSpaces.find((m) => s.includes(m.mall.toLowerCase()));
    if (mall) {
      const lines = mall.units.map((u) => {
        const when = u.status === "vacant" ? "ready now" : `from ${new Date(u.availableFrom).toLocaleDateString("en-SG", { month: "short", year: "numeric" })}${u.currentTenant ? ` (currently ${u.currentTenant})` : ""}`;
        return `• ${u.unit} — ${u.sqft.toLocaleString()} sqft, S$${u.askPsf} psf, ${when}. Suits: ${u.suitedFor.join(", ")}`;
      });
      return `${mall.mall} (${mall.cluster}) has ${mall.units.length} ${mall.units.length > 1 ? "opportunities" : "opportunity"} on the radar:\n\n${lines.join("\n")}`;
    }
    const vacant = mallSpaces.flatMap((m) => m.units.filter((u) => u.status === "vacant").map(() => m.mall));
    const counts = vacant.reduce<Record<string, number>>((a, m) => ((a[m] = (a[m] ?? 0) + 1), a), {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const total = mallSpaces.reduce((s2, m) => s2 + m.units.length, 0);
    return `${total} units across ${mallSpaces.length} malls are vacant or freeing up soon. Most availability right now: ${top.map(([m, n]) => `${m} (${n})`).join(", ")}. Ask me about a specific mall — e.g. "what's available at Suntec City?" — or open the Space Finder tab.`;
  }

  if (/(vacancy|occupied|occupancy)/.test(s)) {
    const c = findCluster();
    if (c) return `${c.name} is running at ${c.vacancy}% vacancy (${c.tier} tier). ${c.note}`;
    return `Island-wide retail vacancy is ${kpis.islandVacancy.value}% (Q1 26), up ${kpis.islandVacancy.change}pp q-o-q — the first material rise after two years of tightening. Orchard climbed to 7.1% after a wave of closures, while suburban tightened to ~4.1%. Tightest: Tampines (4.0%) and Jurong East (4.4%); loosest: Chinatown/Tanjong Pagar at 8.0%.`;
  }

  if (/(rent|psf|price|cost)/.test(s)) {
    const c = findCluster();
    if (c) return `Prime floor rents in ${c.name} average S$${c.rentPsf} psf/month (Savills basket), up ${c.rentChangeYoY}% y-o-y. Key malls: ${c.keyMalls.join(", ")}. Hot categories there right now: ${c.hotCategories.join(", ")}.`;
    return `Current prime floor rents (Q1 26, Savills basket) — Orchard: S$${kpis.primeOrchardRent.value} psf/mo, suburban: S$${kpis.suburbanRent.value} psf/mo, both flat q-o-q; central-region rents dipped ~0.6% in Q1. Full-year 2026 calls: Knight Frank +2–4%, CBRE +1–2%, on supply of only ~${kpis.newSupply.value}M sqft/yr through 2029.`;
  }

  if (/(open|closed|closing|closure|new store|movement)/.test(s)) {
    const opens = storeMoves.filter((m) => m.type === "open");
    const closes = storeMoves.filter((m) => m.type === "close");
    const ntm = storeMoves.filter((m) => m.signal === "new-to-market").map((m) => m.brand);
    return `Recent moves: ${opens.length} openings vs ${closes.length} closures. Notable new-to-market entries: ${ntm.join(", ")}. Biggest closures to watch: Isetan's NEX exit (multi-floor anchor floorplate freed) and Cathay Cineplexes' liquidation returning cinema boxes to the market. Full list in the Open/Close tab.`;
  }

  if (/(news|headline|happened|this week|summar)/.test(s)) {
    const top = news.filter((n) => n.impact === "high").slice(0, 3);
    return `Top stories this week:\n\n${top.map((n, i) => `${i + 1}. ${n.headline} — ${n.summary}`).join("\n\n")}`;
  }

  if (/(pipeline|deal|negotiat)/.test(s)) {
    const closing = deals.filter((d) => d.stage === "Negotiating" || d.stage === "Legal");
    return `${deals.length} active deals worth ~S$${(deals.reduce((a, d) => a + d.value, 0) / 1000).toFixed(1)}M est. annual rent. ${closing.length} are in closing stages: ${closing.map((d) => `${d.tenant} (${d.stage} — ${d.nextAction})`).join("; ")}.`;
  }

  if (/(expir|renewal|lease end)/.test(s)) {
    const urgent = expiries.filter((e) => e.urgency === "high");
    return `${expiries.length} major expiries on the radar. Most urgent: ${urgent.map((e) => `${e.tenant} at ${e.mall} (${e.sqft.toLocaleString()} sqft, ${new Date(e.expiry).toLocaleDateString("en-SG", { month: "long", year: "numeric" })})`).join(" and ")}. Both are large-format anchors — start renewal conversations now.`;
  }

  if (/(supply|pipeline mall|new mall|upcoming)/.test(s)) {
    return `New supply averages just ~300k sqft/yr through 2029 — under half the decade norm. 2026 completions: CanningHill Square (87k sqft, Clarke Quay) and Parc Point (75k sqft, Tengah). The next big wave is 2028: MBS expansion retail and the Marina Square redevelopment. Constrained supply underpins the 1–4% rent-growth calls despite the Q1 vacancy uptick.`;
  }

  if (/(f&b|food|restaurant|cafe|coffee)/.test(s)) {
    const fb = storeMoves.filter((m) => m.category === "F&B" && m.type === "open");
    return `F&B remains the most active leasing category. Recent openings: ${fb.map((m) => `${m.brand} (${m.location})`).join(", ")}. Trends: Chick-fil-A's Bugis+ debut headlines the US-chicken wave, Lotteria extends the Korean fast-food push, and Chinese premium tea (Molly Tea) is the most aggressive taker of small CBD units.`;
  }

  if (/(tourist|visitor|arrival)/.test(s)) {
    return `April arrivals were ${kpis.touristArrivals.value}M, easing ${Math.abs(kpis.touristArrivals.change)}% from March — a watch item for Orchard and Marina Bay retail. STB still forecasts 17–18M arrivals for 2026 (S$31–32.5B in receipts), so the full-year tourism tailwind remains intact.`;
  }

  if (/(compare|vs|versus|better)/.test(s)) {
    return `Quick comparison — Orchard prime S$23.20 psf at 7.1% vacancy (rising) vs suburban prime S$14.70 psf at ~4.1% vacancy (tightening). Right now suburban is the stronger story: near-full occupancy, sticky catchment demand and F&B waiting lists. For expanding F&B clients I'd target Tampines or Jurong East first; Orchard currently favours tenants negotiating flagship deals.`;
  }

  return `I can help with anything on this platform's data. Try asking:\n\n• "What's the vacancy rate in Orchard?"\n• "Compare prime vs suburban rents"\n• "What shops opened or closed recently?"\n• "Summarise this week's top news"\n• "What's in our deal pipeline?"\n• "Any major lease expiries coming up?"`;
}

const suggestions = [
  "What's available at Suntec City?",
  "What's the vacancy in Orchard?",
  "What shops opened recently?",
  "Any lease expiries coming up?",
];

export function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Morning! I'm your market assistant — I answer from live platform data so you don't have to dig. Ask me about rents, vacancy, store movements, news or your pipeline.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: answer(q) }]);
      setTyping(false);
    }, 650);
  };

  return (
    <Card className="rounded-2xl shadow-sm border-border/70 max-w-3xl mx-auto flex flex-col h-[calc(100dvh-330px)] lg:h-[calc(100dvh-280px)] min-h-[380px]">
      <CardContent className="flex flex-col flex-1 min-h-0 pt-5">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center mr-2.5 shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-foreground text-background rounded-br-md"
                    : "bg-muted/70 rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3 text-[13px] text-muted-foreground">
                thinking…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3">
          {suggestions.map((sg) => (
            <button
              key={sg}
              onClick={() => send(sg)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {sg}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about rents, vacancy, store moves, news…"
            className="rounded-xl h-11 text-[13.5px]"
          />
          <Button onClick={() => send()} size="icon" className="rounded-xl h-11 w-11 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
