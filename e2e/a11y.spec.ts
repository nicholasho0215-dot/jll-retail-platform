import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Weekly accessibility audit (quality.yml). Gated behind A11Y=1 so the
// regular CI e2e job skips it — findings should inform, not block, pushes.
// Critical violations fail the audit run; everything else is logged.

test.skip(!process.env.A11Y, "Set A11Y=1 to run the accessibility audit");

const views: [string | null, string][] = [
  [null, "dashboard"],
  ["Retail Heatmap", "heatmap"],
  ["Space Finder", "spaces"],
  ["Open / Close", "tracker"],
  ["News Desk", "news"],
  ["Deal Pipeline", "pipeline"],
  ["Assistant", "assistant"],
];

for (const [navLabel, name] of views) {
  test(`a11y scan: ${name}`, async ({ page }) => {
    await page.goto("/");
    if (navLabel) {
      await page.getByRole("button", { name: navLabel }).click();
      await page.waitForTimeout(800); // let the view transition settle
    }

    const results = await new AxeBuilder({ page }).analyze();

    for (const v of results.violations) {
      console.log(
        `[${v.impact ?? "unknown"}] ${v.id}: ${v.help} — ${v.nodes.length} node(s)\n  ${v.helpUrl}`,
      );
    }

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}
