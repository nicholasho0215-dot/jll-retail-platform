import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { clusters, kpis, storeMoves, news, deals, expiries } from "@/data/marketData";

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

  if (/(vacancy|occupied|occupancy)/.test(s)) {
    const c = findCluster();
    if (c) return `${c.name} is running at ${c.vacancy}% vacancy (${c.tier} tier). ${c.note}`;
    return `Island-wide retail vacancy is ${kpis.islandVacancy.value}%, down ${Math.abs(kpis.islandVacancy.change)}pp y-o-y — the eighth straight quarter of tightening. Tightest submarkets: Tampines (4.3%), Serangoon (4.6%) and Jurong East (4.8%). Loosest: Chinatown/Tanjong Pagar at 8.2%.`;
  }

  if (/(rent|psf|price|cost)/.test(s)) {
    const c = findCluster();
    if (c) return `Prime floor rents in ${c.name} average S$${c.rentPsf} psf/month, up ${c.rentChangeYoY}% y-o-y. Key malls: ${c.keyMalls.join(", ")}. Hot categories there right now: ${c.hotCategories.join(", ")}.`;
    return `Current prime floor rents — Orchard: S$${kpis.primeOrchardRent.value} psf/mo (+3.2% y-o-y), suburban average: S$${kpis.suburbanRent.value} psf/mo (+2.5%). Rents have grown four straight quarters with limited 2026 supply (${kpis.newSupply.value}M sqft) supporting further growth.`;
  }

  if (/(open|closed|closing|closure|new store|movement)/.test(s)) {
    const opens = storeMoves.filter((m) => m.type === "open");
    const closes = storeMoves.filter((m) => m.type === "close");
    const ntm = storeMoves.filter((m) => m.signal === "new-to-market").map((m) => m.brand);
    return `Last 30 days: ${opens.length} openings vs ${closes.length} closures — net positive. Notable new-to-market entries: ${ntm.join(", ")}. Biggest closure to watch: Esprit's final SG exit frees a 3,200 sqft prime unit at Suntec City. Want the full list? Check the Open/Close tab.`;
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
    return `2026-27 supply is limited at ${kpis.newSupply.value}M sqft NLA. Largest additions: Jurong Lake District retail (280k sqft, Q1 2027) and Pasir Ris Mall (195k sqft, Q2 2026). Constrained supply is the key driver behind landlord pricing power right now.`;
  }

  if (/(f&b|food|restaurant|cafe|coffee)/.test(s)) {
    const fb = storeMoves.filter((m) => m.category === "F&B" && m.type === "open");
    return `F&B remains the most active leasing category. Recent openings: ${fb.map((m) => `${m.brand} (${m.location})`).join(", ")}. Trends: Korean concepts hunting 800-1,500 sqft CBD units, specialty coffee intensifying after Blue Bottle's entry, and Luckin Coffee on the fastest rollout in SG history (42 stores in 30 months).`;
  }

  if (/(tourist|visitor|arrival)/.test(s)) {
    return `Monthly visitor arrivals are at ${kpis.touristArrivals.value}M, up ${kpis.touristArrivals.change}% y-o-y — a direct tailwind for Orchard and Marina Bay luxury retail. The new 3-minute GST refund process should further lift luxury conversion rates.`;
  }

  if (/(compare|vs|versus|better)/.test(s)) {
    return `Quick comparison — Prime (Orchard S$36.40, vacancy 6.1%) vs Suburban (avg S$18.70, vacancy ~4.8%). Suburban malls offer tighter occupancy and stickier catchment demand; prime offers brand flagship value and tourist spend. For expanding F&B clients I'd target Tampines or Serangoon first — tightest markets with proven footfall.`;
  }

  return `I can help with anything on this platform's data. Try asking:\n\n• "What's the vacancy rate in Orchard?"\n• "Compare prime vs suburban rents"\n• "What shops opened or closed recently?"\n• "Summarise this week's top news"\n• "What's in our deal pipeline?"\n• "Any major lease expiries coming up?"`;
}

const suggestions = [
  "What's the vacancy in Orchard?",
  "What shops opened recently?",
  "Summarise this week's news",
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
    <Card className="rounded-2xl shadow-sm border-border/70 max-w-3xl mx-auto flex flex-col h-[calc(100vh-180px)]">
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
