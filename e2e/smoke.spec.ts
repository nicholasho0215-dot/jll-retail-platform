import { expect, test } from "@playwright/test";

// Full-browser smoke pass: every view renders, including the Leaflet heatmap
// that the jsdom unit suite cannot cover, plus one round-trip through the
// Assistant's built-in rule engine.

test("dashboard loads with KPIs and charts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /market pulse/i })).toBeVisible();
  await expect(page.getByText("New Supply Pipeline")).toBeVisible();
});

test("every view renders from the sidebar", async ({ page }) => {
  await page.goto("/");
  const views: [string, RegExp][] = [
    ["Retail Heatmap", /retail heatmap/i],
    ["Space Finder", /space finder/i],
    ["Open / Close", /open \/ close tracker/i],
    ["News Desk", /news desk/i],
    ["Deal Pipeline", /deal pipeline/i],
    ["Assistant", /market assistant/i],
  ];
  for (const [navLabel, title] of views) {
    await page.getByRole("button", { name: navLabel }).click();
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  }
});

test("heatmap renders Leaflet cluster markers", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Retail Heatmap" }).click();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".leaflet-interactive").first()).toBeVisible();
});

test("assistant answers a rent question from the local rule engine", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Assistant" }).click();
  const input = page.getByPlaceholder(/ask about rents/i);
  await input.fill("What are rents in Orchard?");
  await input.press("Enter");
  await expect(page.getByText(/S\$23\.2 psf\/mo/)).toBeVisible({ timeout: 15_000 });
});
