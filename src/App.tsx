import { useState } from "react";
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
  const { title, subtitle } = titles[view];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={view} onNavigate={setView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <header className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h1 className="text-[22px] font-extrabold tracking-tight">{title}</h1>
              <p className="text-[13px] text-muted-foreground font-medium mt-0.5">{subtitle}</p>
            </div>
            <div className="text-right">
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
  );
}
