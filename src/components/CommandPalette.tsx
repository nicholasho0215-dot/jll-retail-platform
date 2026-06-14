import { useEffect } from "react";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from "@/components/ui/command";
import {
  LayoutDashboard, Map, Store, Newspaper, KanbanSquare, Sparkles, DoorOpen, ArrowRight,
} from "lucide-react";
import type { ViewId } from "@/components/Sidebar";
import { clusters, mallSpaces, storeMoves, news } from "@/data/marketData";

const viewItems: { id: ViewId; label: string; hint: string; icon: typeof Map }[] = [
  { id: "dashboard", label: "Market Pulse", hint: "KPIs & rent / vacancy trends", icon: LayoutDashboard },
  { id: "heatmap", label: "Retail Heatmap", hint: "Clusters, rents & leasing heat", icon: Map },
  { id: "spaces", label: "Space Finder", hint: "Vacant & expiring units", icon: DoorOpen },
  { id: "tracker", label: "Open / Close Tracker", hint: "Store openings & closures", icon: Store },
  { id: "news", label: "News Desk", hint: "Curated, AI-summarised headlines", icon: Newspaper },
  { id: "pipeline", label: "Deal Pipeline", hint: "Team deals & lease expiries", icon: KanbanSquare },
  { id: "assistant", label: "Market Assistant", hint: "Ask the market anything", icon: Sparkles },
];

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate: (v: ViewId) => void;
}) {
  // Global ⌘K / Ctrl-K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (v: ViewId) => {
    onNavigate(v);
    onOpenChange(false);
  };

  // Clean substring matching (cmdk's default fuzzy scorer surfaces too many
  // weak hits). Empty search shows everything.
  const filter = (value: string, search: string) => {
    const q = search.trim().toLowerCase();
    if (!q) return 1;
    return value.toLowerCase().includes(q) ? 1 : 0;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} filter={filter}>
      <CommandInput placeholder="Search malls, clusters, brands, news…" />
      <CommandList>
        <CommandEmpty>No results. Try a mall, cluster, brand or headline.</CommandEmpty>

        <CommandGroup heading="Go to">
          {viewItems.map((v) => (
            <CommandItem key={v.id} value={`${v.label} ${v.hint}`} onSelect={() => go(v.id)}>
              <v.icon className="text-muted-foreground" />
              <span className="font-medium">{v.label}</span>
              <span className="ml-2 text-[11px] text-muted-foreground truncate">{v.hint}</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/50" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Clusters & rents">
          {clusters.map((c) => (
            <CommandItem
              key={c.id}
              value={`${c.name} ${c.tier} ${c.keyMalls.join(" ")} cluster rent vacancy`}
              onSelect={() => go("heatmap")}
            >
              <Map className="text-muted-foreground" />
              <span className="font-medium">{c.name}</span>
              <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
                S${c.rentPsf} psf · {c.vacancy}% vac
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Available space">
          {mallSpaces.map((m) => {
            const now = m.units.filter((u) => u.status === "vacant").length;
            return (
              <CommandItem
                key={m.mall}
                value={`${m.mall} ${m.cluster} ${m.tier} unit space vacant available`}
                onSelect={() => go("spaces")}
              >
                <DoorOpen className="text-muted-foreground" />
                <span className="font-medium">{m.mall}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {m.units.length} unit{m.units.length > 1 ? "s" : ""}{now ? ` · ${now} now` : ""}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading="Store movements">
          {storeMoves.slice(0, 10).map((s) => (
            <CommandItem
              key={s.id}
              value={`${s.brand} ${s.location} ${s.category} ${s.type} ${s.signal} store`}
              onSelect={() => go("tracker")}
            >
              <Store className="text-muted-foreground" />
              <span className="font-medium">{s.brand}</span>
              <span className="ml-2 text-[11px] text-muted-foreground truncate">
                {s.type === "open" ? "opened" : "closing"} · {s.location}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="News">
          {news.slice(0, 8).map((n) => (
            <CommandItem
              key={n.id}
              value={`${n.headline} ${n.source} ${n.category} news`}
              onSelect={() => go("news")}
            >
              <Newspaper className="text-muted-foreground" />
              <span className="truncate">{n.headline}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
