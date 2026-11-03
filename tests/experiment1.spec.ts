import { test, expect } from "@playwright/test";

test.describe("CHEMLAB CC — Virtual Chemistry Laboratory", () => {
  test("Homepage loads with 10 syllabus experiments and metrics", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CHEMLAB CC/);

    // Verify brand in navbar
    const brandLink = page.getByRole("link", { name: /CHEMLAB CC/i }).first();
    await expect(brandLink).toBeVisible();
    await expect(page.getByText("BCHY101P ENGINEERING CHEMISTRY LAB (2026–27)")).toBeVisible();

    // Verify all 10 experiments are present in the catalog using exact match
    for (let i = 1; i <= 10; i++) {
      const expNumberText = `EXP ${i.toString().padStart(2, "0")}`;
      await expect(page.getByText(expNumberText, { exact: true })).toBeVisible();
    }

    // Verify launch button for Experiment 1
    const launchBtn = page.getByRole("link", { name: /Launch Experiment 1/i }).first();
    await expect(launchBtn).toBeVisible();
  });

  test("Experiment 1: Full 5-in-1 Water Analysis user journey", async ({ page }) => {
    await page.goto("/experiments/exp-1");
    // Verify main h1 title
    await expect(page.locator("h1", { hasText: "Comprehensive Water Analysis" })).toBeVisible();

    // 1. Learn Tab
    await expect(page.getByText("Student Learning Outcomes:")).toBeVisible();
    await expect(page.getByText("Verified Reaction Equations:")).toBeVisible();
    await expect(page.getByText("Documented Inconsistencies & Errata:")).toBeVisible();

    // 2. Demonstration Tab
    await page.getByRole("button", { name: /2\. Demonstration/i }).click();
    await expect(page.getByText("ANIMATED DEMONSTRATION STAGE")).toBeVisible();
    const playDemoBtn = page.getByRole("button", { name: /Play Guided Demo/i });
    await expect(playDemoBtn).toBeVisible();

    // 3. Hands-on Practice Tab
    await page.getByRole("button", { name: /3\. Hands-on Practice/i }).click();
    await expect(page.getByText("TITRATION I: STANDARDIZATION")).toBeVisible();

    // Part A: EDTA titration
    const dropBtn = page.getByRole("button", { name: /Drop \(0.05 mL\)/i });
    const fastBtn = page.getByRole("button", { name: /Fast \(1.0 mL\)/i });
    await expect(dropBtn).toBeVisible();
    await expect(fastBtn).toBeVisible();

    // Dispense some volume
    await fastBtn.click();
    await fastBtn.click();
    await dropBtn.click();
    // Record reading
    const recordBtn = page.getByRole("button", { name: /Record Reading:/i });
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();
    await expect(page.getByText("TABLE 1: STANDARDIZATION OF EDTA")).toBeVisible();

    // Switch to Part B (Chloride Conductometry)
    await page.getByRole("button", { name: /Part B/i }).click();
    await expect(page.getByText("PART B: CONDUCTOMETRIC PRECIPITATION TITRATION")).toBeVisible();
    const addAgNo3Btn = page.getByRole("button", { name: /Add 1.0 mL AgNO3/i });
    await addAgNo3Btn.click();
    await addAgNo3Btn.click();
    await expect(page.getByText("TITRATION PLOT: CONDUCTANCE VS VOL AgNO3")).toBeVisible();

    // Switch to Part C (Sulfate Nephelometry)
    await page.getByRole("button", { name: /Part C/i }).click();
    await expect(page.getByText("PART C: NEPHELOMETRIC TURBIDITY ESTIMATION")).toBeVisible();
    const zeroSetBtn = page.getByRole("button", { name: /Zero Set \(Blank\)/i });
    await expect(zeroSetBtn).toBeVisible();

    // Switch to Part D (TDS)
    await page.getByRole("button", { name: /Part D/i }).click();
    await expect(page.getByText("PART D: TOTAL DISSOLVED SOLIDS (TDS) ESTIMATION")).toBeVisible();
    await expect(page.getByText("Recorded Electrical Conductivity (EC):")).toBeVisible();

    // Switch to Part E (pH)
    await page.getByRole("button", { name: /Part E/i }).click();
    await expect(page.getByText("PART E: POTENTIOMETRIC pH MEASUREMENT")).toBeVisible();
    await expect(page.getByText("DIGITAL BENCHTOP pH METER")).toBeVisible();

    // Switch to Final CPCB Report
    await page.getByRole("button", { name: /Final CPCB Report/i }).click();
    await expect(page.locator("h2", { hasText: "Comprehensive Water Quality Analysis Report" })).toBeVisible();
    await expect(page.getByText("Total Hardness (as CaCO3)")).toBeVisible();
    await expect(page.getByText("Chloride (as Cl-)")).toBeVisible();
    await expect(page.getByText("Total Dissolved Solids (TDS)")).toBeVisible();
    await expect(page.getByText("Sulfate (as SO4 2-)")).toBeVisible();
  });

  test("Formative Concept Quiz evaluation", async ({ page }) => {
    await page.goto("/experiments/exp-1");
    await page.getByRole("button", { name: /5\. Quiz & Review/i }).click();
    await expect(page.getByText("Formative Concept Quiz")).toBeVisible();
    await expect(page.getByText("Q1. Why is ammonia buffer")).toBeVisible();
  });
});
