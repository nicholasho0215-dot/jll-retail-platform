import { LayoutDashboard, Map, Store, Newspaper, KanbanSquare, Sparkles, X, DoorOpen } from "lucide-react";
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

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-[13px] tracking-tight leading-none">
        JLL
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display font-semibold text-[14px] tracking-tight">Retail Intelligence</div>
          <div className="text-[10px] text-muted-foreground font-medium tracking-[0.16em] uppercase mt-0.5">Singapore</div>
        </div>
      )}
    </div>
  );
}

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
        "lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none lg:transition-none"
      )}
    >
      <div className="h-16 px-5 flex items-center justify-between border-b">
        <BrandMark />
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="lg:hidden p-1.5 -mr-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Workspace
        </div>
        {navItems.map(({ id, label, icon: Icon, hint }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "group w-full flex items-center gap-3 px-5 py-2.5 text-left border-l-[3px] transition-colors duration-150",
              active === id
                ? "border-primary bg-muted/60 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <Icon
              className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active === id ? "text-primary" : "")}
              strokeWidth={2}
            />
            <span className="flex-1 min-w-0">
              <span className={cn("block text-[13.5px] leading-tight", active === id ? "font-semibold" : "font-medium")}>{label}</span>
              <span className="block text-[11px] text-muted-foreground font-normal truncate">{hint}</span>
            </span>
          </button>
        ))}
      </nav>

      <div className="border-t px-5 py-4 mb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">Data · 11 Jun 26</div>
        <p className="text-[10.5px] leading-relaxed text-muted-foreground mt-1">
          URA Q1 26 · SingStat Apr 26 · STB Apr 26 · curated news. Production connects live APIs.
        </p>
      </div>
    </aside>
  );
}
