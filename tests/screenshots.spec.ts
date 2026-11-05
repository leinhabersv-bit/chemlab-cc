import { test, expect } from "@playwright/test";

test("entry, responsive layout, keyboard access and challenge guidance", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: /Enter the water laboratory/ }).click();
  await expect(
    page.getByRole("heading", { name: "A change you can measure." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "challenge", exact: true }).click();
  await expect(
    page.getByText(
      "Follow the manual. Use the apparatus and judge the endpoint yourself.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Inspect glassware", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Glassware inspected ✓" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const unnamed = await page
    .locator("button")
    .evaluateAll(
      (nodes) =>
        nodes.filter(
          (n) => !n.getAttribute("aria-label") && !n.textContent?.trim(),
        ).length,
    );
  expect(unnamed).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.screenshot({
    path: testInfo.outputPath("bench.png"),
    fullPage: true,
  });
});

test("move actual apparatus, condition, fill, pour, discard and wash by hand", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  await page.goto("/experiments/exp-1");
  await page
    .getByRole("button", { name: "Inspect glassware", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place flask under burette", exact: true })
    .click();
  async function drag(item: string, x: number, y: number) {
    const object = page.locator(`[data-apparatus="${item}"]`);
    await object.scrollIntoViewIfNeeded();
    const bounds = await object.boundingBox();
    const scene = await page.locator(".edta-hands-on svg").boundingBox();
    const transform = await object.getAttribute("transform");
    if (!bounds || !scene || !transform) throw new Error("Missing apparatus");
    const current = transform.match(/translate\(([-\d.]+)[ ,]+([-\d.]+)/)!;
    const start = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
    const end = {
      x: start.x + ((x - Number(current[1])) * scene.width) / 900,
      y: start.y + ((y - Number(current[2])) * scene.height) / 630,
    };
    if (testInfo.project.name.includes("Mobile")) {
      const client = await page.context().newCDPSession(page);
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [start],
      });
      for (let i = 1; i <= 8; i++)
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            {
              x: start.x + ((end.x - start.x) * i) / 8,
              y: start.y + ((end.y - start.y) * i) / 8,
            },
          ],
        });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await client.detach();
    } else {
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(end.x, end.y, { steps: 8 });
      await page.mouse.up();
    }
    const moved = (await object.getAttribute("transform"))!.match(
      /translate\(([-\d.]+)[ ,]+([-\d.]+)/,
    )!;
    expect(
      Math.abs(Number(moved[1]) - x),
      `${item}: ${moved[0]} expected ${x},${y}`,
    ).toBeLessThan(2);
    expect(Math.abs(Number(moved[2]) - y)).toBeLessThan(2);
  }
  async function tilt() {
    const slider = page.getByRole("slider", {
      name: "Tilt selected apparatus",
    });
    await slider.focus();
    await slider.press("Home");
    await slider.press("End");
  }
  await drag("edta", 490, 160);
  await tilt();
  await page.getByLabel("Rinse or fill").selectOption("fill");
  await tilt();
  await page
    .getByRole("button", { name: "Select burette", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear air bubbles to waste", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Record initial meniscus", exact: true })
    .click();
  await page.getByLabel("Rinse or fill").selectOption("rinse");
  await drag("pipette", 170, 510);
  await page.getByLabel("Rinse or fill").selectOption("fill");
  await drag("pipette", 180, 500);
  await drag("pipette", 490, 410);
  await tilt();
  await expect(
    page.getByText("20.00 mL in flask", { exact: true }),
  ).toBeVisible();
  await drag("pipette", 640, 400);
  await drag("buffer", 490, 425);
  await tilt();
  await drag("buffer", 260, 510);
  await drag("indicator", 490, 425);
  await tilt();
  await tilt();
  await tilt();
  await expect(page.getByTestId("colour")).toHaveText("wine red");
  await expect(
    page.getByText("24.15 mL in flask", { exact: true }),
  ).toBeVisible();
  await drag("indicator", 330, 510);
  await page.screenshot({
    path: testInfo.outputPath("hands-on-prepared.png"),
    fullPage: true,
  });
  await drag("flask", 120, 340);
  await tilt();
  await expect(
    page.getByText("0.00 mL in flask", { exact: true }),
  ).toBeVisible();
  await drag("wash", 120, 260);
  await tilt();
  await expect(page.locator(".edta-hand-controls p")).toContainText(
    "Flask rinsed with water",
  );
  await drag("wash", 820, 510);
  await drag("flask", 490, 510);
  await expect(page.locator(".edta-warning")).toBeEmpty();
});
