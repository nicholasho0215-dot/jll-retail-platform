import { useState, type ComponentType } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Menu, Activity } from "lucide-react";
import { Sidebar, type ViewId } from "@/components/Sidebar";
import { PageBanner } from "@/components/PageBanner";
import { Ticker } from "@/components/Ticker";
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

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const View = views[view];

  const navigate = (v: ViewId) => {
    setView(v);
    setMenuOpen(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh overflow-hidden">
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
        )}
        <Sidebar active={view} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="lg:hidden flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                <Activity className="h-4 w-4" strokeWidth={2.6} />
              </div>
              <span className="font-display font-black text-[14px] tracking-tight uppercase">Retail Pulse</span>
            </div>
          </header>

          <Ticker />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1320px] mx-auto px-4 sm:px-8 py-5 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
              <PageBanner view={view} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
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
