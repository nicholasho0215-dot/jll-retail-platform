import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { clusters, type RetailCluster } from "@/data/marketData";
import { heatColor } from "@/lib/heat";

function bubbleIcon(c: RetailCluster, isSelected: boolean) {
  const d = Math.round(26 + (c.rentPsf - 13) * 1.7);
  const color = heatColor(c.intensity);
  const ring = isSelected ? "#0a0a0a" : "#ffffff";
  const label = c.name.split(" / ")[0];
  const pulse = c.intensity >= 0.85 || isSelected
    ? `<span class="heat-ring" style="background:${color};"></span>`
    : "";
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;font-family:Archivo,system-ui,sans-serif;">
        <div style="position:relative;width:${d}px;height:${d}px;">
          ${pulse}
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};border:2.5px solid ${ring};
            box-shadow:0 2px 8px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;
            color:#fff;font-weight:700;font-size:10.5px;letter-spacing:-0.2px;">
            $${c.rentPsf.toFixed(0)}
          </div>
        </div>
        <div style="margin-top:3px;font-size:10px;font-weight:700;color:#0a0a0a;white-space:nowrap;
          background:rgba(255,255,255,.9);padding:0 6px;border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,.12);">
          ${label}
        </div>
      </div>`,
    iconSize: [d, d + 22],
    iconAnchor: [d / 2, d / 2],
  });
}

export function ClusterMap({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (c: RetailCluster) => void;
}) {
  return (
    <MapContainer
      center={[1.337, 103.83]}
      zoom={11}
      minZoom={10}
      maxZoom={16}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", background: "#eef1f4" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {clusters.map((c) => (
        <Marker
          key={`${c.id}-${selectedId === c.id}`}
          position={[c.lat, c.lng]}
          icon={bubbleIcon(c, selectedId === c.id)}
          eventHandlers={{ click: () => onSelect(c) }}
          zIndexOffset={selectedId === c.id ? 1000 : Math.round(c.rentPsf * 10)}
        />
      ))}
    </MapContainer>
  );
}
