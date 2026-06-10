import { LayoutDashboard, Map, Store, Newspaper, KanbanSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewId = "dashboard" | "heatmap" | "tracker" | "news" | "pipeline" | "assistant";

const navItems: { id: ViewId; label: string; icon: typeof Map; hint: string }[] = [
  { id: "dashboard", label: "Market Pulse", icon: LayoutDashboard, hint: "KPIs & trends" },
  { id: "heatmap", label: "Retail Heatmap", icon: Map, hint: "Clusters & rents" },
  { id: "tracker", label: "Open / Close", icon: Store, hint: "Store movements" },
  { id: "news", label: "News Desk", icon: Newspaper, hint: "Curated & summarised" },
  { id: "pipeline", label: "Deal Pipeline", icon: KanbanSquare, hint: "Team deals & expiries" },
  { id: "assistant", label: "Assistant", icon: Sparkles, hint: "Ask the market" },
];

export function Sidebar({ active, onNavigate }: { active: ViewId; onNavigate: (v: ViewId) => void }) {
  return (
    <aside className="w-60 shrink-0 border-r bg-card flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-sm tracking-tight">
            JLL
          </div>
          <div>
            <div className="font-bold text-[15px] leading-tight">Retail Intelligence</div>
            <div className="text-[11px] text-muted-foreground font-medium">Singapore · Leasing</div>
          </div>
        </div>
      </div>
      <nav className="px-3 flex-1 space-y-1">
        {navItems.map(({ id, label, icon: Icon, hint }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              active === id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active === id ? 2.4 : 2} />
            <span className="flex-1">
              <span className={cn("block text-[13.5px]", active === id ? "font-bold" : "font-semibold")}>{label}</span>
              <span className="block text-[11px] opacity-70 font-normal">{hint}</span>
            </span>
          </button>
        ))}
      </nav>
      <div className="p-4 m-3 mb-4 rounded-xl bg-muted/60 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Data snapshot:</span> Q1 2026 · URA, SingStat, STB & curated news. Production build connects live APIs.
      </div>
    </aside>
  );
}
