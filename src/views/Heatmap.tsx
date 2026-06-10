import { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

function bubbleIcon(c: RetailCluster, isSelected: boolean) {
  const d = Math.round(30 + (c.rentPsf - 17) * 1.1); // diameter scales with rent
  const color = heatColor(c.intensity);
  const ring = isSelected ? "#1f2937" : "#ffffff";
  const label = c.name.split(" / ")[0];
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
        <div style="width:${d}px;height:${d}px;border-radius:50%;background:${color};border:2.5px solid ${ring};
          box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;
          color:#fff;font-weight:800;font-size:11px;letter-spacing:-0.2px;">
          $${c.rentPsf.toFixed(0)}
        </div>
        <div style="margin-top:3px;font-size:11px;font-weight:700;color:#1f2937;white-space:nowrap;
          background:rgba(255,255,255,.88);padding:1px 7px;border-radius:99px;box-shadow:0 1px 3px rgba(0,0,0,.15);">
          ${label}
        </div>
      </div>`,
    iconSize: [d, d + 24],
    iconAnchor: [d / 2, d / 2], // circle centred on the location; label hangs below
  });
}

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
          <div className="rounded-xl overflow-hidden border border-border/60" style={{ height: 480 }}>
            <MapContainer
              center={[1.335, 103.84]}
              zoom={11}
              minZoom={10}
              maxZoom={17}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", background: "#e7f1f5" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {clusters.map((c) => (
                <Marker
                  key={`${c.id}-${selected.id === c.id}`}
                  position={[c.lat, c.lng]}
                  icon={bubbleIcon(c, selected.id === c.id)}
                  eventHandlers={{ click: () => setSelected(c) }}
                  zIndexOffset={selected.id === c.id ? 1000 : Math.round(c.rentPsf * 10)}
                />
              ))}
            </MapContainer>
          </div>
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
