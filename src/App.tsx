import { useState } from "react";
import { Menu, Activity } from "lucide-react";
import { Sidebar, type ViewId } from "@/components/Sidebar";
import { Dashboard } from "@/views/Dashboard";
import { Heatmap } from "@/views/Heatmap";
import { Tracker } from "@/views/Tracker";
import { News } from "@/views/News";
import { Pipeline } from "@/views/Pipeline";
import { Assistant } from "@/views/Assistant";

const titles: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: "Market Pulse", subtitle: "Singapore retail at a glance — refreshed every morning" },
  heatmap: { title: "Retail Heatmap", subtitle: "Where the leasing heat is across the island" },
  tracker: { title: "Open / Close Tracker", subtitle: "Who's moving in, who's moving out" },
  news: { title: "News Desk", subtitle: "Curated headlines, summarised so you can scan" },
  pipeline: { title: "Deal Pipeline", subtitle: "Team deals, next actions and expiry radar" },
  assistant: { title: "Market Assistant", subtitle: "Ask anything — answers grounded in platform data" },
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const { title, subtitle } = titles[view];

  const navigate = (v: ViewId) => {
    setView(v);
    setMenuOpen(false);
  };

  return (
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
        <header className="lg:hidden flex h-14 shrink-0 items-center gap-2 border-b bg-card/90 backdrop-blur px-3">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#e8552d] to-[#c41324] flex items-center justify-center text-white">
              <Activity className="h-4 w-4" strokeWidth={2.6} />
            </div>
            <span className="font-extrabold text-[15px] tracking-tight">Retail Pulse</span>
          </div>
          <span className="ml-auto text-[11px] font-semibold text-muted-foreground">{title}</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <header className="flex flex-wrap items-end justify-between gap-3 mb-5 sm:mb-6">
              <div>
                <h1 className="text-[20px] sm:text-[22px] font-extrabold tracking-tight">{title}</h1>
                <p className="text-[12.5px] sm:text-[13px] text-muted-foreground font-medium mt-0.5">{subtitle}</p>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-[13px] font-bold">{greeting()} 👋</div>
                <div className="text-[12px] text-muted-foreground font-medium">
                  {new Date().toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            </header>
            {view === "dashboard" && <Dashboard />}
            {view === "heatmap" && <Heatmap />}
            {view === "tracker" && <Tracker />}
            {view === "news" && <News />}
            {view === "pipeline" && <Pipeline />}
            {view === "assistant" && <Assistant />}
          </div>
        </main>
      </div>
    </div>
  );
}
