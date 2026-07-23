import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const mockPublicApis = async (page: Page) => {
  await page.route("**/api/clubs", async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route("**/api/derbynames**", async (route) => {
    await route.fulfill({ json: [] });
  });
};

test.describe("Page d'accueil publique", () => {
  test.beforeEach(async ({ page }) => {
    await mockPublicApis(page);
    await page.goto("/");
  });

  test("reste utilisable et accessible sans base réelle", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /liste des derby names/i }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    );

    expect(blockingViolations).toEqual([]);
  });

  test("expose les métadonnées SEO essentielles", async ({ page }) => {
    await expect(page).toHaveTitle(/\S+/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /index\s*,\s*follow/i,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\S+/,
    );
  });

  test("expose les prérequis d'installation PWA", async ({ page, request }) => {
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    );

    const manifestResponse = await request.get("/manifest.webmanifest");
    expect(manifestResponse.ok()).toBe(true);
    expect(manifestResponse.headers()["content-type"]).toMatch(
      /manifest\+json|application\/json/i,
    );

    const manifest = await manifestResponse.json();
    expect(manifest).toMatchObject({
      name: "Derby Names",
      short_name: "Derby Names",
      start_url: "/",
      scope: "/",
      display: "standalone",
      theme_color: "#000000",
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/pwa-icon-192.png",
          sizes: "192x192",
          type: "image/png",
        }),
        expect.objectContaining({
          src: "/pwa-icon-512.png",
          sizes: "512x512",
          type: "image/png",
        }),
      ]),
    );

    const iconResponses = await Promise.all([
      request.get("/pwa-icon-192.png"),
      request.get("/pwa-icon-512.png"),
    ]);
    expect(iconResponses.every((response) => response.ok())).toBe(true);

    const serviceWorkerResponse = await request.get("/sw.js");
    expect(serviceWorkerResponse.ok()).toBe(true);
    expect(serviceWorkerResponse.headers()["content-type"]).toMatch(/javascript/i);
  });
});
