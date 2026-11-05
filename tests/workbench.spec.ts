import { test, expect } from "@playwright/test";

test("3D bench, view switching and detailed learning guide share live state", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/experiments/exp-1");
  await expect(page.locator(".edta-scene-wrap")).toHaveClass(/is-3d/, {
    timeout: 20000,
  });
  await expect(page.locator("canvas[data-renderer=webgl]")).toBeVisible();
  await page
    .getByRole("button", { name: "Inspect glassware", exact: true })
    .click();
  await page.getByRole("button", { name: "Flat view", exact: true }).click();
  await expect(page.locator(".edta-scene-wrap")).not.toHaveClass(/is-3d/);
  await expect(
    page.getByRole("button", { name: "Glassware inspected" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "3D lab", exact: true }).click();
  await expect(page.locator(".edta-scene-wrap")).toHaveClass(/is-3d/);
  await page
    .getByRole("button", { name: "Procedure & theory", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Procedure & learning" }),
  ).toBeVisible();
  await page.getByLabel("Find a step").fill("Add the pH 10 buffer");
  await page.locator(".procedure-guide summary").click();
  await expect(page.locator(".procedure-guide-why")).toContainText("pH");
  await page.getByLabel("Find a step").fill("no matching chemical");
  await expect(
    page.getByText("No matching steps.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Follow current step" }).click();
  await expect(page.getByLabel("Find a step")).toHaveValue("");
  await expect(page.locator(".procedure-guide details")).toHaveCount(10);
  await page.getByRole("button", { name: "Theory & reference" }).click();
  await expect(
    page.getByRole("heading", { name: "Hardness = (V2 / V1) × 1000" }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("guide-reference.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Procedure & theory", exact: true })
    .click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath("workbench-3d.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("unavailable WebGL falls back to a usable flat bench", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/experiments/exp-1");
  await expect(
    page.getByText("3D is unavailable on this device.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".edta-scene-wrap")).not.toHaveClass(/is-3d/);
  await page
    .getByRole("button", { name: "Inspect glassware", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Glassware inspected" }),
  ).toBeVisible();
});
