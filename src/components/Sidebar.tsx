import { LayoutDashboard, Map, Store, Newspaper, KanbanSquare, Sparkles, Activity, X, DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewId = "dashboard" | "heatmap" | "spaces" | "tracker" | "news" | "pipeline" | "assistant";

const navItems: { id: ViewId; label: string; icon: typeof Map; hint: string }[] = [
  { id: "dashboard", label: "Market Pulse", icon: LayoutDashboard, hint: "KPIs & trends" },
  { id: "heatmap", label: "Retail Heatmap", icon: Map, hint: "Clusters & rents" },
  { id: "spaces", label: "Space Finder", icon: DoorOpen, hint: "Vacant & expiring units" },
  { id: "tracker", label: "Open / Close", icon: Store, hint: "Store movements" },
  { id: "news", label: "News Desk", icon: Newspaper, hint: "Curated & summarised" },
  { id: "pipeline", label: "Deal Pipeline", icon: KanbanSquare, hint: "Team deals & expiries" },
  { id: "assistant", label: "Assistant", icon: Sparkles, hint: "Ask the market" },
];

export function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
}: {
  active: ViewId;
  onNavigate: (v: ViewId) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-[272px] border-r bg-card flex flex-col",
        "transition-transform duration-300 ease-out",
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none lg:transition-none"
      )}
    >
      <div className="px-5 pt-6 pb-5 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#e8552d] to-[#c41324] flex items-center justify-center text-white shadow-sm">
            <Activity className="h-5 w-5" strokeWidth={2.6} />
          </div>
          <div>
            <div className="font-extrabold text-[15px] leading-tight tracking-tight">Retail Pulse</div>
            <div className="text-[11px] text-muted-foreground font-medium">Singapore · JLL Leasing</div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden rounded-lg p-1.5 -mr-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>
      <nav className="px-3 flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, hint }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-3 lg:py-2.5 text-left transition-colors",
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
      <div className="p-4 m-3 mb-[max(1rem,env(safe-area-inset-bottom))] rounded-xl bg-muted/60 text-[11px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Data snapshot:</span> Q1 2026 · URA, SingStat, STB & curated news. Production build connects live APIs.
      </div>
    </aside>
  );
}
