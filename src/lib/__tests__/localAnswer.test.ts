import { describe, expect, it } from "vitest";
import { answerLocally } from "@/lib/localAnswer";
import { clusters, mallSpaces, deals, expiries } from "@/data/marketData";

describe("answerLocally — greetings and fallback", () => {
  it("greets on hello", () => {
    expect(answerLocally("hello")).toMatch(/ask me about rents/i);
  });

  it("acknowledges thanks", () => {
    expect(answerLocally("thanks!")).toMatch(/anytime/i);
  });

  it("returns help text for unrecognised questions", () => {
    expect(answerLocally("xyzzy plugh")).toMatch(/I can answer from the platform's data/);
  });
});

describe("answerLocally — cluster questions", () => {
  it("answers rent questions for a named cluster with its real figure", () => {
    const orchard = clusters.find((c) => c.id === "orchard")!;
    const answer = answerLocally("What are rents like in Orchard?");
    expect(answer).toContain(`S$${orchard.rentPsf} psf/mo`);
    expect(answer).toContain(orchard.name);
  });

  it("resolves cluster aliases (Jewel → Tampines)", () => {
    const tampines = clusters.find((c) => c.id === "tampines")!;
    const answer = answerLocally("vacancy around Jewel?");
    expect(answer).toContain(`${tampines.vacancy}%`);
  });

  it("compares two named clusters", () => {
    const answer = answerLocally("Compare Orchard vs Jurong East");
    expect(answer).toContain("Orchard Road");
    expect(answer).toMatch(/jurong/i);
    expect(answer).toContain("vs");
  });

  it("remembers the last cluster for follow-ups", () => {
    answerLocally("Tell me about Tampines");
    const followUp = answerLocally("what about rents there?");
    expect(followUp).toMatch(/tampines/i);
  });
});

describe("answerLocally — malls, brands and entities", () => {
  it("lists units for a named mall", () => {
    const mall = mallSpaces[0];
    const answer = answerLocally(`What's available at ${mall.mall}?`);
    expect(answer).toContain(mall.mall);
    expect(answer).toContain(mall.units[0].unit);
  });

  it("answers about a tenant in the deal pipeline", () => {
    const deal = deals.find((d) => !d.tenant.includes("(conf.)"))!;
    const answer = answerLocally(`Any update on ${deal.tenant}?`);
    expect(answer).toContain(deal.tenant);
    expect(answer).toContain(deal.stage);
  });

  it("answers about a tenant on the expiry radar", () => {
    const expiry = expiries[0];
    const answer = answerLocally(`When does ${expiry.tenant}'s lease end?`);
    expect(answer).toContain(expiry.tenant);
    expect(answer).toContain(expiry.mall);
  });
});

describe("answerLocally — macro intents", () => {
  it("answers island-wide vacancy", () => {
    expect(answerLocally("how is overall vacancy looking")).toMatch(/island-wide retail vacancy/i);
  });

  it("answers the supply pipeline", () => {
    expect(answerLocally("what new supply is coming?")).toMatch(/new supply/i);
  });

  it("answers lease expiries", () => {
    expect(answerLocally("any lease expiries coming up?")).toMatch(/expir/i);
  });

  it("combines two distinct intents in one answer", () => {
    const answer = answerLocally("how are rents and tourist arrivals?");
    expect(answer).toMatch(/prime floor rents/i);
    expect(answer).toMatch(/arrivals/i);
  });
});
