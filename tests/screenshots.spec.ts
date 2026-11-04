import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Capture Visual Acceptance Screenshots", () => {
  const outputDir = path.join(process.cwd(), "screenshots", process.env.SCREENSHOT_STAGE || "before");

  test.beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  test("Desktop 1440px: Homepage & Catalog", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(outputDir, "01_homepage_1440px.png"), fullPage: true });

    // Scroll to catalog section
    const catalogHeading = page.getByRole("heading", { name: /Syllabus Bays/i });
    if (await catalogHeading.isVisible()) {
      await catalogHeading.scrollIntoViewIfNeeded();
    }
    await page.screenshot({ path: path.join(outputDir, "02_catalog_1440px.png") });
  });

  test("Desktop 1440px: Experiment 1 Practice & Demo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/experiments/exp-1");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(outputDir, "03_exp1_practice_1440px.png") });

    // Switch to demonstration mode if button exists
    const demoBtn = page.getByRole("button", { name: /Demo/i }).first();
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outputDir, "04_exp1_demo_1440px.png") });
    }
  });

  test("Mobile 390px: Homepage & Laboratory", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(outputDir, "05_homepage_mobile_390px.png") });

    await page.goto("/experiments/exp-1");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(outputDir, "06_laboratory_mobile_390px.png") });
  });
});
