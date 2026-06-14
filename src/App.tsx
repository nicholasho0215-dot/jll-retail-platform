import { useState, type ComponentType } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Menu, Search } from "lucide-react";
import { Sidebar, BrandMark, type ViewId } from "@/components/Sidebar";
import { PageBanner } from "@/components/PageBanner";
import { Ticker } from "@/components/Ticker";
import { CommandPalette } from "@/components/CommandPalette";
import { Dashboard } from "@/views/Dashboard";
import { Heatmap } from "@/views/Heatmap";
import { Spaces } from "@/views/Spaces";
import { Tracker } from "@/views/Tracker";
import { News } from "@/views/News";
import { Pipeline } from "@/views/Pipeline";
import { Assistant } from "@/views/Assistant";

const views: Record<ViewId, ComponentType> = {
  dashboard: Dashboard,
  heatmap: Heatmap,
  spaces: Spaces,
  tracker: Tracker,
  news: News,
  pipeline: Pipeline,
  assistant: Assistant,
};

const sectionLabels: Record<ViewId, string> = {
  dashboard: "Market Pulse",
  heatmap: "Retail Heatmap",
  spaces: "Space Finder",
  tracker: "Open / Close Tracker",
  news: "News Desk",
  pipeline: "Deal Pipeline",
  assistant: "Market Assistant",
};

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const View = views[view];

  const navigate = (v: ViewId) => {
    setView(v);
    setMenuOpen(false);
  };

  const today = new Date().toLocaleDateString("en-SG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <MotionConfig reducedMotion="user">
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} onNavigate={navigate} />
      <div className="flex h-dvh overflow-hidden">
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
        )}
        <Sidebar active={view} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Top utility bar (JLL house style) */}
          <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-3 sm:px-6">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile: brand. Desktop: breadcrumb. */}
            <div className="lg:hidden">
              <BrandMark compact />
            </div>
            <div className="hidden lg:flex items-baseline gap-2 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Retail Intelligence</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-display text-[15px] font-semibold tracking-tight truncate">{sectionLabels[view]}</span>
            </div>

            {/* Global search — opens the command palette (⌘K) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="ml-auto group flex items-center gap-2 h-9 rounded-[3px] border bg-muted/40 hover:bg-muted hover:border-foreground/30 transition-colors duration-150 px-3 w-9 sm:w-64 justify-center sm:justify-start"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="hidden sm:inline text-[12.5px] text-muted-foreground">Search malls, brands, news…</span>
              <kbd className="hidden sm:inline ml-auto text-[10px] font-semibold text-muted-foreground border rounded-[2px] px-1.5 py-0.5 bg-background">⌘K</kbd>
            </button>

            <div className="hidden md:block text-right shrink-0 pl-1">
              <div className="text-[11px] font-semibold tabular-nums">{today}</div>
              <div className="text-[10px] text-muted-foreground tracking-[0.1em] uppercase">Singapore · SGT</div>
            </div>
          </header>

          <Ticker />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-5 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <PageBanner view={view} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <View />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
