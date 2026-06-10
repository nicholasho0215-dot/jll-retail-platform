# Retail Pulse · Singapore Retail Intelligence

A retail leasing intelligence platform for the Singapore market — market KPIs, an
interactive cluster heatmap, store open/close tracking, curated news, a team deal
pipeline and a data-grounded market assistant.

**Live site:** https://nicholasho0215-dot.github.io/jll-retail-platform/

## Views

- **Market Pulse** — KPIs, prime rent trends and the new supply pipeline
- **Retail Heatmap** — interactive Leaflet map of retail clusters (bubble size = rent, colour = leasing heat)
- **Open / Close Tracker** — store movements with category and signal filters
- **News Desk** — curated headlines with AI summaries and bookmarking
- **Deal Pipeline** — kanban board of team deals plus a lease expiry radar
- **Market Assistant** — chat answers grounded in the platform dataset

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Recharts · React Leaflet

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # type-check + production build to dist/
```

## Deploying

GitHub Pages serves the `gh-pages` branch. To publish, build and push `dist/`:

```sh
npm run build
git subtree push --prefix dist origin gh-pages   # or your preferred gh-pages helper
```

Data is a static Q1 2026 snapshot (URA, SingStat, STB & curated news); a production
build would connect live APIs.
