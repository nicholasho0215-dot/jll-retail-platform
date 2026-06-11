#!/usr/bin/env python3
"""
Retail Pulse Intelligence API
=============================
Server-side brain for the Retail Pulse website (jll-retail-platform),
ported from the team's Telegram retail-bot.

What it does:
  • Polls 12 Singapore retail/property RSS feeds every 30 minutes
  • Uses Claude to summarise + classify every article (urgent / digest / skip)
  • Stores articles in SQLite (mount a volume and set DB_PATH to persist)
  • Serves the live feed to the website's News Desk:        GET  /feed
  • Serves the action-first AI analyst to the Assistant:    POST /chat
      - tools: search_articles (local DB), web_search (Gemini + Google
        Search grounding), fetch_feeds_now, team preferences
      - the website sends its platform dataset as market_context so the
        agent answers rents/vacancy/Space Finder questions too

Deploy (Railway):
  root directory  = server/
  start command   = uvicorn main:app --host 0.0.0.0 --port $PORT
  env vars        = ANTHROPIC_API_KEY (required),
                    GEMINI_API_KEY (optional, enables web_search),
                    ACCESS_CODE (optional, gates /chat),
                    DB_PATH (optional, e.g. /data/articles.db with a volume)
"""

import asyncio
import html
import json
import logging
import os
import re
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime

import anthropic
import feedparser
import httpx
import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("retail_pulse_api")

SGT = pytz.timezone("Asia/Singapore")

# ── RSS feeds (carried over from the Telegram bot) ────────────────────────────

RSS_FEEDS: dict[str, str] = {
    "Inside Retail Asia":  "https://insideretail.asia/feed/",
    "The Business Times":  "https://www.businesstimes.com.sg/rss/all",
    "EdgeProp Singapore":  "https://www.edgeprop.sg/rss.xml",
    "URA Press Releases":  "https://www.ura.gov.sg/Corporate/RSS/media-room",
    "CNA Business":        "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511",
    "Eatbook":             "https://eatbook.sg/feed/",
    "SETHLUI":             "https://sethlui.com/feed/",
    "MICHELIN Guide SG":   "https://guide.michelin.com/sg/en/articles/rss.xml",
    "Mothership":          "https://mothership.sg/feed/",
    "The Straits Times — Business":  "https://www.straitstimes.com/news/business/rss.xml",
    "The Straits Times — Singapore": "https://www.straitstimes.com/news/singapore/rss.xml",
    "CNA Singapore":       "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=10416",
}

URGENT_CRITERIA = """\
First, decide if the article is RELEVANT to Singapore retail real estate, malls, REITs, retail brands, \
retail property transactions, or Singapore consumer/macro data. If it is NOT relevant — for example, \
it is about politics, foreign affairs, crime, entertainment, sport, natural disasters, or general \
Asian/global business with no Singapore retail angle — classify it as SKIP.

If the article IS relevant, classify as URGENT if it reports on ANY of the following:
• Retailer bankruptcy, insolvency, or confirmed exit from Singapore or Southeast Asia
• Major anchor tenant signing, flagship store opening, or significant retail brand launch in Singapore
• URA Master Plan amendments, zoning policy changes, or MAS policy announcements affecting REITs
• Major mall redevelopment, collective/en-bloc sale, or REIT acquisition of a Singapore retail asset
• Singapore retail macro data releases: CPI, consumer confidence index, or official retail sales figures

Classify as DIGEST if it is relevant but does not meet the URGENT criteria.
Classify as SKIP if it has no meaningful relevance to Singapore retail real estate."""

# ── Environment ───────────────────────────────────────────────────────────────

