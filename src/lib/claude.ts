import Anthropic from "@anthropic-ai/sdk";
import { buildMarketContext, SYSTEM_PROMPT } from "@/lib/marketContext";

const KEY_STORAGE = "retail-pulse:anthropic-key";

export function getStoredKey(): string | null {
  try {
    return localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}

export function storeKey(key: string) {
  localStorage.setItem(KEY_STORAGE, key.trim());
}

export function clearKey() {
  localStorage.removeItem(KEY_STORAGE);
}

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

// Built once per page load; identical bytes across turns so the prompt cache
// (system block below) keeps hitting.
const marketContext = buildMarketContext();

/**
 * Ask Claude, streaming text deltas via onDelta. The key is user-supplied and
 * lives only in this browser (localStorage) — hence dangerouslyAllowBrowser.
 */
export async function askClaude(
  apiKey: string,
  history: ChatTurn[],
  onDelta: (text: string) => void
): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system: [
      {
        type: "text",
        text: `${SYSTEM_PROMPT}\n\n=== PLATFORM DATA ===\n${marketContext}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: history.map((t) => ({ role: t.role, content: t.text })),
  });

  stream.on("text", onDelta);

  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    return "I can't help with that request. Try asking about rents, vacancy, store movements, available units or the pipeline.";
  }
  return final.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return "That API key was rejected by Anthropic. Check it in settings (⚙) — it should start with sk-ant-.";
  }
  if (err instanceof Anthropic.RateLimitError) {
    return "Rate limit hit on your Anthropic account — wait a moment and try again.";
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return "Couldn't reach the Claude API (network/firewall). Falling back to the built-in engine for this answer.";
  }
  if (err instanceof Anthropic.APIError && err.status) {
    return `Claude API error (${err.status}). Falling back to the built-in engine for this answer.`;
  }
  return "Couldn't reach the Claude API (network). Falling back to the built-in engine for this answer.";
}
