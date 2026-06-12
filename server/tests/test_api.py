import asyncio

import pytest
from fastapi import HTTPException

import main


# ── Pure helpers ──────────────────────────────────────────────────────────────

def test_strip_html_removes_tags_and_entities():
    raw = "<p>Mall &amp; tenants</p>  <script>x</script> opening&nbsp;soon"
    assert main.strip_html(raw) == "Mall & tenants x opening soon"


def test_strip_html_collapses_whitespace():
    assert main.strip_html("a \n\t b") == "a b"


# ── Database layer ────────────────────────────────────────────────────────────

def test_insert_and_exists():
    assert not main.article_exists("https://x/1")
    main.insert_article("https://x/1", "Title", "Summary", "digest", "Src", "2026-06-01")
    assert main.article_exists("https://x/1")


def test_insert_ignores_duplicate_urls():
    main.insert_article("https://x/1", "First", "S1", "digest", "Src", "2026-06-01")
    main.insert_article("https://x/1", "Second", "S2", "urgent", "Src", "2026-06-02")
    import sqlite3

    with sqlite3.connect(main.DB_PATH) as conn:
        rows = conn.execute("SELECT title FROM articles WHERE url = ?", ("https://x/1",)).fetchall()
    assert rows == [("First",)]


def test_preferences_roundtrip():
    main.add_preference("text", "more F&B news", "tester")
    prefs = main.get_all_preferences()
    assert len(prefs) == 1
    assert prefs[0]["value"] == "more F&B news"

    block = main.build_preference_block()
    assert "more F&B news" in block

    main.clear_preferences()
    assert main.get_all_preferences() == []
    assert main.build_preference_block() == ""


# ── Endpoints ─────────────────────────────────────────────────────────────────

def test_health(client):
    main.insert_article("https://x/1", "T", "S", "digest", "Src", "2026-06-01")
    main.insert_article("https://x/2", "T2", "Not relevant.", "digest", "Src", "2026-06-01")
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is True
    assert body["articles"] == 1  # skipped articles are excluded
    assert body["chat_locked"] is True


def test_feed_returns_articles_newest_first_and_hides_skipped(client):
    main.insert_article("https://x/old", "Old", "S", "digest", "Src", "2026-06-01")
    main.insert_article("https://x/skip", "Skip", "Not relevant.", "digest", "Src", "2026-06-01")
    main.insert_article("https://x/new", "New", "S", "urgent", "Src", "2026-06-02")
    res = client.get("/feed")
    assert res.status_code == 200
    urls = [a["url"] for a in res.json()["articles"]]
    assert "https://x/skip" not in urls
    assert set(urls) == {"https://x/old", "https://x/new"}


def test_feed_clamps_limit(client):
    for i in range(3):
        main.insert_article(f"https://x/{i}", f"T{i}", "S", "digest", "Src", "2026-06-01")
    assert len(client.get("/feed", params={"limit": 0}).json()["articles"]) == 1
    assert len(client.get("/feed", params={"limit": 1000}).json()["articles"]) == 3


def test_chat_requires_access_code(client):
    res = client.post("/chat", json={"messages": [{"role": "user", "text": "hi"}]})
    assert res.status_code == 401
    res = client.post(
        "/chat",
        json={"messages": [{"role": "user", "text": "hi"}]},
        headers={"x-access-code": "wrong"},
    )
    assert res.status_code == 401


def test_chat_rejects_empty_messages(client):
    res = client.post("/chat", json={"messages": []}, headers={"x-access-code": "test-code"})
    assert res.status_code == 400


def test_chat_returns_agent_reply(client, monkeypatch):
    async def fake_agent(history, market_context):
        assert history[-1]["text"] == "rents in orchard?"
        assert market_context == "CTX"
        return "S$23.20 psf/mo."

    monkeypatch.setattr(main, "run_agent", fake_agent)
    res = client.post(
        "/chat",
        json={"messages": [{"role": "user", "text": "rents in orchard?"}], "market_context": "CTX"},
        headers={"x-access-code": "test-code"},
    )
    assert res.status_code == 200
    assert res.json()["reply"] == "S$23.20 psf/mo."


# ── Agent input validation ────────────────────────────────────────────────────

def test_run_agent_rejects_history_not_ending_with_user():
    with pytest.raises(HTTPException) as exc:
        asyncio.run(main.run_agent([{"role": "assistant", "text": "hello"}], ""))
    assert exc.value.status_code == 400


def test_run_agent_rejects_blank_history():
    with pytest.raises(HTTPException) as exc:
        asyncio.run(main.run_agent([{"role": "user", "text": "   "}], ""))
    assert exc.value.status_code == 400
