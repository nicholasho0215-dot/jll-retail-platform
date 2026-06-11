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
        "fixed inset-y-0 left-0 z-50 w-[272px] border-r bg-background flex flex-col",
        "transition-transform duration-300 ease-out",
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none lg:transition-none"
      )}
    >
      <div className="px-5 pt-7 pb-6 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Activity className="h-5 w-5" strokeWidth={2.6} />
          </div>
          <div>
            <div className="font-display font-black text-[15px] leading-none tracking-tight uppercase">Retail Pulse</div>
            <div className="text-[10.5px] text-muted-foreground font-semibold tracking-[0.14em] uppercase mt-1">Singapore · JLL</div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden rounded-md p-1.5 -mr-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-1">
        {navItems.map(({ id, label, icon: Icon, hint }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-3 lg:py-2.5 text-left border-l-2 transition-colors duration-150",
              active === id
                ? "border-primary bg-card text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/60"
            )}
          >
            <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={active === id ? 2.4 : 2} />
            <span className="flex-1">
              <span className={cn("block text-[13.5px]", active === id ? "font-bold" : "font-semibold")}>{label}</span>
              <span className="block text-[11px] opacity-70 font-normal">{hint}</span>
            </span>
          </button>
        ))}
      </nav>
      <div className="border-t px-5 py-4 mb-[max(0px,env(safe-area-inset-bottom))] text-[10.5px] leading-relaxed text-muted-foreground">
        <span className="font-bold text-foreground uppercase tracking-[0.12em]">Data · 11 Jun 26</span>
        <br />URA Q1 26 · SingStat Apr 26 · STB Apr 26 · curated news. Production connects live APIs.
      </div>
    </aside>
  );
}
