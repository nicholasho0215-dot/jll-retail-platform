import { motion } from "framer-motion";
import type { ViewId } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

// Self-hosted banner photography (public/img/, optimized at build time).
// Banners degrade to the skyline silhouette below if an image fails to load.
const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;

const meta: Record<ViewId, { title: string; subtitle: string; img: string }> = {
  dashboard: {
    title: "Market Pulse",
    subtitle: "Singapore retail at a glance — refreshed every morning",
    img: img("marina-dusk.jpg"), // Marina Bay blue hour with the Flyer
  },
  heatmap: {
    title: "Retail Heatmap",
    subtitle: "Where the leasing heat is across the island",
    img: img("island-panorama.jpg"), // bay panorama with reflections
  },
  spaces: {
    title: "Space Finder",
    subtitle: "Vacant and expiring units, mall by mall — spot the next opportunity",
    img: img("cbd-night.jpg"), // CBD towers at night
  },
  tracker: {
    title: "Open / Close Tracker",
    subtitle: "Who's moving in, who's moving out",
    img: img("shophouses.jpg"), // Koon Seng Road shophouses
  },
  news: {
    title: "News Desk",
    subtitle: "Curated headlines, summarised so you can scan",
    img: img("cbd-night.jpg"), // CBD towers at night
  },
  pipeline: {
    title: "Deal Pipeline",
    subtitle: "Team deals, next actions and expiry radar",
    img: img("marina-dusk.jpg"), // Marina Bay blue hour
  },
  assistant: {
    title: "Market Assistant",
    subtitle: "Ask anything — answers grounded in platform data",
    img: img("bay-panorama.jpg"), // Gardens by the Bay & Flyer panorama
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
        "relative overflow-hidden rounded-xl mb-8 sm:mb-10 bg-[#14161c]",
        tall ? "h-48 sm:h-72" : "h-36 sm:h-48"
      )}
    >
      <Skyline className="absolute bottom-0 left-0 w-full h-[70%] text-white/[0.07]" />
      <div className="absolute inset-0 kenburns">
        <motion.img
          key={view}
          src={m.img}
          alt=""
          loading={tall ? "eager" : "lazy"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      {/* Single legibility scrim — darkest where the text sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

      {tall && (
        <div className="absolute right-4 sm:right-8 top-4 sm:top-6 hidden sm:block text-right">
          <div className="text-[13px] font-bold text-white">{greeting()}</div>
          <div className="text-[11.5px] text-white/65 font-medium tabular-nums">
            {new Date().toLocaleDateString("en-SG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      )}

      <div className="relative h-full flex flex-col justify-end px-5 sm:px-9 pb-5 sm:pb-8">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-[14px] w-[3px] bg-primary" />
            <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white/85">
              JLL Singapore · Retail Intelligence
            </span>
          </div>
          <h1
            className={cn(
              "font-display text-white font-medium leading-[1.02] tracking-[-0.02em]",
              tall ? "text-[36px] sm:text-[56px]" : "text-[28px] sm:text-[40px]"
            )}
          >
            {m.title}
          </h1>
          <p className="text-white/75 text-[13px] sm:text-[14px] font-normal mt-3 max-w-[36rem] leading-relaxed">{m.subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
}
