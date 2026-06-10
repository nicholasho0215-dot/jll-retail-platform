import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";
import { deals, expiries, type Deal } from "@/data/marketData";
import { cn } from "@/lib/utils";

const stages: Deal["stage"][] = ["Prospecting", "Viewing", "Negotiating", "Legal", "Signed"];

const stageColors: Record<Deal["stage"], string> = {
  Prospecting: "border-t-slate-300",
  Viewing: "border-t-sky-400",
  Negotiating: "border-t-amber-400",
  Legal: "border-t-violet-400",
  Signed: "border-t-emerald-500",
};

const urgencyStyles: Record<string, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export function Pipeline() {
  const totalValue = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-semibold text-muted-foreground">
        <span><span className="text-[18px] font-extrabold text-foreground tabular-nums">{deals.length}</span> active deals</span>
        <span><span className="text-[18px] font-extrabold text-foreground tabular-nums">S${(totalValue / 1000).toFixed(1)}M</span> est. annual rent</span>
        <span><span className="text-[18px] font-extrabold text-foreground tabular-nums">{deals.filter(d => d.stage === "Negotiating" || d.stage === "Legal").length}</span> in closing stages</span>
      </div>

      <div className="flex gap-3 overflow-x-auto snap-x pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 items-start">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <div key={stage} className="w-[240px] shrink-0 snap-start space-y-2.5 lg:w-auto">
              <div className="flex items-center justify-between px-1">
                <span className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">{stage}</span>
                <span className="text-[11px] font-bold text-muted-foreground tabular-nums">{stageDeals.length}</span>
              </div>
              {stageDeals.map((d) => (
                <Card key={d.id} className={cn("rounded-xl shadow-sm border-border/70 border-t-[3px]", stageColors[stage])}>
                  <CardContent className="p-3">
                    <div className="font-bold text-[13px] leading-tight">{d.tenant}</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{d.requirement}</div>
                    <div className="text-[11.5px] font-semibold mt-1.5">{d.target}</div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[12px] font-extrabold tabular-nums">S${d.value}k<span className="text-[10px] text-muted-foreground font-semibold">/yr</span></span>
                      <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-extrabold">{d.broker}</span>
                    </div>
                    <div className="mt-2 rounded-lg bg-muted/60 px-2 py-1.5 text-[10.5px] font-semibold text-muted-foreground leading-snug">
                      → {d.nextAction}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {stageDeals.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">empty</div>
              )}
            </div>
          );
        })}
      </div>

      <Card className="rounded-2xl shadow-sm border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-bold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Lease Expiry Radar
          </CardTitle>
          <p className="text-[12px] text-muted-foreground">Major upcoming expiries — renewal or repositioning opportunities</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-bold">Tenant</th>
                  <th className="pb-2 font-bold">Location</th>
                  <th className="pb-2 font-bold text-right">NLA (sqft)</th>
                  <th className="pb-2 font-bold text-right">Expiry</th>
                  <th className="pb-2 font-bold text-right">Urgency</th>
                </tr>
              </thead>
              <tbody>
                {expiries.map((e) => (
                  <tr key={e.tenant} className="border-t border-border/60">
                    <td className="py-2.5 font-bold">{e.tenant}</td>
                    <td className="py-2.5 text-muted-foreground font-medium">{e.mall}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold">{e.sqft.toLocaleString()}</td>
                    <td className="py-2.5 text-right tabular-nums font-semibold">
                      {new Date(e.expiry).toLocaleDateString("en-SG", { month: "short", year: "numeric" })}
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge className={cn("rounded-full text-[10px] font-bold", urgencyStyles[e.urgency])} variant="secondary">
                        {e.urgency}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
