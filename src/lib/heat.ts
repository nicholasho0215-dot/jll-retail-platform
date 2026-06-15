// Warm leasing-heat ramp: low → amber, high → JLL red.
export function heatColor(intensity: number) {
  if (intensity >= 0.85) return "#E30613";
  if (intensity >= 0.7) return "#e8552d";
  if (intensity >= 0.6) return "#ef8430";
  if (intensity >= 0.5) return "#f2a93b";
  return "#f4c659";
}
