import { useEffect, useState } from "react";
import { motion, animate, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";
import { kpis, rentalTrend, vacancyTrend, supplyPipeline } from "@/data/marketData";

function useCountUp(target: number) {
  const reduce = useReducedMotion();
  const decimals = (String(target).split(".")[1] ?? "").length;
  const [val, setVal] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      // Reduced-motion users must see the final figure immediately, not 0.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVal(target);
      return;
    }
    const controls = animate(0, target, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: setVal });
    return () => controls.stop();
  }, [target, reduce]);
  return val.toFixed(decimals);
}

function KpiCell({ k, index }: { k: { value: number; change: number; label: string; unit: string; direction: string; changeLabel: string }; index: number }) {
  const up = k.change > 0;
  const Icon = k.change === 0 ? Minus : up ? TrendingUp : TrendingDown;
  const good = k.direction === "neutral" || k.change === 0 ? null : k.direction === "up-good" ? up : !up;
  const display = useCountUp(k.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className="bg-card px-4 py-5 sm:px-5"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{k.label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[30px] font-bold tabular-nums leading-none tracking-tight">{display}</span>
        <span className="text-[11px] text-muted-foreground font-semibold">{k.unit}</span>
      </div>
      <div className={`mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold ${
        good === null ? "text-muted-foreground" : good ? "text-emerald-700" : "text-[#c41324]"
      }`}>
        <Icon className="h-3.5 w-3.5" />
        {k.change === 0 ? "flat q-o-q" : `${up ? "+" : ""}${k.change}${k.changeLabel}`}
      </div>
    </motion.div>
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

export function Dashboard() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* KPI band — one ruled container, hairline dividers */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-border border rounded-xl overflow-hidden">
        {Object.values(kpis).map((k, i) => <KpiCell key={k.label} k={k} index={i} />)}
      </div>

      {/* Asymmetric chart split */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="rounded-xl lg:col-span-3">
          <SectionTitle sub="S$ psf/month · Savills & Knight Frank prime baskets">Prime Floor Rents by Submarket</SectionTitle>
          <CardContent className="h-[230px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rentalTrend} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e4da" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fontFamily: "inherit" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[12, 32]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e9e4da", fontSize: 12 }} />
                <Line type="monotone" dataKey="islandPrime" name="Island-wide prime" stroke="#8a8378" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="orchard" name="Orchard" stroke="#c41324" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="suburban" name="Suburban" stroke="#16181d" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl lg:col-span-2">
          <SectionTitle sub="% of retail NLA · ticked up to 6.8% in Q1 26">Island-wide Vacancy</SectionTitle>
          <CardContent className="h-[230px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vacancyTrend} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="vac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c41324" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#c41324" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e4da" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[5.8, 7.8]} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e9e4da", fontSize: 12 }} />
                <Area type="monotone" dataKey="vacancy" name="Vacancy %" stroke="#c41324" strokeWidth={2.5} fill="url(#vac)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Supply pipeline — editorial ruled list */}
      <Card className="rounded-xl">
        <SectionTitle sub="2026–29 supply averages ~300k sqft/yr — under half the decade norm; next big wave 2028">New Supply Pipeline</SectionTitle>
        <CardContent className="pt-1">
          <div className="divide-y">
            {supplyPipeline.map((p) => (
              <div key={p.project} className="flex items-baseline justify-between gap-4 py-3 group">
                <div className="min-w-0">
                  <span className="text-[13.5px] font-bold group-hover:text-[#c41324] transition-colors duration-150">{p.project}</span>
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
