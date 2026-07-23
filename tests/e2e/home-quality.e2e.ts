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
});
