import { test, expect, type Page } from "@playwright/test";
import { applyWasmConfig, getWasmConfigFromEnv } from "./wasm-config";

const datasetSelect = (page: Page) =>
  page
    .locator(".control-section", { hasText: "Dataset Selection" })
    .getByRole("combobox");

const runButton = (page: Page) => page.locator(".run-benchmark-btn");

const clearButton = (page: Page) => page.locator(".clear-results-btn");

const allDisabledConfig = {
  useWasmDistance: false,
  useWasmTree: false,
  useWasmMatrix: false,
  useWasmNNDescent: false,
  useWasmOptimizer: false,
};

const allEnabledConfig = {
  useWasmDistance: true,
  useWasmTree: true,
  useWasmMatrix: true,
  useWasmNNDescent: true,
  useWasmOptimizer: true,
};

const clearResults = async (page: Page) => {
  const button = clearButton(page);
  await button.click();
  await expect(
    page.getByText(
      "No benchmark results yet. Run a benchmark to see performance metrics."
    )
  ).toBeVisible();
};

const runBenchmarkAndWait = async (page: Page) => {
  const button = runButton(page);
  await button.click();
  await expect(button).toBeDisabled();
  await expect(button).toBeEnabled({ timeout: 240_000 });
  await expect(page.getByText("Latest Results")).toBeVisible();
};

const expectDatasetSummary = async (
  page: Page,
  size: number,
  dims: number
) => {
  await expect(
    page.getByText(`Dataset: ${size} points, ${dims} dimensions`)
  ).toBeVisible();
  const datasetCells = page.getByRole("cell", { name: `${size}×${dims}` });
  await expect(datasetCells).toHaveCount(10);
};

const collectTableRows = async (
  page: Page,
  scenario: string,
  datasetLabel: string
) =>
  page.$$eval(
    ".results-table tbody tr",
    (rows, context) =>
      rows.map((row) => {
        const cells = Array.from(row.querySelectorAll("td")).map((cell) =>
          (cell.textContent || "").trim()
        );
        return {
          scenario: context.scenario,
          datasetLabel: context.datasetLabel,
          run: Number(cells[0] || 0),
          runtimeMs: Number.parseFloat(cells[1] || "0"),
          memoryMb: Number.parseFloat(cells[2] || "0"),
          qualityPercent: Number.parseFloat(cells[3] || "0"),
          fps: Number.parseFloat(cells[4] || "0"),
          latencyMs: Number.parseFloat(cells[5] || "0"),
          wasmFeatures: cells[6] || "",
          dataset: cells[7] || "",
        };
      }),
    { scenario, datasetLabel }
  );

const attachBenchmarkMetrics = async (
  page: Page,
  scenario: string,
  datasetLabel: string,
  testInfo: { attach: (name: string, payload: { body: string; contentType: string }) => Promise<void> }
) => {
  const rows = await collectTableRows(page, scenario, datasetLabel);
  await testInfo.attach("benchmark-metrics", {
    body: JSON.stringify({ rows }, null, 2),
    contentType: "application/json",
  });
};

test("bench loop: 10x small/mid/large with JS then WASM @loop", async (
  { page },
  testInfo
) => {
  test.setTimeout(1_800_000);
  await page.goto("/");

  const datasetDropdown = datasetSelect(page);
  const datasets = [
    {
      label: "Iris Dataset (150 points, 4D)",
      size: 150,
      dims: 4,
    },
    {
      label: "Swiss Roll (1K points, 3D manifold)",
      size: 1000,
      dims: 3,
    },
    {
      label: "MNIST-like (2K points, 784D)",
      size: 2000,
      dims: 784,
    },
  ];

  const envConfig = getWasmConfigFromEnv();
  const configs = process.env.WASM_FEATURES
    ? [{ label: `wasm-${envConfig.raw}`, config: envConfig.selection }]
    : [
        { label: "js-only", config: allDisabledConfig },
        { label: "wasm-all", config: allEnabledConfig },
      ];

  for (const config of configs) {
    await applyWasmConfig(page, config.config);

    for (const dataset of datasets) {
      await datasetDropdown.selectOption({ label: dataset.label });
      await clearResults(page);

      for (let run = 0; run < 10; run += 1) {
        await runBenchmarkAndWait(page);
      }

      await expectDatasetSummary(page, dataset.size, dataset.dims);
      await expect(page.getByText("Average Results (10 runs)")).toBeVisible();
      const tableRows = page.getByRole("row").filter({ hasText: "×" });
      await expect(tableRows).toHaveCount(10);
      await attachBenchmarkMetrics(
        page,
        `${testInfo.title} (${config.label})`,
        dataset.label,
        testInfo
      );
    }
  }
});
