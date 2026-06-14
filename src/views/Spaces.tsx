import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, DoorOpen, CalendarClock, AlertTriangle, Search } from "lucide-react";
import { mallSpaces, type MallUnit } from "@/data/marketData";
import { cn } from "@/lib/utils";

const statusFilters = ["All", "Vacant now", "Expiring", "Exit confirmed"] as const;
const tierFilters = ["All tiers", "Prime", "City Fringe", "Suburban"] as const;

const statusMeta: Record<MallUnit["status"], { label: string; cls: string; dot: string }> = {
  vacant: { label: "Vacant now", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  expiring: { label: "Expiring", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  notice: { label: "Exit confirmed", cls: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
};

const tierBadge: Record<string, string> = {
  Prime: "bg-rose-100 text-rose-700 hover:bg-rose-100",
  "City Fringe": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Suburban: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
};

function availLabel(u: MallUnit) {
  if (u.status === "vacant") return "Ready now";
  return new Date(u.availableFrom).toLocaleDateString("en-SG", { month: "short", year: "numeric" });
}

function matchesStatus(u: MallUnit, f: (typeof statusFilters)[number]) {
  if (f === "All") return true;
  if (f === "Vacant now") return u.status === "vacant";
  if (f === "Expiring") return u.status === "expiring";
  return u.status === "notice";
}

export function Spaces() {
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("All");
  const [tier, setTier] = useState<(typeof tierFilters)[number]>("All tiers");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set(mallSpaces.map((m) => m.mall)));

  const malls = useMemo(() => {
    return mallSpaces
      .map((m) => ({ ...m, units: m.units.filter((u) => matchesStatus(u, status)) }))
      .filter(
        (m) =>
          m.units.length > 0 &&
          (tier === "All tiers" || m.tier === tier) &&
          m.mall.toLowerCase().includes(query.trim().toLowerCase())
      )
      .sort((a, b) => b.units.length - a.units.length);
  }, [status, tier, query]);

  const allUnits = malls.flatMap((m) => m.units);
  const vacantNow = allUnits.filter((u) => u.status === "vacant").length;
  const upcoming = allUnits.filter((u) => u.status !== "vacant").length;
  const totalSqft = allUnits.reduce((s, u) => s + u.sqft, 0);
  const avgPsf = allUnits.length ? allUnits.reduce((s, u) => s + u.askPsf, 0) / allUnits.length : 0;

  const toggle = (mall: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(mall)) next.delete(mall);
      else next.add(mall);
      return next;
    });

  const stats = [
    { icon: DoorOpen, iconCls: "bg-emerald-100 text-emerald-600", value: String(vacantNow), label: "units vacant now" },
    { icon: CalendarClock, iconCls: "bg-amber-100 text-amber-600", value: String(upcoming), label: "freeing up ≤ 9 months" },
    { icon: AlertTriangle, iconCls: "bg-zinc-900/10 text-zinc-900", value: `${(totalSqft / 1000).toFixed(1)}k`, label: "sqft on the market" },
    { icon: Search, iconCls: "bg-sky-100 text-sky-600", value: `S$${avgPsf.toFixed(1)}`, label: "avg asking psf/mo" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
          >
            <Card className="rounded-xl card-lift h-full">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", s.iconCls)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[22px] font-bold tabular-nums leading-none">{s.value}</div>
                  <div className="text-[11.5px] font-semibold text-muted-foreground mt-1 leading-tight">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {statusFilters.map((f) => (
            <button key={f} onClick={() => setStatus(f)} className="relative rounded-[2px] px-3 py-1.5 text-[11.5px] font-bold bg-muted">
              {status === f && (
                <motion.span
                  layoutId="spaces-status-pill"
                  className="absolute inset-0 rounded-[2px] bg-foreground"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <span className={cn("relative transition-colors", status === f ? "text-background" : "text-muted-foreground hover:text-foreground")}>
                {f}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {tierFilters.map((f) => (
            <button key={f} onClick={() => setTier(f)} className="relative rounded-[2px] px-3 py-1.5 text-[11.5px] font-semibold bg-muted/60">
              {tier === f && (
                <motion.span
                  layoutId="spaces-tier-pill"
                  className="absolute inset-0 rounded-[2px] bg-accent"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <span className={cn("relative transition-colors", tier === f ? "text-accent-foreground font-bold" : "text-muted-foreground hover:text-foreground")}>
                {f}
              </span>
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search malls…"
          className="rounded-xl h-9 text-[12.5px] w-full sm:w-52 sm:ml-auto"
        />
      </div>

      <div className="space-y-3">
        {malls.map((m) => {
          const isOpen = open.has(m.mall);
          const now = m.units.filter((u) => u.status === "vacant").length;
          const soon = m.units.length - now;
          return (
            <Card key={m.mall} className="rounded-xl overflow-hidden">
              <button onClick={() => toggle(m.mall)} className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 text-left hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold text-[14.5px]">{m.mall}</span>
                    <Badge className={cn("rounded-[2px] text-[10px] font-bold", tierBadge[m.tier])} variant="secondary">{m.tier}</Badge>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground font-medium mt-0.5">{m.cluster}</div>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] font-bold shrink-0">
                  {now > 0 && <span className="rounded-[2px] bg-emerald-100 text-emerald-700 px-2.5 py-1">{now} now</span>}
                  {soon > 0 && <span className="rounded-[2px] bg-amber-100 text-amber-700 px-2.5 py-1">{soon} soon</span>}
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
              </button>
              {isOpen && (
                <CardContent className="pt-0 pb-3 px-3 sm:px-4 space-y-2">
                  {m.units.map((u) => {
                    const sm = statusMeta[u.status];
                    return (
                      <div key={u.unit} className="rounded-xl border border-border/60 p-3 sm:p-3.5 hover:bg-muted/30 transition-colors">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", sm.dot)} />
                          <span className="font-bold text-[13.5px] tabular-nums">{u.unit}</span>
                          <span className="text-[11.5px] text-muted-foreground font-semibold">{u.level} · {u.sqft.toLocaleString()} sqft</span>
                          <span className={cn("rounded-[2px] px-2 py-0.5 text-[10px] font-bold", sm.cls)}>{sm.label}</span>
                          <span className="ml-auto text-[13px] font-extrabold tabular-nums">
                            S${u.askPsf.toFixed(1)}<span className="text-[10px] text-muted-foreground font-semibold"> psf/mo</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11.5px] font-medium text-muted-foreground">
                          <span>
                            <span className="font-bold text-foreground">{availLabel(u)}</span>
                            {u.currentTenant ? ` · ${u.currentTenant}` : " · move-in ready"}
                          </span>
                          <span className="flex flex-wrap gap-1 ml-auto">
                            {u.suitedFor.map((s) => (
                              <span key={s} className="rounded-[2px] bg-secondary px-2 py-0.5 text-[10.5px] font-semibold text-secondary-foreground">{s}</span>
                            ))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
        {malls.length === 0 && (
          <p className="text-[13px] text-muted-foreground py-8 text-center">No units match these filters.</p>
        )}
      </div>
    </div>
  );
}
