import { describe, expect, it } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { buildMarketContext, SYSTEM_PROMPT } from "@/lib/marketContext";

// Weekly AI-output quality audit (ai-quality.yml). Gated behind AI_QUALITY=1
// (plus an API key) so `npm test` never makes paid API calls.
//
// Two layers:
//  1. Assistant simulation — asks Claude the same way the site does (same
//     system prompt, market context and model), then a second independent
//     Claude call judges each answer strictly against the platform dataset.
//  2. Live server probes — when BACKEND_URL is set, checks /health, judges
//     recent /feed summaries for relevance, and probes /chat the same way.

const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const BACKEND_URL = (process.env.BACKEND_URL ?? "").replace(/\/+$/, "");
const ACCESS_CODE = process.env.ACCESS_CODE ?? "";
const enabled = !!process.env.AI_QUALITY && !!API_KEY;

const ASSISTANT_MODEL = "claude-opus-4-8"; // matches src/lib/claude.ts
const JUDGE_MODEL = "claude-sonnet-4-6";

const TIMEOUT = 180_000;

const client = () => new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
const marketContext = buildMarketContext();

interface Verdict {
  contradictions: string[]; // empty = grounded
  score: number; // 1 (ungrounded) … 5 (fully grounded)
  notes: string;
}

async function askAssistant(question: string): Promise<string> {
  const res = await client().messages.create({
    model: ASSISTANT_MODEL,
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n\n=== PLATFORM DATA ===\n${marketContext}`,
    messages: [{ role: "user", content: question }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join(" ")
    .trim();
}

async function judge(question: string, answer: string, reference: string): Promise<Verdict> {
  const res = await client().messages.create({
    model: JUDGE_MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a strict QA judge for a Singapore retail real-estate assistant.

QUESTION asked by a user:
${question}

ANSWER given by the assistant:
${answer}

REFERENCE (ground truth / evaluation criteria):
${reference}

List every claim in the answer that CONTRADICTS the reference or asserts a specific figure/date/event that cannot be found in it. Rules:
- Equivalent formatting is NOT a contradiction: unit "#07-01, level L7" may be cited as "L7"; "2026-08-01" as "1 Aug 2026"; figures may be rounded or restated.
- Paraphrase and reasonable inference over reference facts are NOT contradictions.
- If the reference has no data on something, a grounded answer says so (it may still offer related facts that ARE in the reference).
- Only include clear, specific, verifiable contradictions. If everything checks out, the list is empty.

Respond with ONLY a JSON object, no markdown fences:
{"contradictions": ["<each clear contradiction, quoted from the answer>"], "score": <1-5 overall grounding quality>, "notes": "<one sentence>"}`,
      },
    ],
  });
  let raw = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join(" ")
    .trim();
  if (raw.includes("```")) raw = raw.split("```").filter((s) => s.trim())[0].replace(/^json/i, "");
  const data = JSON.parse(raw.trim());
  return {
    contradictions: Array.isArray(data.contradictions) ? data.contradictions.map(String) : [],
    score: Number(data.score),
    notes: String(data.notes ?? ""),
  };
}

async function expectGrounded(question: string, answer: string, reference: string) {
  const verdict = await judge(question, answer, reference);
  console.log(`Q: ${question}\nA: ${answer}\nJudge: ${JSON.stringify(verdict)}\n`);
  expect(verdict.contradictions, `contradictions found: ${verdict.notes}`).toEqual([]);
  expect(verdict.score, `low grounding score: ${verdict.notes}`).toBeGreaterThanOrEqual(3);
}

// The judge receives the complete platform dataset as ground truth — the
// same context the assistant answers from — so anything genuinely in the
// data is never falsely flagged.
describe.skipIf(!enabled)("assistant grounding (simulated, same prompt as the site)", () => {
  const probes = [
    "What are prime rents and vacancy in Orchard Road right now?",
    "How much new retail supply is opening in 2026 and where?",
    "Which malls have the biggest spaces available right now?",
    // Hallucination bait: Wisma Atria has no unit-level data in the dataset.
    "What's the exact asking rent for unit #03-12 at Wisma Atria?",
  ];

  for (const q of probes) {
    it(`grounded: ${q}`, { timeout: TIMEOUT }, async () => {
      await expectGrounded(q, await askAssistant(q), marketContext);
    });
  }
});

describe.skipIf(!enabled || !BACKEND_URL)("live intelligence server", () => {
  it("/health is ok", { timeout: 30_000 }, async () => {
    const res = await fetch(`${BACKEND_URL}/health`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("recent /feed summaries are relevant to Singapore retail", { timeout: TIMEOUT }, async () => {
    const res = await fetch(`${BACKEND_URL}/feed?limit=5`);
    expect(res.ok).toBe(true);
    const { articles } = await res.json();
    if (!articles.length) {
      console.log("Feed empty — skipping relevance judgement.");
      return;
    }
    const batch = articles
      .map((a: { title: string; summary: string }, i: number) => `${i + 1}. ${a.title} — ${a.summary}`)
      .join("\n");
    const verdict = await judge(
      "Are these classified news summaries relevant to Singapore retail / retail real estate, and are the summaries coherent?",
      batch,
      "Every item should plausibly relate to Singapore retail, retail property, REITs, F&B/brands in Singapore, or Singapore consumer/macro data. Coherent 2-3 sentence professional summaries. List an item as a contradiction only if it is clearly off-topic spam or gibberish.",
    );
    console.log(`Feed verdict: ${JSON.stringify(verdict)}`);
    expect(verdict.contradictions).toEqual([]);
    expect(verdict.score).toBeGreaterThanOrEqual(3);
  });

  it("live /chat answers a rent question grounded in platform data", { timeout: TIMEOUT }, async () => {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (ACCESS_CODE) headers["x-access-code"] = ACCESS_CODE;
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [{ role: "user", text: "What are prime rents and vacancy in Orchard right now?" }],
        market_context: marketContext,
      }),
    });
    expect(res.ok, `server returned ${res.status}`).toBe(true);
    const { reply } = await res.json();
    await expectGrounded("Orchard rents and vacancy?", String(reply), marketContext);
  });
});
