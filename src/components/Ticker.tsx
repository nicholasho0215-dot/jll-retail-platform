import { kpis, storeMoves, clusters, mallSpaces } from "@/data/marketData";
import { cn } from "@/lib/utils";

type Item = { text: string; tone: "up" | "down" | "flat" };

function buildItems(): Item[] {
  const items: Item[] = [
    { text: `Orchard prime S$${kpis.primeOrchardRent.value} psf · flat q-o-q`, tone: "flat" },
    { text: `Island vacancy ${kpis.islandVacancy.value}% (+${kpis.islandVacancy.change}pp q-o-q)`, tone: "down" },
    { text: `Suburban prime S$${kpis.suburbanRent.value} psf · vacancy ~4.1%`, tone: "up" },
    { text: `Retail sales +${kpis.retailSalesGrowth.value}% y-o-y (Apr)`, tone: "up" },
    { text: `Visitors ${kpis.touristArrivals.value}M in Apr (${kpis.touristArrivals.change}% m-o-m)`, tone: "down" },
  ];
  for (const m of storeMoves.slice(0, 8)) {
    items.push({
      text: `${m.brand} ${m.type === "open" ? "opens" : "exits"} ${m.location.split("#")[0].trim()}`,
      tone: m.type === "open" ? "up" : "down",
    });
  }
  for (const c of [...clusters].sort((a, b) => b.rentPsf - a.rentPsf).slice(0, 4)) {
    items.push({ text: `${c.name.split(" / ")[0]} S$${c.rentPsf} psf · ${c.vacancy}% vacant`, tone: "flat" });
  }
  const topAvail = [...mallSpaces]
    .map((m) => ({ mall: m.mall, n: m.units.filter((u) => u.status === "vacant").length }))
    .filter((m) => m.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);
  for (const m of topAvail) {
    items.push({ text: `${m.mall}: ${m.n} unit${m.n > 1 ? "s" : ""} available now`, tone: "flat" });
  }
  return items;
}

const toneArrow: Record<Item["tone"], { glyph: string; cls: string }> = {
  up: { glyph: "▲", cls: "text-emerald-600" },
  down: { glyph: "▼", cls: "text-primary" },
  flat: { glyph: "·", cls: "text-muted-foreground" },
};

export function Ticker() {
  const items = buildItems();
  return (
    <div className="flex items-center h-8 shrink-0 bg-background text-foreground overflow-hidden border-b">
      <span className="flex items-center gap-1.5 pl-4 sm:pl-6 pr-4 h-full text-[10px] font-bold tracking-[0.18em] text-foreground shrink-0 border-r">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        LIVE
      </span>
      <div className="flex-1 overflow-hidden h-full">
        <div className="marquee flex items-center h-full w-max">
          {[...items, ...items].map((it, i) => {
            const a = toneArrow[it.tone];
            return (
              <span key={i} className="flex items-center text-[11.5px] font-medium text-muted-foreground whitespace-nowrap pr-8">
                <span className={cn("mr-1.5 text-[8px]", a.cls)}>{a.glyph}</span>
                {it.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
