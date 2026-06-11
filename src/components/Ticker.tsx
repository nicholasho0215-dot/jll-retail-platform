import { kpis, storeMoves, clusters, mallSpaces } from "@/data/marketData";
import { cn } from "@/lib/utils";

type Item = { text: string; tone: "up" | "down" | "flat" };

function buildItems(): Item[] {
  const items: Item[] = [
    { text: `Orchard prime S$${kpis.primeOrchardRent.value} psf ${kpis.primeOrchardRent.change > 0 ? "+" : ""}${kpis.primeOrchardRent.change}%`, tone: "up" },
    { text: `Island vacancy ${kpis.islandVacancy.value}% (${kpis.islandVacancy.change}pp y-o-y)`, tone: "up" },
    { text: `Suburban avg S$${kpis.suburbanRent.value} psf +${kpis.suburbanRent.change}%`, tone: "up" },
    { text: `Visitors ${kpis.touristArrivals.value}M/mo +${kpis.touristArrivals.change}%`, tone: "up" },
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
  up: { glyph: "▲", cls: "text-emerald-400" },
  down: { glyph: "▼", cls: "text-rose-400" },
  flat: { glyph: "◆", cls: "text-amber-400/90" },
};

export function Ticker() {
  const items = buildItems();
  return (
    <div className="flex items-center h-9 shrink-0 bg-[#14161d] text-white/85 overflow-hidden border-b border-black/30">
      <span className="flex items-center gap-1.5 pl-3 sm:pl-4 pr-3 text-[10px] font-extrabold tracking-[0.2em] text-white shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b4e] animate-pulse" />
        LIVE
      </span>
      <div className="flex-1 overflow-hidden h-full">
        <div className="marquee flex items-center h-full w-max">
          {[...items, ...items].map((it, i) => {
            const a = toneArrow[it.tone];
            return (
              <span key={i} className="flex items-center text-[11.5px] font-semibold whitespace-nowrap pr-9">
                <span className={cn("mr-1.5 text-[9px]", a.cls)}>{a.glyph}</span>
                {it.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
