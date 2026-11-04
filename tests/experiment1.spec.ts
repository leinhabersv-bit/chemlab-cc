import { test, expect, type Page } from "@playwright/test";

const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true });
async function chooseBurette(page: Page) {
  await button(page, "Select burette").click();
}
async function chooseFlask(page: Page) {
  await button(page, "Inspect flask & record →").click();
}
async function prepareTrial(page: Page, first: boolean, newSample: boolean) {
  if (first) {
    await button(page, "Inspect glassware").click();
    await button(page, "Place flask under burette").click();
  }
  await chooseBurette(page);
  if (first) await button(page, "Rinse burette with EDTA").click();
  await button(page, "Fill burette to zero").click();
  await button(page, "Clear air bubbles to waste").click();
  await button(page, "Record initial meniscus").click();
  await button(page, "Select pipette").click();
  if (first || newSample) {
    // Pipette conditioning is independent of the initial burette reading.
    // It must be repeated when the water sample changes.
    await button(page, "Rinse pipette with sample").click();
  }
  await button(page, "Aspirate 20 mL").click();
  await button(page, "Transfer pipette to flask").click();
  await button(page, "Buffer").click();
  await button(page, "Pour 4 mL buffer into flask").click();
  await button(page, "EBT").click();
  for (let i = 0; i < 3; i++)
    await button(page, "Add one EBT drop to flask").click();
  await chooseFlask(page);
  await button(page, "Start stirrer").click();
  await expect(page.getByTestId("colour")).toHaveText("wine red");
}
async function titrate(page: Page) {
  await chooseBurette(page);
  const valve = page.getByRole("slider", { name: "Stopcock opening" });
  await valve.focus();
  await valve.press("Home");
  for (let i = 0; i < 10; i++) await valve.press("ArrowRight");
  await expect(page.getByTestId("colour")).toHaveText("violet", {
    timeout: 30000,
  });
  await valve.press("Home");
  for (
    let i = 0;
    i < 60 && (await page.getByTestId("colour").textContent()) !== "steel blue";
    i++
  )
    await button(page, "Add one drop").click();
  await expect(page.getByTestId("colour")).toHaveText("steel blue");
  const finalMl = Number(
    await page.getByTestId("burette-reading").textContent(),
  );
  await chooseFlask(page);
  await page.getByLabel("Final meniscus (mL)").fill(finalMl.toFixed(2));
  await button(page, "Record trial").click();
  await expect(page.locator(".edta-warning")).toContainText("Trial accepted");
  return Number((finalMl - 0.5).toFixed(2));
}

test("complete practice: prepare, standardize twice, titrate unknown twice, calculate and download", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/experiments/exp-1");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A change you can measure",
  );
  const titres: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (i > 0) {
      await chooseFlask(page);
      await button(page, "Empty and rinse flask").click();
    }
    if (i === 2) await button(page, "Change to unknown water →").click();
    await prepareTrial(page, i === 0, i === 2);
    if (i === 0) {
      await page.getByLabel("Final meniscus (mL)").fill("0.50");
      await button(page, "Record trial").click();
      await expect(page.locator(".edta-warning")).toContainText(
        "steel-blue endpoint",
      );
      await page.screenshot({
        path: testInfo.outputPath("prepared.png"),
        fullPage: true,
      });
    }
    titres.push(await titrate(page));
  }
  const expected = ((titres[2] + titres[3]) / (titres[0] + titres[1])) * 1000;
  await expect(page.getByTestId("hardness-result")).toContainText(
    expected.toFixed(1),
  );
  await expect(page.locator("tbody tr")).toHaveCount(4);
  expect(Math.abs(titres[0] - titres[1])).toBeLessThanOrEqual(0.1 + 1e-8);
  expect(Math.abs(titres[2] - titres[3])).toBeLessThanOrEqual(0.1 + 1e-8);
  const downloadEvent = page.waitForEvent("download");
  await button(page, "Download report").click();
  const download = await downloadEvent;
  await download.saveAs(testInfo.outputPath("observations.txt"));
  await page.screenshot({
    path: testInfo.outputPath("complete.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("demonstration completes the same four valid trials", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.goto("/experiments/exp-1");
  await button(page, "Demonstration").click();
  const explanation = page.getByRole("status");
  const initial = await explanation.textContent();
  await page.waitForTimeout(2500); // Step mode must not advance on its own.
  await expect(explanation).toHaveText(initial!);
  await button(page, "Next step").click(); // Inspect.
  await button(page, "Play slowly").click(); // Position after a readable delay.
  await expect(explanation).toContainText("Rinsing with EDTA", {
    timeout: 5000,
  });
  await button(page, "Pause demonstration").click();
  await page.waitForTimeout(2500); // Pausing must cancel the pending action.
  await expect(explanation).toContainText("Rinsing with EDTA");
  let sawBuffer = false,
    sawIndicator = false;
  for (
    let i = 0;
    i < 400 && (await button(page, "Next step").isEnabled());
    i++
  ) {
    const text = (await explanation.textContent()) ?? "";
    if (!sawBuffer && text.includes("The ammonia buffer keeps")) {
      sawBuffer = true;
      await expect(explanation).toContainText("pH 10");
      await page.screenshot({
        path: testInfo.outputPath("demo-buffer-explanation.png"),
        fullPage: true,
      });
    }
    if (text.includes("EBT is the colour indicator")) sawIndicator = true;
    await button(page, "Next step").click();
  }
  expect(sawBuffer).toBe(true);
  expect(sawIndicator).toBe(true);
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await expect(page.getByTestId("hardness-result")).not.toContainText("—");
  await expect(
    page.getByText("Technique feedback: 0 rejected actions.", { exact: false }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("demo-complete.png"),
    fullPage: true,
  });
});

test("slow autoplay runs the complete experiment without manual stepping", async ({
  page,
}) => {
  test.setTimeout(360000);
  await page.goto("/experiments/exp-1");
  await button(page, "Demonstration").click();
  await button(page, "Play slowly").click();
  await expect(
    page.getByText("Autoplay is running.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(4, { timeout: 340000 });
  await expect(page.getByTestId("hardness-result")).not.toContainText("—");
  await expect(
    page.getByText("Technique feedback: 0 rejected actions.", { exact: false }),
  ).toBeVisible();
});
