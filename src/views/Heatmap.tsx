import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clusters, type RetailCluster } from "@/data/marketData";
import { cn } from "@/lib/utils";

// warm heat ramp: low → amber, high → JLL red
function heatColor(intensity: number) {
  if (intensity >= 0.85) return "#d6202f";
  if (intensity >= 0.7) return "#e8552d";
  if (intensity >= 0.6) return "#ef8430";
  if (intensity >= 0.5) return "#f2a93b";
  return "#f4c659";
}

const islandPath =
  "M60,268 C70,250 95,238 112,230 C135,218 152,210 168,198 C186,184 200,172 222,158 " +
  "C248,140 270,124 296,110 C318,98 338,88 356,86 C378,84 398,92 420,100 " +
  "C444,108 466,108 488,114 C510,120 538,124 562,132 C600,144 650,156 696,170 " +
  "C718,177 736,182 740,188 C736,198 712,206 690,214 C664,224 636,234 606,244 " +
  "C576,254 548,260 520,266 C492,272 468,282 444,288 C420,294 396,297 372,296 " +
  "C344,295 314,290 286,286 C252,281 214,282 178,284 C140,287 104,282 80,276 C68,273 60,270 60,268 Z";

export function Heatmap() {
  const [selected, setSelected] = useState<RetailCluster>(clusters[0]);

  return (
    <div className="grid xl:grid-cols-[1fr_340px] gap-5">
      <Card className="rounded-2xl shadow-sm border-border/70 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between px-2 pt-1 pb-3">
            <div>
              <h3 className="text-[15px] font-bold">Retail Cluster Heatmap</h3>
              <p className="text-[12px] text-muted-foreground">Bubble size = prime rent · colour = leasing heat · click a cluster</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#f4c659" }} /> Warm
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#ef8430" }} /> Hot
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#d6202f" }} /> Hottest
            </div>
          </div>
          <svg viewBox="0 0 800 400" className="w-full" role="img" aria-label="Singapore retail cluster heatmap">
            {/* sea */}
            <rect width="800" height="400" rx="16" fill="#eaf3f6" />
            {/* island */}
            <path d={islandPath} fill="#fbf7ef" stroke="#d9cfbd" strokeWidth="1.5" />
            {/* sentosa */}
            <ellipse cx="372" cy="330" rx="26" ry="11" fill="#fbf7ef" stroke="#d9cfbd" strokeWidth="1.5" />
            <text x="372" y="354" textAnchor="middle" fontSize="10" fill="#9b8f7d" fontWeight="600">Sentosa</text>

            {clusters.map((c) => {
              const r = 9 + (c.rentPsf - 17) * 0.85;
              const isSel = selected.id === c.id;
              return (
                <g key={c.id} onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
                  <circle cx={c.x} cy={c.y} r={r + 7} fill={heatColor(c.intensity)} opacity={isSel ? 0.25 : 0.12} />
                  <circle
                    cx={c.x} cy={c.y} r={r}
                    fill={heatColor(c.intensity)} opacity={0.92}
                    stroke={isSel ? "#1f2937" : "#ffffff"} strokeWidth={isSel ? 2.5 : 1.5}
                  />
                  <text x={c.x} y={c.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">
                    ${c.rentPsf.toFixed(0)}
                  </text>
                  <text x={c.x} y={c.y + r + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="#4b4435">
                    {c.name.split(" / ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-2xl shadow-sm border-border/70">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[17px] font-extrabold leading-tight">{selected.name}</h3>
              <Badge
                className={cn(
                  "rounded-full font-bold text-[10.5px] shrink-0",
                  selected.tier === "Prime" && "bg-rose-100 text-rose-700 hover:bg-rose-100",
                  selected.tier === "City Fringe" && "bg-amber-100 text-amber-700 hover:bg-amber-100",
                  selected.tier === "Suburban" && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                )}
              >
                {selected.tier}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <div className="text-[18px] font-extrabold tabular-nums">${selected.rentPsf}</div>
                <div className="text-[10.5px] font-semibold text-muted-foreground">psf/mo</div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <div className="text-[18px] font-extrabold tabular-nums text-emerald-600">+{selected.rentChangeYoY}%</div>
                <div className="text-[10.5px] font-semibold text-muted-foreground">rent y-o-y</div>
              </div>
              <div className="rounded-xl bg-muted/50 p-3 text-center">
                <div className="text-[18px] font-extrabold tabular-nums">{selected.vacancy}%</div>
                <div className="text-[10.5px] font-semibold text-muted-foreground">vacancy</div>
              </div>
            </div>

            <p className="text-[12.5px] leading-relaxed text-muted-foreground mt-4">{selected.note}</p>

            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Key malls</div>
              <div className="flex flex-wrap gap-1.5">
                {selected.keyMalls.map((m) => (
                  <span key={m} className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-semibold">{m}</span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">In demand</div>
              <div className="flex flex-wrap gap-1.5">
                {selected.hotCategories.map((c) => (
                  <span key={c} className="rounded-full bg-accent px-2.5 py-1 text-[11.5px] font-bold text-accent-foreground">{c}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/70">
          <CardContent className="pt-4 pb-3">
            <div className="text-[12px] font-bold mb-2.5">All clusters by rent</div>
            <div className="space-y-1">
              {[...clusters].sort((a, b) => b.rentPsf - a.rentPsf).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors",
                    selected.id === c.id ? "bg-accent font-bold" : "hover:bg-muted font-medium"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: heatColor(c.intensity) }} />
                    {c.name}
                  </span>
                  <span className="tabular-nums font-bold">${c.rentPsf}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
