import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clusters, type RetailCluster } from "@/data/marketData";
import { islandPaths, clusterXY, MAP_W, MAP_H } from "@/data/sgOutline";
import { cn } from "@/lib/utils";

// warm heat ramp: low → amber, high → JLL red
function heatColor(intensity: number) {
  if (intensity >= 0.85) return "#d6202f";
  if (intensity >= 0.7) return "#e8552d";
  if (intensity >= 0.6) return "#ef8430";
  if (intensity >= 0.5) return "#f2a93b";
  return "#f4c659";
}

// label placement per cluster — downtown is dense, so labels fan outward
const labelPos: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  orchard: { dx: -20, dy: -20, anchor: "end" },
  marina: { dx: 14, dy: 26, anchor: "start" },
  bugis: { dx: 22, dy: -6, anchor: "start" },
  chinatown: { dx: -18, dy: 14, anchor: "end" },
  harbourfront: { dx: -14, dy: 22, anchor: "end" },
  "paya-lebar": { dx: 16, dy: 16, anchor: "start" },
  tampines: { dx: 0, dy: 26, anchor: "middle" },
  jurong: { dx: 0, dy: -16, anchor: "middle" },
  woodlands: { dx: 0, dy: -18, anchor: "middle" },
  serangoon: { dx: 18, dy: -10, anchor: "start" },
  punggol: { dx: 14, dy: -14, anchor: "start" },
  bishan: { dx: -18, dy: -10, anchor: "end" },
};

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
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full" role="img" aria-label="Singapore retail cluster heatmap">
            {/* sea */}
            <rect width={MAP_W} height={MAP_H} rx="16" fill="#e7f1f5" />
            {/* real Singapore coastline (GADM boundary data) */}
            {islandPaths.map((d, i) => (
              <path key={i} d={d} fill="#fbf7ef" stroke="#cfc4ae" strokeWidth="1.2" strokeLinejoin="round" />
            ))}

            {clusters.map((c) => {
              const pos = clusterXY[c.id];
              if (!pos) return null;
              const r = 7 + (c.rentPsf - 17) * 0.62;
              const isSel = selected.id === c.id;
              const lp = labelPos[c.id] ?? { dx: 0, dy: r + 14, anchor: "middle" as const };
              return (
                <g key={c.id} onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
                  <circle cx={pos.x} cy={pos.y} r={r + 6} fill={heatColor(c.intensity)} opacity={isSel ? 0.28 : 0.13} />
                  <circle
                    cx={pos.x} cy={pos.y} r={r}
                    fill={heatColor(c.intensity)} opacity={0.94}
                    stroke={isSel ? "#1f2937" : "#ffffff"} strokeWidth={isSel ? 2.5 : 1.5}
                  />
                  <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">
                    ${c.rentPsf.toFixed(0)}
                  </text>
                  <text
                    x={pos.x + lp.dx} y={pos.y + lp.dy}
                    textAnchor={lp.anchor} fontSize="11" fontWeight="700" fill="#4b4435"
                    paintOrder="stroke" stroke="#fbf7ef" strokeWidth="3"
                  >
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
