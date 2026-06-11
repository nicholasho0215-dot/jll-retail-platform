import { motion } from "framer-motion";
import type { ViewId } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

// Unsplash download endpoints (Unsplash License — free to use, hotlinking via
// the official per-photo download URL). Banners degrade to the gradient +
// skyline silhouette below if an image fails to load.
const unsplash = (id: string) => `https://unsplash.com/photos/${id}/download?w=1600`;

const meta: Record<ViewId, { title: string; subtitle: string; img: string }> = {
  dashboard: {
    title: "Market Pulse",
    subtitle: "Singapore retail at a glance — refreshed every morning",
    img: unsplash("IRhO5KF0YVc"), // Marina Bay CBD skyline after sunset
  },
  heatmap: {
    title: "Retail Heatmap",
    subtitle: "Where the leasing heat is across the island",
    img: unsplash("KZhMBYzKtNg"), // Orchard Road street scene
  },
  spaces: {
    title: "Space Finder",
    subtitle: "Vacant and expiring units, mall by mall — spot the next opportunity",
    img: unsplash("b3ubz8yNlEI"), // Jewel Changi Rain Vortex interior
  },
  tracker: {
    title: "Open / Close Tracker",
    subtitle: "Who's moving in, who's moving out",
    img: unsplash("nH8nIhD4IJo"), // Chinatown shophouse street with lanterns
  },
  news: {
    title: "News Desk",
    subtitle: "Curated headlines, summarised so you can scan",
    img: unsplash("1eWyU9uLRJk"), // Marina Bay Sands over the skyline
  },
  pipeline: {
    title: "Deal Pipeline",
    subtitle: "Team deals, next actions and expiry radar",
    img: unsplash("i3k4BZcHa7c"), // Marina Bay Sands / CBD
  },
  assistant: {
    title: "Market Assistant",
    subtitle: "Ask anything — answers grounded in platform data",
    img: unsplash("4HVCsDOg0qI"), // Gardens by the Bay supertrees at night
  },
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// Simplified Singapore skyline silhouette (CBD towers, Marina Bay Sands,
// Singapore Flyer) — shows through while photos load or if they fail.
function Skyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <g fill="currentColor">
        <rect x="0" y="80" width="60" height="80" />
        <rect x="70" y="55" width="45" height="105" />
        <rect x="125" y="95" width="55" height="65" />
        <rect x="190" y="40" width="38" height="120" />
        <rect x="238" y="70" width="52" height="90" />
        <rect x="300" y="25" width="42" height="135" />
        <rect x="352" y="60" width="58" height="100" />
        <rect x="420" y="45" width="36" height="115" />
        {/* Marina Bay Sands — three towers + skypark */}
        <rect x="540" y="55" width="34" height="105" />
        <rect x="586" y="55" width="34" height="105" />
        <rect x="632" y="55" width="34" height="105" />
        <path d="M525 55 Q 603 30 681 55 L 681 47 Q 603 20 525 47 Z" />
        {/* Singapore Flyer */}
        <circle cx="780" cy="80" r="38" fill="none" stroke="currentColor" strokeWidth="6" />
        <rect x="776" y="80" width="8" height="80" />
        <rect x="850" y="90" width="50" height="70" />
        <rect x="910" y="50" width="40" height="110" />
        <rect x="960" y="75" width="55" height="85" />
        <rect x="1025" y="35" width="38" height="125" />
        <rect x="1073" y="65" width="50" height="95" />
        <rect x="1133" y="90" width="67" height="70" />
      </g>
    </svg>
  );
}

export function PageBanner({ view }: { view: ViewId }) {
  const m = meta[view];
  const tall = view === "dashboard";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl mb-5 sm:mb-6 bg-[#171a22] shadow-md",
        tall ? "h-44 sm:h-60" : "h-32 sm:h-40"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b1e28] via-[#241820] to-[#451522]" />
      <Skyline className="absolute bottom-0 left-0 w-full h-[70%] text-white/[0.08]" />
      <div className="absolute inset-0 kenburns">
        <motion.img
          key={view}
          src={m.img}
          alt=""
          loading={tall ? "eager" : "lazy"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#e8552d] to-[#c41324]" />

      {tall && (
        <div className="absolute right-4 sm:right-6 top-4 sm:top-5 hidden sm:block text-right">
          <div className="text-[13px] font-bold text-white drop-shadow">{greeting()} 👋</div>
          <div className="text-[12px] text-white/70 font-medium">
            {new Date().toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      )}

      <div className="relative h-full flex flex-col justify-end px-4 sm:px-6 pb-4 sm:pb-5">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#ff8d7a] mb-1">
            JLL Singapore · Retail
          </div>
          <h1 className={cn("text-white font-extrabold tracking-tight drop-shadow", tall ? "text-[26px] sm:text-[32px]" : "text-[21px] sm:text-[26px]")}>
            {m.title}
          </h1>
          <p className="text-white/75 text-[12.5px] sm:text-[13.5px] font-medium mt-0.5 max-w-[36rem]">{m.subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
}
