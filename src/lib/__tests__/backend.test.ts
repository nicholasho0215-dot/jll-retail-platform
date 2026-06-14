import { afterEach, describe, expect, it, vi } from "vitest";
import {
  backendChat,
  fetchLiveFeed,
  getAccessCode,
  getBackendUrl,
  setAccessCode,
  setBackendUrl,
} from "@/lib/backend";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("backend settings storage", () => {
  it("persists and strips trailing slashes from the backend URL", () => {
    setBackendUrl("https://api.example.com///");
    expect(getBackendUrl()).toBe("https://api.example.com");
  });

  it("clears the URL when set to blank", () => {
    setBackendUrl("https://api.example.com");
    setBackendUrl("   ");
    expect(getBackendUrl()).toBe("");
  });

  it("persists and clears the access code", () => {
    setAccessCode("secret");
    expect(getAccessCode()).toBe("secret");
    setAccessCode("");
    expect(getAccessCode()).toBe("");
  });
});

describe("fetchLiveFeed", () => {
  it("returns null without a configured backend (no network call)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await fetchLiveFeed()).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns the articles array on success", async () => {
    setBackendUrl("https://api.example.com");
    const articles = [{ url: "u", title: "t", summary: "s", classification: "digest", source: "x", published_at: null, fetched_at: "now" }];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ articles }), { status: 200 })),
    );
    expect(await fetchLiveFeed()).toEqual(articles);
  });

  it("returns null on a server error instead of throwing", async () => {
    setBackendUrl("https://api.example.com");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    expect(await fetchLiveFeed()).toBeNull();
  });
});

describe("backendChat", () => {
  it("sends history, market context and the access-code header", async () => {
    setBackendUrl("https://api.example.com");
    setAccessCode("team-code");
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ reply: "hi" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    const reply = await backendChat([{ role: "user", text: "rents in orchard?" }], "CONTEXT");
    expect(reply).toBe("hi");

    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.com/chat");
    expect((init.headers as Record<string, string>)["x-access-code"]).toBe("team-code");
    const body = JSON.parse(String(init.body));
    expect(body.messages).toEqual([{ role: "user", text: "rents in orchard?" }]);
    expect(body.market_context).toBe("CONTEXT");
  });

  it("throws ACCESS_CODE on 401 so the UI can prompt for a code", async () => {
    setBackendUrl("https://api.example.com");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 401 })));
    await expect(backendChat([{ role: "user", text: "hi" }], "")).rejects.toThrow("ACCESS_CODE");
  });

  it("throws on other server errors", async () => {
    setBackendUrl("https://api.example.com");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 503 })));
    await expect(backendChat([{ role: "user", text: "hi" }], "")).rejects.toThrow("Server error 503");
  });
});
