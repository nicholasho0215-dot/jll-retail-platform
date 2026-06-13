import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Zap, Radio, ExternalLink } from "lucide-react";
import { news } from "@/data/marketData";
import { fetchLiveFeed, getBackendUrl, type LiveArticle } from "@/lib/backend";
import { cn } from "@/lib/utils";

const filters = ["All", "Market", "Deals", "Brands", "Policy", "Competitor"] as const;
const liveFilters = ["All", "Urgent", "Digest"] as const;

const impactStyles = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

function LiveFeed({ articles }: { articles: LiveArticle[] }) {
  const [filter, setFilter] = useState<(typeof liveFilters)[number]>("All");
  const items = useMemo(
    () => articles.filter((a) => filter === "All" || a.classification === filter.toLowerCase()),
    [articles, filter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {liveFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="relative rounded-full px-3.5 py-1.5 text-[12px] font-bold bg-muted"
          >
            {filter === f && (
              <motion.span
                layoutId="live-filter-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <span className={cn("relative transition-colors duration-150", filter === f ? "text-background" : "text-muted-foreground hover:text-foreground")}>
              {f}
            </span>
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <Radio className="h-3.5 w-3.5" />
          LIVE FEED · {articles.length} articles · AI-classified
        </span>
      </div>

      <Card className="rounded-xl">
        <CardContent className="pt-2 pb-2 px-0">
          <div className="divide-y">
            {items.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="block px-4 sm:px-5 py-3.5 hover:bg-muted/40 transition-colors duration-150 group"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {a.classification === "urgent" && (
                    <span className="rounded-full bg-[#E30613] text-white px-2 py-0.5 text-[9.5px] font-black tracking-[0.08em] uppercase">Urgent</span>
                  )}
                  <span className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-[0.08em]">{a.source}</span>
                  <span className="text-[10.5px] text-muted-foreground font-medium tabular-nums ml-auto">{timeAgo(a.fetched_at)}</span>
                </div>
                <h3 className="font-bold text-[14px] leading-snug mt-1.5 group-hover:text-[#E30613] transition-colors duration-150 inline-flex items-start gap-1.5">
                  {a.title}
                  <ExternalLink className="h-3 w-3 mt-1 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity duration-150" />
                </h3>
                <p className="text-[12.5px] leading-relaxed text-muted-foreground mt-1">{a.summary}</p>
              </a>
            ))}
            {items.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-8 text-center">No articles in this view yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SnapshotFeed() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const items = useMemo(
    () => news.filter((n) => filter === "All" || n.category === filter),
    [filter]
  );

  const toggleSave = (id: number) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="relative rounded-full px-3.5 py-1.5 text-[12px] font-bold bg-muted"
          >
            {filter === f && (
              <motion.span
                layoutId="news-filter-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <span className={cn("relative transition-colors", filter === f ? "text-background" : "text-muted-foreground hover:text-foreground")}>
              {f}
            </span>
          </button>
        ))}
        <span className="ml-auto text-[11.5px] text-muted-foreground font-medium">
          {getBackendUrl() ? "Live feed unreachable — showing snapshot" : "Snapshot · connect the intelligence server for live news"}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((n) => (
          <Card key={n.id} className="rounded-xl card-lift">
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

export function News() {
  const [live, setLive] = useState<LiveArticle[] | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchLiveFeed().then((articles) => {
      if (!cancelled) {
        setLive(articles && articles.length > 0 ? articles : null);
        setChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!checked && getBackendUrl()) {
    return <p className="text-[13px] text-muted-foreground py-8 text-center">Loading live feed…</p>;
  }
  return live ? <LiveFeed articles={live} /> : <SnapshotFeed />;
}
