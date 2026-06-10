import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Zap } from "lucide-react";
import { news } from "@/data/marketData";
import { cn } from "@/lib/utils";

const filters = ["All", "Market", "Deals", "Brands", "Policy", "Competitor"] as const;

const impactStyles = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

export function News() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const items = useMemo(
    () => news.filter((n) => filter === "All" || n.category === filter),
    [filter]
  );

  const toggleSave = (id: number) =>
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors",
              filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-[11.5px] text-muted-foreground font-medium">
          {saved.size > 0 ? `${saved.size} saved for client prep` : "Bookmark articles for client prep"}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((n) => (
          <Card key={n.id} className="rounded-2xl shadow-sm border-border/70">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full text-[10px] font-bold">{n.category}</Badge>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1", impactStyles[n.impact])}>
                  <Zap className="h-2.5 w-2.5" />
                  {n.impact} impact
                </span>
                <button
                  onClick={() => toggleSave(n.id)}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Bookmark"
                >
                  {saved.has(n.id)
                    ? <BookmarkCheck className="h-4 w-4 text-primary" />
                    : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
              <h3 className="font-bold text-[14px] leading-snug mt-2.5">{n.headline}</h3>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground mt-1.5">
                <span className="font-bold text-accent-foreground">AI summary · </span>
                {n.summary}
              </p>
              <div className="text-[11px] text-muted-foreground font-semibold mt-2.5">
                {n.source} · {new Date(n.date).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
