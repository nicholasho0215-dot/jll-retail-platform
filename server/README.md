# Retail Pulse Intelligence API

The server-side brain of the Retail Pulse website — ported from the team's
Telegram retail-bot. Polls 12 Singapore retail/property RSS feeds every 30
minutes, has Claude summarise and classify each article, and exposes:

| Endpoint | What |
|---|---|
| `GET /health` | status, article count, last fetch time |
| `GET /feed?limit=40` | latest classified articles for the News Desk |
| `POST /chat` | the action-first AI analyst (news search, live Google search, platform data) |

## Deploy on Railway (replaces the old retail-bot service)

1. Railway → **New Project → Deploy from GitHub repo** → pick `jll-retail-platform`
2. In the service settings set **Root Directory** to `server`
3. Add **Variables**:
   - `ANTHROPIC_API_KEY` — required (reuse the one from retail-bot)
   - `GEMINI_API_KEY` — optional; enables live Google web search (reuse from retail-bot)
   - `ACCESS_CODE` — optional; a simple passphrase that gates `/chat` so strangers
     can't spend your Anthropic credit. Team members type it once on the website.
   - `DB_PATH` — optional; set to `/data/articles.db` and attach a Volume mounted
     at `/data` so the article archive survives redeploys
4. Railway auto-detects the Procfile. Deploy, then copy the public URL
   (e.g. `https://retail-pulse-api-production.up.railway.app`).
5. Paste that URL into the website: Assistant tab → ⚙ settings → "Intelligence
   server URL" (and the access code if you set one). Or tell Claude the URL and
   it will bake it into the site as the default for everyone.

## After it's live

- The old `retail-bot` Railway service can be deleted, and the Telegram bot
  token revoked via @BotFather.
- The News Desk switches to the live feed automatically; the Assistant becomes
  the full agent for every visitor (gated by `ACCESS_CODE` if set).

## Local dev

```sh
cd server
pip install -r requirements.txt
ANTHROPIC_API_KEY=sk-ant-... uvicorn main:app --reload
```
