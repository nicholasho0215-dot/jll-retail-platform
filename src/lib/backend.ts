// Client for the Retail Pulse Intelligence API (server/ — deployed on Railway).
// When a server URL is configured, the Assistant uses the full server-side
// agent (news DB + live web search + platform data) and the News Desk shows
// the live classified feed.

import type { ChatTurn } from "@/lib/claude";

// Once the Railway service is deployed, bake its URL in here so every visitor
// gets the live experience without any setup.
export const DEFAULT_BACKEND_URL = "";

const URL_KEY = "retail-pulse:backend-url";
const CODE_KEY = "retail-pulse:access-code";

export function getBackendUrl(): string {
  try {
    return (localStorage.getItem(URL_KEY) || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

export function setBackendUrl(url: string) {
  if (url.trim()) localStorage.setItem(URL_KEY, url.trim());
  else localStorage.removeItem(URL_KEY);
}

export function getAccessCode(): string {
  try {
    return localStorage.getItem(CODE_KEY) || "";
  } catch {
    return "";
  }
}

export function setAccessCode(code: string) {
  if (code.trim()) localStorage.setItem(CODE_KEY, code.trim());
  else localStorage.removeItem(CODE_KEY);
}

export interface LiveArticle {
  url: string;
  title: string;
  summary: string;
  classification: "urgent" | "digest";
  source: string;
  published_at: string | null;
  fetched_at: string;
}

export async function fetchLiveFeed(): Promise<LiveArticle[] | null> {
  const base = getBackendUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/feed?limit=40`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.articles) ? data.articles : null;
  } catch {
    return null;
  }
}

export async function backendChat(history: ChatTurn[], marketContext: string): Promise<string> {
  const base = getBackendUrl();
  const headers: Record<string, string> = { "content-type": "application/json" };
  const code = getAccessCode();
  if (code) headers["x-access-code"] = code;

  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messages: history.map((t) => ({ role: t.role, text: t.text })),
      market_context: marketContext,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (res.status === 401) {
    throw new Error("ACCESS_CODE");
  }
  if (!res.ok) {
    throw new Error(`Server error ${res.status}`);
  }
  const data = await res.json();
  return String(data.reply ?? "");
}
