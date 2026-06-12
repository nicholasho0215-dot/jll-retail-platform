import { describe, expect, it } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { buildMarketContext, SYSTEM_PROMPT } from "@/lib/marketContext";
import { clusters, mallSpaces, supplyPipeline } from "@/data/marketData";

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
const JUDGE_MODEL = "claude-haiku-4-5";

const TIMEOUT = 180_000;

const client = () => new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
const marketContext = buildMarketContext();

interface Verdict {
  score: number; // 1 (ungrounded) … 5 (fully grounded)
  hallucination: boolean;
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

REFERENCE FACTS (the relevant slice of the assistant's dataset):
${reference}

Evaluate whether the answer is grounded:
- Where the answer overlaps the reference, numbers and named entities must match (rounding/reformatting is fine).
- The assistant has access to a broader dataset than this slice, so extra detail on the same entities is NOT a hallucination by itself.
- hallucination = true ONLY if the answer CONTRADICTS the reference, or asserts specifics about something the reference explicitly states is not in the dataset.

Respond with ONLY a JSON object, no markdown fences:
{"score": <1-5>, "hallucination": <true|false>, "notes": "<one sentence>"}`,
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
    score: Number(data.score),
    hallucination: Boolean(data.hallucination),
    notes: String(data.notes ?? ""),
  };
}

async function expectGrounded(question: string, answer: string, reference: string) {
  const verdict = await judge(question, answer, reference);
  console.log(`Q: ${question}\nA: ${answer}\nJudge: ${JSON.stringify(verdict)}\n`);
  expect(verdict.hallucination, `hallucination flagged: ${verdict.notes}`).toBe(false);
  expect(verdict.score, `low grounding score: ${verdict.notes}`).toBeGreaterThanOrEqual(3);
}

// Reference blocks are built from the live dataset, so probes stay correct
// when the data snapshot is refreshed.
const orchard = clusters.find((c) => c.id === "orchard")!;
const biggestUnits = mallSpaces
  .flatMap((m) => m.units.map((u) => ({ mall: m.mall, ...u })))
  .sort((a, b) => b.sqft - a.sqft)
  .slice(0, 5);

describe.skipIf(!enabled)("assistant grounding (simulated, same prompt as the site)", () => {
  it("answers Orchard rent and vacancy from platform data", { timeout: TIMEOUT }, async () => {
    const q = "What are prime rents and vacancy in Orchard Road right now?";
    const reference = `Orchard Road: prime rent S$${orchard.rentPsf} psf/mo (+${orchard.rentChangeYoY}% y-o-y), vacancy ${orchard.vacancy}%. ${orchard.note}`;
    await expectGrounded(q, await askAssistant(q), reference);
  });

  it("answers the 2026 supply pipeline from platform data", { timeout: TIMEOUT }, async () => {
    const q = "How much new retail supply is opening in 2026 and where?";
    const reference = supplyPipeline
      .map((p) => `${p.project} (${p.zone}): ${p.nla !== null ? `${p.nla}k sqft` : "NLA TBC"}, opening ${p.opening}`)
      .join("\n");
    await expectGrounded(q, await askAssistant(q), reference);
  });

  it("answers large available floorplates from platform data", { timeout: TIMEOUT }, async () => {
    const q = "Which malls have the biggest spaces available right now?";
    const reference = biggestUnits
      .map(
        (u) =>
          `${u.mall} ${u.unit}: ${u.sqft} sqft, S$${u.askPsf} psf, status ${u.status}, available from ${u.availableFrom}` +
          `${u.currentTenant ? `, current tenant ${u.currentTenant}` : ""}. Suits: ${u.suitedFor.join(", ")}`,
      )
      .join("\n");
    await expectGrounded(q, await askAssistant(q), reference);
  });

  it("does not invent data it doesn't have", { timeout: TIMEOUT }, async () => {
    const q = "What's the exact asking rent for unit #03-12 at Wisma Atria?";
    const reference =
      "The dataset has NO unit-level data for Wisma Atria. A grounded answer acknowledges this " +
      "(it may offer nearby Orchard data that IS in the reference: " +
      `prime rent S$${orchard.rentPsf} psf/mo, vacancy ${orchard.vacancy}%).`;
    await expectGrounded(q, await askAssistant(q), reference);
  });
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
      "Every item should plausibly relate to Singapore retail, retail property, REITs, F&B/brands in Singapore, or Singapore consumer/macro data. Coherent 2-3 sentence professional summaries. hallucination=true only if items are clearly off-topic spam or gibberish.",
    );
    console.log(`Feed verdict: ${JSON.stringify(verdict)}`);
    expect(verdict.hallucination).toBe(false);
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
    const reference = `Orchard Road: prime rent S$${orchard.rentPsf} psf/mo, vacancy ${orchard.vacancy}%.`;
    await expectGrounded("Orchard rents and vacancy?", String(reply), reference);
  });
});
