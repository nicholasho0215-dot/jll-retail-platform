import { useEffect, useState } from "react";
import { motion, animate, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      setVal(target);
      return;
    }
    const controls = animate(0, target, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: setVal });
    return () => controls.stop();
  }, [target, reduce]);
  return val.toFixed(decimals);
}

function KpiCard({ k, index }: { k: { value: number; change: number; label: string; unit: string; direction: string; changeLabel: string }; index: number }) {
  const up = k.change > 0;
  const Icon = k.change === 0 ? Minus : up ? TrendingUp : TrendingDown;
  const good = k.direction === "neutral" || k.change === 0 ? null : k.direction === "up-good" ? up : !up;
  const display = useCountUp(k.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
    <Card className="rounded-2xl shadow-sm border-border/70 card-lift h-full">
      <CardContent className="pt-5 pb-4">
        <div className="text-[12px] font-semibold text-muted-foreground">{k.label}</div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[26px] font-extrabold tabular-nums tracking-tight">{display}</span>
          <span className="text-[12px] text-muted-foreground font-medium">{k.unit}</span>
        </div>
        <div className={`mt-1 inline-flex items-center gap-1 text-[12px] font-bold ${
          good === null ? "text-muted-foreground" : good ? "text-emerald-600" : "text-rose-600"
        }`}>
          <Icon className="h-3.5 w-3.5" />
          {k.change === 0 ? "flat q-o-q" : `${up ? "+" : ""}${k.change}${k.changeLabel}`}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {Object.values(kpis).map((k, i) => <KpiCard key={k.label} k={k} index={i} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="rounded-2xl shadow-sm border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-bold">Prime Floor Rents by Submarket</CardTitle>
            <p className="text-[12px] text-muted-foreground">S$ psf/month · Savills & Knight Frank prime baskets</p>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rentalTrend} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee5d8" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fontFamily: "inherit" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[12, 32]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee5d8", fontSize: 12 }} />
                <Line type="monotone" dataKey="islandPrime" name="Island-wide prime" stroke="#e8862d" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="orchard" name="Orchard" stroke="#d6202f" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="suburban" name="Suburban" stroke="#2f9e6e" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-bold">Island-wide Vacancy Rate</CardTitle>
            <p className="text-[12px] text-muted-foreground">% of retail NLA · ticked up to 6.8% in Q1 26 after 2 years of tightening</p>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vacancyTrend} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="vac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d6202f" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#d6202f" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee5d8" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[5.8, 7.8]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eee5d8", fontSize: 12 }} />
                <Area type="monotone" dataKey="vacancy" name="Vacancy %" stroke="#d6202f" strokeWidth={2.5} fill="url(#vac)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-bold">New Supply Pipeline</CardTitle>
          <p className="text-[12px] text-muted-foreground">2026–29 supply averages ~300k sqft/yr — under half the decade norm; next big wave 2028</p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {supplyPipeline.map((p) => (
              <div key={p.project} className="rounded-xl border border-border/70 bg-muted/40 p-3.5 card-lift">
                <div className="text-[13px] font-bold leading-snug">{p.project}</div>
                <div className="text-[11.5px] text-muted-foreground mt-0.5">{p.zone}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[15px] font-extrabold tabular-nums">
                    {p.nla !== null ? <>{p.nla}k <span className="text-[11px] font-semibold text-muted-foreground">sqft</span></> : <span className="text-[12px] font-bold text-muted-foreground">NLA TBC</span>}
                  </span>
                  <Badge variant="secondary" className="rounded-full text-[10.5px] font-bold">{p.opening}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
