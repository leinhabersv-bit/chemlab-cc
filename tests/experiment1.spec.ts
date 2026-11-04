import { test, expect } from "@playwright/test";

test.describe("CHEMLAB CC — Digital Laboratory Redesign", () => {
  test("Homepage loads with laboratory visual identity and 10 syllabus experiments", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CHEMLAB CC/);

    // Verify brand in navbar
    const brandLink = page.getByRole("link", { name: /CHEMLAB CC/i }).first();
    await expect(brandLink).toBeVisible();
    await expect(page.getByText(/BCHY101P CURRICULUM/i)).toBeVisible();

    // Verify all 10 stations are present in the directory using exact station text
    for (let i = 1; i <= 10; i++) {
      const stationText = `STATION ${i.toString().padStart(2, "0")}`;
      await expect(page.getByText(stationText, { exact: true }).first()).toBeVisible();
    }

    // Verify launch button for Station 01
    const launchBtn = page.getByRole("link", { name: /Deploy Station 01/i }).first();
    await expect(launchBtn).toBeVisible();
  });

  test("Experiment 1: Purpose-built 3-pane digital laboratory workbench", async ({ page }) => {
    await page.goto("/experiments/exp-1");

    // 1. Top Bar & Workspace Regions
    await expect(page.getByText("BENCH WORKSPACE")).toBeVisible();
    await expect(page.getByText("REAGENTS & TOOLS")).toBeVisible();
    
    const isCompact = (page.viewportSize()?.width ?? 1440) < 1024;
    if (isCompact) {
      // Test mobile/tablet drawer toggle to verify Contextual Inspector without blocking reagents
      await page.getByTitle("Toggle Contextual Inspector").click();
      await expect(page.getByText("CONTEXTUAL INSPECTOR")).toBeVisible();
      // Reopen reagents drawer for titration steps
      await page.getByTitle("Toggle Reagents & Tools Drawer").click();
      await expect(page.getByText("REAGENTS & TOOLS")).toBeVisible();
    } else {
      await expect(page.getByText("CONTEXTUAL INSPECTOR")).toBeVisible();
    }

    // 2. Interactive Titration Workflow on Physical Bench
    // Step A: Pipette 20 mL Sample
    const pipetteBtn = page.getByRole("button", { name: /Std Hard Water/i }).first();
    await expect(pipetteBtn).toBeVisible();
    await pipetteBtn.click();
    await expect(page.getByText(/20\.0 mL Pipetted/i).first()).toBeVisible();

    // Step B: Add Ammonia Buffer
    const bufferBtn = page.getByRole("button", { name: /Ammonia Buffer/i }).first();
    await expect(bufferBtn).toBeVisible();
    await bufferBtn.click();
    await expect(page.getByText(/Buffer Added/i)).toBeVisible();

    // Step C: Add EBT Indicator
    const indicatorBtn = page.getByRole("button", { name: /EBT Indicator/i }).first();
    await expect(indicatorBtn).toBeVisible();
    await indicatorBtn.click();
    await expect(page.getByText("✓ Indicator Added (Wine Red Complex)")).toBeVisible();

    // On compact screens, close overlay drawer so bench controls are directly interactable
    if (isCompact) {
      await page.getByRole("button", { name: /✕ Close/i }).first().click();
    }

    // Step D: Operate Burette Stopcock
    const dropBtn = page.getByRole("button", { name: /\+0\.05 mL Drop/i });
    const fastBtn = page.getByRole("button", { name: /\+1\.0 mL Rapid/i });
    await expect(dropBtn).toBeVisible();
    await expect(fastBtn).toBeVisible();

    // Dispense titrant
    await fastBtn.click();
    await fastBtn.click();
    await dropBtn.click();
    await expect(page.getByText(/Burette:/i)).toBeVisible();

    // Step E: Record Reading
    const recordBtn = page.getByRole("button", { name: /Record Titre Reading:/i });
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    // 3. Subpart Switching & Instruments
    // Switch to Chloride Conductometry
    const chlorideTab = page.getByRole("button", { name: "chloride" }).first();
    await chlorideTab.click();
    await expect(page.getByText(/DIGITAL CONDUCTOMETER/i)).toBeVisible();

    // Switch to Sulfate Nephelometry
    const sulfateTab = page.getByRole("button", { name: "sulfate" }).first();
    await sulfateTab.click();
    await expect(page.getByText(/DIGITAL NEPHELOMETER/i)).toBeVisible();

    // Switch to TDS Estimation
    const tdsTab = page.getByRole("button", { name: "tds" }).first();
    await tdsTab.click();
    await expect(page.getByText(/Proportionality Constant kₑ:/i)).toBeVisible();

    // Switch to pH Measurement
    const phTab = page.getByRole("button", { name: "ph" }).first();
    await phTab.click();
    await expect(page.getByText(/DIGITAL BENCHTOP pH METER/i)).toBeVisible();

    // 4. Laboratory Notebook Drawer
    const notebookToggle = page.getByRole("button", { name: /Notebook/i }).first();
    await notebookToggle.click();
    await expect(page.getByText("LABORATORY NOTEBOOK & OBSERVATIONS")).toBeVisible();
    await expect(page.getByRole("button", { name: "BIS Compliance Report" })).toBeVisible();

    // Open BIS report sheet inside notebook
    await page.getByRole("button", { name: "BIS Compliance Report" }).click();
    await expect(page.getByText("Comprehensive Water Quality Analysis Report")).toBeVisible();

    // 5. Unified Guided Demonstration Mode Switch
    const demoModeBtn = page.getByRole("button", { name: /Demo/i }).first();
    await demoModeBtn.click();
    await expect(page.getByText("AUTOMATED GUIDED DEMONSTRATION")).toBeVisible();
    await expect(page.getByRole("button", { name: /Play Demo/i })).toBeVisible();
  });
});
