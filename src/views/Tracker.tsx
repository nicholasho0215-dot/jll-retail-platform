import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Sparkle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { storeMoves, weeklyVelocity } from "@/data/marketData";
import { cn } from "@/lib/utils";

const categories = ["All", "F&B", "Fashion", "Beauty", "Lifestyle", "Luxury", "Entertainment"] as const;
const typeFilters = ["All", "Openings", "Closures"] as const;

const signalStyles: Record<string, string> = {
  "expansion": "bg-emerald-100 text-emerald-700",
  "new-to-market": "bg-zinc-900 text-white",
  "consolidation": "bg-amber-100 text-amber-700",
  "exit": "bg-rose-100 text-rose-700",
  "relocation": "bg-sky-100 text-sky-700",
};

export function Tracker() {
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [type, setType] = useState<(typeof typeFilters)[number]>("All");

  const filtered = useMemo(
    () =>
      storeMoves.filter(
        (m) =>
          (cat === "All" || m.category === cat) &&
          (type === "All" || (type === "Openings" ? m.type === "open" : m.type === "close"))
      ),
    [cat, type]
  );

  const opens = storeMoves.filter((m) => m.type === "open").length;
  const closes = storeMoves.filter((m) => m.type === "close").length;
  const newToMarket = storeMoves.filter((m) => m.signal === "new-to-market").length;

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="rounded-xl card-lift">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-display text-[26px] font-bold tabular-nums leading-none">{opens}</div>
              <div className="text-[12px] font-semibold text-muted-foreground mt-1">openings · last 30 days</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl card-lift">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-rose-100 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="font-display text-[26px] font-bold tabular-nums leading-none">{closes}</div>
              <div className="text-[12px] font-semibold text-muted-foreground mt-1">closures · last 30 days</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl card-lift">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-zinc-900/10 flex items-center justify-center">
              <Sparkle className="h-5 w-5 text-zinc-900" />
            </div>
            <div>
              <div className="font-display text-[26px] font-bold tabular-nums leading-none">{newToMarket}</div>
              <div className="text-[12px] font-semibold text-muted-foreground mt-1">new-to-market brands</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="font-display text-[13px] font-bold uppercase tracking-[0.08em]">Store Movements</CardTitle>
              <div className="flex gap-1.5">
                {typeFilters.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="relative rounded-[2px] px-3 py-1 text-[11.5px] font-bold bg-muted"
                  >
                    {type === t && (
                      <motion.span
                        layoutId="tracker-type-pill"
                        className="absolute inset-0 rounded-[2px] bg-foreground"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                    <span className={cn("relative transition-colors", type === t ? "text-background" : "text-muted-foreground hover:text-foreground")}>
                      {t}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className="relative rounded-[2px] px-3 py-1 text-[11.5px] font-semibold bg-muted/60"
                >
                  {cat === c && (
                    <motion.span
                      layoutId="tracker-cat-pill"
                      className="absolute inset-0 rounded-[2px] bg-accent"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className={cn("relative transition-colors", cat === c ? "text-accent-foreground font-bold" : "text-muted-foreground hover:text-foreground")}>
                    {c}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {filtered.map((m) => (
              <div key={m.id} className="flex gap-3 rounded-xl border border-border/60 p-3.5 hover:bg-muted/30 transition-colors">
                <div
                  className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    m.type === "open" ? "bg-emerald-100" : "bg-rose-100"
                  )}
                >
                  {m.type === "open"
                    ? <ArrowUpRight className="h-4.5 w-4.5 text-emerald-600" />
                    : <ArrowDownRight className="h-4.5 w-4.5 text-rose-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold text-[13.5px]">{m.brand}</span>
                    <Badge variant="secondary" className="rounded-[2px] text-[10px] font-bold">{m.category}</Badge>
                    <span className={cn("rounded-[2px] px-2 py-0.5 text-[10px] font-bold", signalStyles[m.signal])}>
                      {m.signal.replace("-", " ")}
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground font-medium tabular-nums">
                      {new Date(m.date).toLocaleDateString("en-SG", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="text-[12px] text-muted-foreground font-medium mt-0.5">
                    {m.location}{m.sqft ? ` · ${m.sqft.toLocaleString()} sqft` : ""}
                  </div>
                  <p className="text-[12.5px] leading-relaxed mt-1">{m.detail}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-6 text-center">No movements match these filters.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-[13px] font-bold uppercase tracking-[0.08em]">Weekly Velocity</CardTitle>
            <p className="text-[12px] text-muted-foreground">Openings vs closures — net positive 6 weeks running</p>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVelocity} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF1" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #ECEEF1", fontSize: 12 }} cursor={{ fill: "#F4F5F7" }} />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Bar dataKey="opens" name="Opens" fill="#2f9e6e" radius={[5, 5, 0, 0]} />
                <Bar dataKey="closes" name="Closes" fill="#E30613" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
