import { useEffect, useState } from "react";
import { motion, animate, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, ReferenceDot,
} from "recharts";
import { kpis, rentalTrend, vacancyTrend, supplyPipeline, clusters, type RetailCluster } from "@/data/marketData";
import { ClusterMap } from "@/components/ClusterMap";
import { heatColor } from "@/lib/heat";
import { cn } from "@/lib/utils";

// ── series pulled from real history ──────────────────────────────────────────
const orchardSeries = rentalTrend.map((d) => d.orchard);
const suburbanSeries = rentalTrend.map((d) => d.suburban);
const vacancySeries = vacancyTrend.map((d) => d.vacancy);

type Metric = "rents" | "vacancy";
type Emphasis = "orchard" | "suburban" | "islandPrime" | null;

// ── tiny inline sparkline ────────────────────────────────────────────────────
function Sparkline({ data, color = "#E30613", w = 104, h = 30 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / span) * (h - 6)] as const);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = pts[pts.length - 1];
  const id = `sg-${color.replace("#", "")}-${data.length}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.16} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.4} fill={color} />
    </svg>
  );
}

// ── interactive KPI cell ─────────────────────────────────────────────────────
function useCountUp(target: number) {
  const reduce = useReducedMotion();
  const decimals = (String(target).split(".")[1] ?? "").length;
  const [val, setVal] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVal(target);
      return;
    }
    const controls = animate(0, target, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: setVal });
    return () => controls.stop();
  }, [target, reduce]);
  return val.toFixed(decimals);
}

type Kpi = (typeof kpis)[keyof typeof kpis];

function KpiCell({
  k, index, series, active, clickable, onClick,
}: {
  k: Kpi; index: number; series?: number[]; active: boolean; clickable: boolean; onClick?: () => void;
}) {
  const up = k.change > 0;
  const Icon = k.change === 0 ? Minus : up ? TrendingUp : TrendingDown;
  const good = k.direction === "neutral" || k.change === 0 ? null : k.direction === "up-good" ? up : !up;
  const display = useCountUp(k.value);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "relative bg-card px-4 py-4 sm:px-5 text-left transition-colors duration-150 outline-none",
        clickable && "hover:bg-muted/50 cursor-pointer",
        active && "bg-muted/60"
      )}
    >
      {active && <span className="absolute left-0 top-0 h-full w-[3px] bg-primary" />}
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground leading-tight">{k.label}</div>
        {series && <Sparkline data={series} color={good === false ? "#E30613" : good === true ? "#0f8a4d" : "#8B9097"} w={56} h={20} />}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[28px] font-bold tabular-nums leading-none tracking-tight">{display}</span>
        <span className="text-[11px] text-muted-foreground font-semibold">{k.unit}</span>
      </div>
      <div className={cn("mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold",
        good === null ? "text-muted-foreground" : good ? "text-emerald-700" : "text-[#E30613]")}>
        <Icon className="h-3.5 w-3.5" />
        {k.change === 0 ? "flat q-o-q" : `${up ? "+" : ""}${k.change}${k.changeLabel}`}
      </div>
      {clickable && (
        <span className={cn("absolute right-3 bottom-3 text-[9px] font-bold uppercase tracking-[0.1em] transition-opacity",
          active ? "text-primary opacity-100" : "text-muted-foreground opacity-0 sm:group-hover:opacity-100")}>
          {active ? "shown" : "view"}
        </span>
      )}
    </motion.button>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <CardHeader className="pb-2">
      <CardTitle className="font-display text-[13px] font-bold uppercase tracking-[0.08em]">{children}</CardTitle>
      {sub && <p className="text-[12px] text-muted-foreground">{sub}</p>}
    </CardHeader>
  );
}

// ── focus chart ──────────────────────────────────────────────────────────────
function FocusChart({ metric, emphasis, range }: { metric: Metric; emphasis: Emphasis; range: number }) {
  const rentData = rentalTrend.slice(-range);
  const vacData = vacancyTrend.slice(-range);
  const lineFor = (key: Emphasis, base: string) => ({
    stroke: base,
    width: emphasis === key ? 3 : emphasis ? 1.5 : 2.4,
    opacity: emphasis && emphasis !== key ? 0.3 : 1,
  });
  const o = lineFor("orchard", "#E30613");
  const s = lineFor("suburban", "#16181d");
  const ip = lineFor("islandPrime", "#8B9097");
  const lastRent = rentData[rentData.length - 1];
  const lastVac = vacData[vacData.length - 1];
  const emphVal = emphasis === "suburban" ? lastRent.suburban : emphasis === "islandPrime" ? lastRent.islandPrime : lastRent.orchard;
  const emphColor = emphasis === "suburban" ? "#16181d" : emphasis === "islandPrime" ? "#8B9097" : "#E30613";

  return (
    <ResponsiveContainer width="100%" height="100%">
      {metric === "rents" ? (
        <LineChart data={rentData} margin={{ top: 12, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" />
          <XAxis dataKey="quarter" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[12, 32]} />
          <Tooltip contentStyle={{ borderRadius: 3, border: "1px solid #E6E8EC", fontSize: 12 }} />
          <Line type="monotone" dataKey="islandPrime" name="Island prime" stroke={ip.stroke} strokeOpacity={ip.opacity} strokeWidth={ip.width} dot={false} animationDuration={600} />
          <Line type="monotone" dataKey="suburban" name="Suburban" stroke={s.stroke} strokeOpacity={s.opacity} strokeWidth={s.width} dot={false} animationDuration={600} />
          <Line type="monotone" dataKey="orchard" name="Orchard" stroke={o.stroke} strokeOpacity={o.opacity} strokeWidth={o.width} dot={false} animationDuration={600} />
          <ReferenceDot x={lastRent.quarter} y={emphVal} r={4} fill={emphColor} stroke="#fff" strokeWidth={1.5} />
        </LineChart>
      ) : (
        <AreaChart data={vacData} margin={{ top: 12, right: 16, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="vacFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E30613" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#E30613" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" />
          <XAxis dataKey="quarter" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[5.8, 7.8]} />
          <Tooltip contentStyle={{ borderRadius: 3, border: "1px solid #E6E8EC", fontSize: 12 }} />
          <Area type="monotone" dataKey="vacancy" name="Vacancy %" stroke="#E30613" strokeWidth={2.6} fill="url(#vacFill)" animationDuration={600} />
          <ReferenceDot x={lastVac.quarter} y={lastVac.vacancy} r={4} fill="#E30613" stroke="#fff" strokeWidth={1.5} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}

// ── market read sentence (derived from data) ────────────────────────────────
function marketRead() {
  const iv = kpis.islandVacancy, rs = kpis.retailSalesGrowth, ta = kpis.touristArrivals;
  const orchard = clusters.find((c) => c.id === "orchard")!;
  const tight = [...clusters].filter((c) => c.tier === "Suburban").sort((a, b) => a.vacancy - b.vacancy)[0];
  return `Island-wide vacancy at ${iv.value}% (${iv.change > 0 ? "+" : ""}${iv.change}pp q-o-q). ${orchard.name} prime holds S$${orchard.rentPsf} psf at ${orchard.vacancy}% vacancy, while ${tight.name.split(" / ")[0]} stays tightest at ${tight.vacancy}%. Retail sales +${rs.value}% y-o-y; ${ta.value}M visitors in April.`;
}

export function Dashboard() {
  const [metric, setMetric] = useState<Metric>("rents");
  const [emphasis, setEmphasis] = useState<Emphasis>(null);
  const [range, setRange] = useState(9);
  const [selected, setSelected] = useState<RetailCluster>(clusters.find((c) => c.id === "orchard")!);
  const [sortKey, setSortKey] = useState<"rentPsf" | "rentChangeYoY" | "vacancy">("rentPsf");

  const kpiCfg: Record<string, { series?: number[]; focus?: { metric: Metric; emphasis: Emphasis } }> = {
    islandVacancy: { series: vacancySeries, focus: { metric: "vacancy", emphasis: null } },
    primeOrchardRent: { series: orchardSeries, focus: { metric: "rents", emphasis: "orchard" } },
    suburbanRent: { series: suburbanSeries, focus: { metric: "rents", emphasis: "suburban" } },
  };

  const isActive = (cfg?: { metric: Metric; emphasis: Emphasis }) =>
    !!cfg && cfg.metric === metric && cfg.emphasis === emphasis;

  const movers = [...clusters].sort((a, b) =>
    sortKey === "rentChangeYoY" ? b.rentChangeYoY - a.rentChangeYoY : (b[sortKey] as number) - (a[sortKey] as number)
  );
  const moverMax = Math.max(...clusters.map((c) => (c[sortKey] as number)));

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* AI market read */}
      <div className="flex items-start gap-3 border-l-2 border-primary bg-muted/40 px-4 py-3 rounded-r-[3px]">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-0.5">AI market read · today</div>
          <p className="text-[13px] sm:text-[13.5px] leading-relaxed font-medium">{marketRead()}</p>
        </div>
      </div>

      {/* Interactive KPI rail */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.08em]">Key indicators</h2>
          <span className="text-[10.5px] text-muted-foreground hidden sm:inline">Click a metric with a trend to chart it below</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-border border rounded-[3px] overflow-hidden">
          {Object.entries(kpis).map(([key, k], i) => {
            const cfg = kpiCfg[key];
            return (
              <KpiCell
                key={k.label} k={k} index={i} series={cfg?.series}
                clickable={!!cfg?.focus} active={isActive(cfg?.focus)}
                onClick={cfg?.focus ? () => { setMetric(cfg.focus!.metric); setEmphasis(cfg.focus!.emphasis); } : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Hero: interactive heatmap + selected cluster */}
      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="rounded-[3px] lg:col-span-3 overflow-hidden">
          <SectionTitle sub="Bubble = prime rent · colour = leasing heat · click a cluster">Singapore Retail Map</SectionTitle>
          <CardContent className="p-0">
            <div className="relative z-0 isolate h-[300px] sm:h-[360px] border-t">
              <ClusterMap selectedId={selected.id} onSelect={setSelected} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[3px] lg:col-span-2">
          <CardContent className="pt-5">
            <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Selected cluster</div>
                  <h3 className="font-display text-[22px] font-bold leading-tight tracking-tight mt-0.5">{selected.name}</h3>
                </div>
                <span className="h-3 w-3 rounded-full mt-1.5 shrink-0" style={{ background: heatColor(selected.intensity) }} />
              </div>
              <div className="grid grid-cols-3 gap-px bg-border border rounded-[3px] overflow-hidden mt-4">
                {[
                  { v: `$${selected.rentPsf}`, l: "psf/mo" },
                  { v: `+${selected.rentChangeYoY}%`, l: "rent y-o-y", good: true },
                  { v: `${selected.vacancy}%`, l: "vacancy" },
                ].map((s) => (
                  <div key={s.l} className="bg-card px-2 py-3 text-center">
                    <div className={cn("font-display text-[19px] font-bold tabular-nums", s.good && "text-emerald-700")}>{s.v}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground mt-4">{selected.note}</p>
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground mb-1.5">Key malls</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.keyMalls.map((m) => (
                    <span key={m} className="rounded-[2px] bg-muted px-2 py-1 text-[11px] font-semibold">{m}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>

      {/* Submarket leaderboard — animated, sortable */}
      <Card className="rounded-[3px]">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-display text-[13px] font-bold uppercase tracking-[0.08em]">Submarket Leaderboard</CardTitle>
            <div className="flex gap-1.5">
              {([["rentPsf", "Rent"], ["rentChangeYoY", "Growth"], ["vacancy", "Vacancy"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setSortKey(key)}
                  className={cn("rounded-[2px] px-2.5 py-1 text-[11px] font-bold transition-colors duration-150",
                    sortKey === key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground")}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {movers.map((c) => {
            const val = c[sortKey] as number;
            const pct = Math.max(6, (val / moverMax) * 100);
            const unit = sortKey === "rentPsf" ? `S$${c.rentPsf}` : sortKey === "rentChangeYoY" ? `+${c.rentChangeYoY}%` : `${c.vacancy}%`;
            return (
              <motion.button
                key={c.id} layout transition={{ type: "spring", stiffness: 380, damping: 34 }}
                onClick={() => setSelected(c)}
                className={cn("w-full flex items-center gap-3 rounded-[2px] px-2 py-1.5 text-left transition-colors duration-150",
                  selected.id === c.id ? "bg-muted" : "hover:bg-muted/50")}
              >
                <span className="w-28 sm:w-36 shrink-0 text-[12.5px] font-semibold truncate">{c.name.split(" / ")[0]}</span>
                <span className="flex-1 h-2.5 bg-muted rounded-[1px] overflow-hidden">
                  <motion.span className="block h-full rounded-[1px]" style={{ background: heatColor(c.intensity) }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
                </span>
                <span className="w-14 text-right text-[12px] font-bold tabular-nums shrink-0">{unit}</span>
              </motion.button>
            );
          })}
        </CardContent>
      </Card>

      {/* Focus chart with controls */}
      <Card className="rounded-[3px]">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-display text-[13px] font-bold uppercase tracking-[0.08em]">
              {metric === "rents" ? "Prime Floor Rents" : "Island-wide Vacancy"}
              <span className="ml-2 font-sans text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
                {metric === "rents" ? "S$ psf/month" : "% of retail NLA"}
              </span>
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {(["rents", "vacancy"] as const).map((mt) => (
                  <button key={mt} onClick={() => { setMetric(mt); if (mt === "vacancy") setEmphasis(null); }}
                    className={cn("rounded-[2px] px-2.5 py-1 text-[11px] font-bold transition-colors duration-150",
                      metric === mt ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground")}>
                    {mt === "rents" ? "Rents" : "Vacancy"}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {([[4, "4Q"], [8, "8Q"], [9, "All"]] as const).map(([r, label]) => (
                  <button key={r} onClick={() => setRange(r)}
                    className={cn("rounded-[2px] px-2 py-1 text-[11px] font-bold transition-colors duration-150",
                      range === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {metric === "rents" && (
            <div className="flex flex-wrap gap-3 pt-1">
              {([["orchard", "Orchard", "#E30613"], ["suburban", "Suburban", "#16181d"], ["islandPrime", "Island prime", "#8B9097"]] as const).map(([key, label, color]) => (
                <button key={key} onClick={() => setEmphasis(emphasis === key ? null : key)}
                  className={cn("flex items-center gap-1.5 text-[11.5px] font-semibold transition-opacity",
                    emphasis && emphasis !== key ? "opacity-45" : "opacity-100")}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="h-[260px] sm:h-[300px]">
          <FocusChart key={`${metric}-${range}`} metric={metric} emphasis={emphasis} range={range} />
        </CardContent>
      </Card>

      {/* Supply pipeline */}
      <Card className="rounded-[3px]">
        <SectionTitle sub="2026–29 supply averages ~300k sqft/yr — under half the decade norm; next big wave 2028">New Supply Pipeline</SectionTitle>
        <CardContent className="pt-1">
          <div className="divide-y">
            {supplyPipeline.map((p) => (
              <div key={p.project} className="flex items-baseline justify-between gap-4 py-3 group">
                <div className="min-w-0">
                  <span className="text-[13.5px] font-bold group-hover:text-[#E30613] transition-colors duration-150">{p.project}</span>
                  <span className="ml-2 text-[11.5px] text-muted-foreground font-medium">{p.zone}</span>
                </div>
                <div className="flex items-baseline gap-4 shrink-0 tabular-nums">
                  <span className="text-[13px] font-bold">
                    {p.nla !== null ? `${p.nla}k sqft` : <span className="text-muted-foreground font-semibold">NLA TBC</span>}
                  </span>
                  <span className="text-[11.5px] font-bold text-muted-foreground w-10 text-right">{p.opening}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