def _require(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise EnvironmentError(f"Required environment variable '{name}' is missing.")
    return value


ANTHROPIC_API_KEY: str = _require("ANTHROPIC_API_KEY")
GEMINI_API_KEY:    str = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL:      str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
CLAUDE_MODEL:      str = os.getenv("CLAUDE_MODEL", "claude-opus-4-8")
CLASSIFIER_MODEL:  str = os.getenv("CLASSIFIER_MODEL", "claude-haiku-4-5")
DB_PATH:           str = os.getenv("DB_PATH", "articles.db")
# Optional shared passphrase gating /chat (NOT an API key — just a cheap lock
# so strangers can't burn Anthropic credit through the public site).
ACCESS_CODE:       str = os.getenv("ACCESS_CODE", "").strip()
# Comma-separated extra CORS origins, if the site ever moves.
EXTRA_ORIGINS:     str = os.getenv("CORS_ORIGINS", "").strip()

ALLOWED_ORIGINS = [
    "https://nicholasho0215-dot.github.io",
    "http://localhost:5173",
    "http://localhost:4173",
] + [o.strip() for o in EXTRA_ORIGINS.split(",") if o.strip()]

# ── Database (schema unchanged from the bot) ──────────────────────────────────

def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                url            TEXT PRIMARY KEY,
                title          TEXT NOT NULL,
                summary        TEXT NOT NULL,
                classification TEXT NOT NULL CHECK(classification IN ('urgent','digest')),
                source         TEXT NOT NULL,
                published_at   TEXT,
                fetched_at     TEXT NOT NULL,
                urgent_sent    INTEGER NOT NULL DEFAULT 0,
                digest_sent    INTEGER NOT NULL DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS preferences (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                kind       TEXT NOT NULL,
                value      TEXT NOT NULL,
                added_by   TEXT,
                added_at   TEXT NOT NULL
            )
        """)
        conn.commit()
    logger.info("Database initialised: %s", DB_PATH)


def add_preference(kind: str, value: str, added_by: str) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO preferences (kind, value, added_by, added_at) VALUES (?, ?, ?, ?)",
            (kind, value, added_by, datetime.now(SGT).isoformat()),
        )
        conn.commit()


def get_all_preferences() -> list[dict]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM preferences ORDER BY added_at ASC").fetchall()
        return [dict(r) for r in rows]


def clear_preferences() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM preferences")
        conn.commit()


def build_preference_block() -> str:
    prefs = get_all_preferences()
    if not prefs:
        return ""
    lines = []
    text_prefs = [p for p in prefs if p["kind"] == "text"]
    example_prefs = [p for p in prefs if p["kind"] == "example"]
    if text_prefs:
        lines.append("The team has expressed the following content preferences:")
        lines += [f"  • {p['value']}" for p in text_prefs]
    if example_prefs:
        lines.append("The team wants more articles similar to these examples:")
        lines += [f"  • {p['value']}" for p in example_prefs]
    lines.append(
        "Please adjust your classification and the depth of your summary to reflect "
        "these preferences. Preferred topics should be less likely to be classified as SKIP."
    )
    return "\n".join(lines)


def article_exists(url: str) -> bool:
    with sqlite3.connect(DB_PATH) as conn:
        return conn.execute("SELECT 1 FROM articles WHERE url = ?", (url,)).fetchone() is not None


def insert_article(url: str, title: str, summary: str, classification: str,
                   source: str, published_at: str) -> None:
    now = datetime.now(SGT).isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT OR IGNORE INTO articles
                (url, title, summary, classification, source, published_at, fetched_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (url, title, summary, classification, source, published_at, now))
        conn.commit()

# ── HTML cleaning ─────────────────────────────────────────────────────────────

def strip_html(text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# ── Claude / Gemini clients ───────────────────────────────────────────────────

_claude_client: anthropic.AsyncAnthropic | None = None


def get_claude() -> anthropic.AsyncAnthropic:
    global _claude_client
    if _claude_client is None:
        _claude_client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    return _claude_client


_gemini_client = None
_gemini_unavailable_reason: str = ""


def get_gemini():
    global _gemini_client, _gemini_unavailable_reason
    if _gemini_client is not None:
        return _gemini_client
    if not GEMINI_API_KEY:
        _gemini_unavailable_reason = "GEMINI_API_KEY env var is not set"
        return None
    try:
        from google import genai  # type: ignore
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        return _gemini_client
    except Exception as exc:
        _gemini_unavailable_reason = f"google-genai import failed: {exc}"
        logger.warning("Gemini unavailable: %s", _gemini_unavailable_reason)
        return None


async def gemini_web_search(query: str) -> str:
    client = get_gemini()
    if client is None:
        return f"web_search unavailable: {_gemini_unavailable_reason}"

    loop = asyncio.get_running_loop()

    def _call() -> str:
        try:
            from google.genai import types  # type: ignore
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=(
                    "You are researching for a Singapore retail real estate "
                    "intelligence team. Be specific, factual, recent. Prefer "
                    "Singapore-specific information. Question: " + query
                ),
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    temperature=0.3,
                ),
            )
            answer = (response.text or "").strip()
            citations: list[str] = []
            try:
                grounding = response.candidates[0].grounding_metadata  # type: ignore
                for chunk in (getattr(grounding, "grounding_chunks", None) or []):
                    web = getattr(chunk, "web", None)
                    if web and getattr(web, "uri", None):
                        title = getattr(web, "title", "") or ""
                        citations.append(f"{title} - {web.uri}".strip(" -"))
            except Exception:
                pass
            if citations:
                seen: set[str] = set()
                unique = [c for c in citations if not (c in seen or seen.add(c))]
                return answer + "\n\nSources:\n" + "\n".join(f"- {c}" for c in unique[:6])
            return answer or "Gemini returned no answer."
        except Exception as exc:
            logger.error("Gemini web_search error: %s", exc)
            return f"web_search failed: {exc}"

    return await loop.run_in_executor(None, _call)

# ── Article analysis (classifier) ─────────────────────────────────────────────

async def analyse_article(title: str, content: str, source: str) -> tuple[str, str]:
    preference_block = build_preference_block()
    preference_section = f"\n{preference_block}\n" if preference_block else ""

    prompt = f"""You are an analyst for a Singapore retail real estate intelligence service.
{preference_section}
Source: {source}
Title: {title}
Article content (may be truncated):
{content[:3000]}

Your tasks:
1. Write a concise 2–3 sentence summary for a professional audience. Be specific and factual.
   If the article matches a team preference, include slightly more detail on that aspect.
2. Classify the article using these criteria:

{URGENT_CRITERIA}

Respond with ONLY a valid JSON object — no markdown fences, no commentary:
{{"summary": "<your 2–3 sentence summary, or empty string if SKIP>", "classification": "<urgent|digest|skip>"}}"""

    raw = ""
    try:
        response = await get_claude().messages.create(
            model=CLASSIFIER_MODEL,
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()
        if "```" in raw:
            parts = raw.split("```")
            raw = parts[1] if len(parts) > 1 else parts[0]
            if raw.lower().startswith("json"):
                raw = raw[4:]
        data = json.loads(raw.strip())
        summary = str(data.get("summary", "")).strip() or "Summary unavailable."
        classification = str(data.get("classification", "digest")).lower().strip()
        if classification not in ("urgent", "digest", "skip"):
            classification = "digest"
        return summary, classification
    except json.JSONDecodeError:
        logger.warning("JSON parse failed for '%s'. Raw: %r", title[:60], raw[:200])
        return (content[:280].strip() or "Summary unavailable."), "digest"
    except Exception as exc:
        logger.error("Claude API error for '%s': %s", title[:60], exc)
        return (content[:280].strip() or "Summary unavailable."), "digest"

# ── RSS fetch cycle ───────────────────────────────────────────────────────────

_fetch_lock = asyncio.Lock()
_last_fetch_completed_at: datetime | None = None


async def job_fetch_feeds() -> None:
    if _fetch_lock.locked():
        logger.info("⏸ Fetch cycle already running — skipping this trigger")
        return
    async with _fetch_lock:
        await _do_fetch_feeds()


async def _do_fetch_feeds() -> None:
    global _last_fetch_completed_at
    logger.info("▶ RSS fetch cycle starting")
    now = datetime.now(SGT)
    loop = asyncio.get_running_loop()
    total_new = 0

    for source_name, feed_url in RSS_FEEDS.items():
        try:
            feed = await loop.run_in_executor(None, feedparser.parse, feed_url)
        except Exception as exc:
            logger.error("  Could not fetch %s: %s", source_name, exc)
            continue

        status = getattr(feed, "status", 200)
        if status not in (200, 301, 302):
            logger.warning("  HTTP %s from %s — skipping", status, source_name)
            continue

        for entry in feed.get("entries", [])[:20]:
            url: str = entry.get("link", "").strip()
            if not url or article_exists(url):
                continue

            title: str = entry.get("title", "Untitled").strip()
            published: str = entry.get("published", now.isoformat())
            content_candidates = [c.get("value", "") for c in (entry.get("content") or [])]
            content_candidates += [entry.get("summary", ""), entry.get("description", "")]
            content = strip_html(" ".join(filter(None, content_candidates)))

            summary, classification = await analyse_article(title, content, source_name)

            if classification == "skip":
                insert_article(url, title, "Not relevant.", "digest", source_name, published)
                with sqlite3.connect(DB_PATH) as conn:
                    conn.execute(
                        "UPDATE articles SET digest_sent = 1, urgent_sent = 1 WHERE url = ?", (url,)
                    )
                    conn.commit()
                await asyncio.sleep(2)
                continue

            insert_article(url, title, summary, classification, source_name, published)
            total_new += 1
            await asyncio.sleep(2)  # throttle Claude calls

    logger.info("▶ RSS cycle complete — %d new articles processed", total_new)
    _last_fetch_completed_at = datetime.now(SGT)

# ── Agent (action-first analyst, ported from the bot) ─────────────────────────

AGENT_TOOLS = [
    {
        "name": "add_preference",
        "description": "Save a new content preference for the team (e.g. 'more F&B news', 'focus on Singapore REITs').",
        "input_schema": {
            "type": "object",
            "properties": {"preference": {"type": "string", "description": "The preference text, written as a clear instruction."}},
            "required": ["preference"],
        },
    },
    {
        "name": "show_preferences",
        "description": "Return the team's current saved preferences.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "clear_preferences",
        "description": "Delete all saved preferences and reset to default behaviour.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "fetch_feeds_now",
        "description": "Immediately fetch the latest articles from all RSS feeds. EXPENSIVE (~minutes). Only when the user explicitly asks to refresh the feeds.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "web_search",
        "description": (
            "LIVE WEB SEARCH via Google. Use this to answer questions when the local "
            "article DB has no/few relevant results. Powered by Gemini + Google Search "
            "grounding with citations. Use for: 'what F&B places opened recently?', "
            "'is [brand] closing?', 'who took over the X retail space?', anything not in "
            "the RSS feed or the platform dataset. Always cite the sources it returns."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "A specific natural-language search query."}},
            "required": ["query"],
        },
    },
    {
        "name": "search_articles",
        "description": (
            "Search the local news article database by keyword(s) across titles and summaries. "
            "Use this to answer ANY news question. Expand the query semantically: 'F&B' covers "
            "restaurants, cafes, hawker, bakery, dining; 'mall' covers retail centre, shopping "
            "centre, tenant; 'REIT' covers acquisitions, trusts, fund. Always try search_articles "
            "BEFORE saying you don't know."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Space-separated keywords, OR-matched against title and summary."},
                "limit": {"type": "integer", "description": "Max results (default 8)."},
            },
            "required": ["query"],
        },
    },
]

AGENT_SYSTEM_PROMPT = (
    "You are the AI analyst built into Retail Pulse, a Singapore retail real estate "
    "intelligence platform used by a professional leasing team at JLL.\n\n"
    "=== CORE BEHAVIOUR: ACTION-FIRST ===\n"
    "- Prefer doing over asking. Never say 'want me to search?' - just search.\n"
    "- Prefer 3 partially-relevant articles over 0 perfectly-relevant ones.\n"
    "- Only ask a clarifying question if the request is genuinely ambiguous.\n"
    "- Treat semantic neighbours as valid (F&B = restaurants/cafes/hawker/dining; "
    "mall = retail centre/tenant mix/leasing; REIT = trust/fund/acquisition).\n\n"
    "=== INFORMATION SOURCES (in order of preference) ===\n"
    "1. PLATFORM DATA below - rents, vacancy, clusters, unit availability "
    "(Space Finder), deal pipeline, expiries. Answer directly from it; no tool needed.\n"
    "2. search_articles - the team's live 12-source news database. For any news question.\n"
    "3. web_search - live Google search with citations, when the DB and platform data "
    "don't have the answer.\n"
    "4. fetch_feeds_now - EXPENSIVE, only when the user explicitly asks to refresh.\n\n"
    "Standard workflow for 'what's the latest on X':\n"
    "1. search_articles with semantically-expanded keywords; try ONE broader query if 0 hits.\n"
    "2. If still weak AND it's about current events/openings/closures/brands, web_search.\n"
    "3. Compose ONE unified answer synthesising sources; name them ('per The Straits Times').\n"
    "4. If nothing found anywhere, say so in one sentence.\n\n"
    "=== TIME FRAMING ===\n"
    "- Singapore retail news moves in weeks/months, not hours. NEVER invent windows "
    "like 'last 24h'. Each search result has a real date - use it when relevant.\n"
    "- The database is your news universe; platform data is a snapshot dated 11 Jun 2026.\n\n"
    "=== RESPONSE DISCIPLINE (strict) ===\n"
    "- Answer the question asked. Nothing more.\n"
    "- Do NOT recite preferences or settings unless asked.\n"
    "- Do NOT offer 'want me to...' follow-ups - just do the thing.\n"
    "- Default to fewer words. A 2-sentence answer beats a 5-paragraph one.\n"
    "- PLAIN TEXT ONLY: no markdown headers, no asterisks, no tables. "
    "Short dash/bullet lists are fine. Use S$ psf/mo for rents.\n"
    "- Banned filler: 'would you like me to', 'feel free to', 'let me know if', "
    "'going forward', 'you could add a preference'. Deliver the answer and stop.\n\n"
    "=== TONE ===\n"
    "Friendly, concise, professional. Understands Singlish, typos, casual phrasing. "
    "This is a busy professional tool - respect the user's time.\n\n"
    "=== BACKGROUND CONTEXT (reference only - do not recite) ===\n"
    "Team preferences:\n{preferences}\n\n"
    "Recent articles in database (last 10):\n{recent_articles}\n\n"
    "=== PLATFORM DATA (snapshot, 11 Jun 2026) ===\n{market_context}"
)

MAX_TURNS = 24          # cap client-supplied history
MAX_MSG_CHARS = 4000    # cap individual message length


async def run_agent(history: list[dict], market_context: str) -> str:
    prefs = get_all_preferences()
    pref_summary = "\n".join(f"- {p['value']}" for p in prefs) if prefs else "None saved yet."

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        recent = conn.execute(
            "SELECT title, source, classification FROM articles "
            "WHERE summary != 'Not relevant.' ORDER BY fetched_at DESC LIMIT 10"
        ).fetchall()
    recent_summary = (
        "\n".join(f"- [{r['classification'].upper()}] {r['title']} ({r['source']})" for r in recent)
        if recent else "No articles collected yet."
    )

    system = AGENT_SYSTEM_PROMPT.format(
        preferences=pref_summary,
        recent_articles=recent_summary,
        market_context=(market_context or "Not provided this session.")[:30000],
    )

    messages: list[dict] = [
        {"role": t["role"], "content": str(t["text"])[:MAX_MSG_CHARS]}
        for t in history[-MAX_TURNS:]
        if t.get("role") in ("user", "assistant") and str(t.get("text", "")).strip()
    ]
    if not messages or messages[-1]["role"] != "user":
        raise HTTPException(status_code=400, detail="History must end with a user message.")

    client = get_claude()
    reply_text = ""

    for _ in range(8):
        response = await client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1200,
            system=system,
            tools=AGENT_TOOLS,
            messages=messages,
        )

        reply_text = " ".join(
            block.text for block in response.content if hasattr(block, "text")
        ).strip()

        if response.stop_reason != "tool_use":
            return reply_text or "Done."

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            name, tool_input = block.name, block.input
            logger.info("Agent tool call: %s(%s)", name, str(tool_input)[:120])

            if name == "add_preference":
                pref = (tool_input.get("preference") or "").strip()
                if pref:
                    add_preference("text", pref, "website")
                    result = f"Preference saved: {pref}"
                else:
                    result = "No preference text provided."

            elif name == "show_preferences":
                prefs_now = get_all_preferences()
                result = ("\n".join(f"- [{p['kind']}] {p['value']}" for p in prefs_now)
                          if prefs_now else "No preferences saved.")

            elif name == "clear_preferences":
                clear_preferences()
                result = "All preferences cleared."

            elif name == "fetch_feeds_now":
                if _fetch_lock.locked():
                    result = "A fetch cycle is already running — using existing DB."
                elif _last_fetch_completed_at and (
                    datetime.now(SGT) - _last_fetch_completed_at
                ).total_seconds() < 600:
                    mins = int((datetime.now(SGT) - _last_fetch_completed_at).total_seconds() / 60)
                    result = f"Skipped fetch — last cycle completed {mins} min ago. DB is current."
                else:
                    await job_fetch_feeds()
                    result = "RSS fetch complete."

            elif name == "web_search":
                query = (tool_input.get("query") or "").strip()
                result = await gemini_web_search(query) if query else "No query provided."

            elif name == "search_articles":
                query = (tool_input.get("query") or "").strip()
                limit = max(1, min(int(tool_input.get("limit") or 8), 20))
                keywords = [k for k in re.split(r"\s+", query) if k]
                if not keywords:
                    result = "No query provided."
                else:
                    clauses = " OR ".join(["(LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)"] * len(keywords))
                    params: list = []
                    for kw in keywords:
                        like = f"%{kw.lower()}%"
                        params.extend([like, like])
                    with sqlite3.connect(DB_PATH) as conn:
                        conn.row_factory = sqlite3.Row
                        rows = conn.execute(
                            f"""SELECT title, source, summary, classification, url, fetched_at
                                FROM articles
                                WHERE summary != 'Not relevant.' AND ({clauses})
                                ORDER BY fetched_at DESC LIMIT ?""",
                            (*params, limit),
                        ).fetchall()
                    if not rows:
                        result = f"No matches for: {query}"
                    else:
                        lines = []
                        for r in rows:
                            summary = (r["summary"] or "").strip()
                            if len(summary) > 220:
                                summary = summary[:217] + "..."
                            lines.append(
                                f"[{(r['classification'] or 'digest').upper()}] {r['title']} "
                                f"({r['source']}, {r['fetched_at'][:10]})\n  {summary}\n  URL: {r['url']}"
                            )
                        result = f"Found {len(rows)} match(es) for '{query}':\n\n" + "\n\n".join(lines)
            else:
                result = f"Unknown tool: {name}"

            tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})

    return reply_text or "Done."

# ── FastAPI app ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    scheduler = AsyncIOScheduler(timezone=SGT)
    scheduler.add_job(
        job_fetch_feeds, trigger="interval", minutes=30,
        id="rss_fetch", next_run_time=datetime.now(SGT), misfire_grace_time=120,
    )
    scheduler.start()
    logger.info("Scheduler running. API is live.")
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="Retail Pulse Intelligence API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["content-type", "x-access-code"],
)


class ChatTurn(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    messages: list[ChatTurn]
    market_context: str = ""


@app.get("/health")
async def health():
    with sqlite3.connect(DB_PATH) as conn:
        count = conn.execute(
            "SELECT COUNT(*) FROM articles WHERE summary != 'Not relevant.'"
        ).fetchone()[0]
    return {
        "ok": True,
        "articles": count,
        "last_fetch": _last_fetch_completed_at.isoformat() if _last_fetch_completed_at else None,
        "web_search": bool(GEMINI_API_KEY),
        "chat_locked": bool(ACCESS_CODE),
    }


@app.get("/feed")
async def feed(limit: int = 40):
    limit = max(1, min(limit, 100))
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """SELECT url, title, summary, classification, source, published_at, fetched_at
               FROM articles WHERE summary != 'Not relevant.'
               ORDER BY fetched_at DESC LIMIT ?""",
            (limit,),
        ).fetchall()
    return {"articles": [dict(r) for r in rows]}


@app.post("/chat")
async def chat(req: ChatRequest, request: Request):
    if ACCESS_CODE:
        supplied = request.headers.get("x-access-code", "")
        if supplied != ACCESS_CODE:
            raise HTTPException(status_code=401, detail="Invalid or missing access code.")
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages is required.")
    reply = await run_agent([t.model_dump() for t in req.messages], req.market_context)
    return {"reply": reply}
