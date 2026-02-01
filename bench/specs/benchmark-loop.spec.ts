import { test, expect, type Page } from "@playwright/test";
import { applyWasmConfig, getWasmConfigsFromEnv } from "./wasm-config";

const datasetSelect = (page: Page) =>
  page
    .locator(".control-section", { hasText: "Dataset Selection" })
    .getByRole("combobox");

const runButton = (page: Page) => page.locator(".run-benchmark-btn");

const clearButton = (page: Page) => page.locator(".clear-results-btn");

const shouldPreloadWasm = () =>
  ["1", "true", "yes"].includes((process.env.PRELOAD_WASM || "").toLowerCase());

const preloadWasm = async (page: Page) => {
  if (!shouldPreloadWasm()) return;
  console.log("[bench] preloading WASM...");
  await page.evaluate(async () => {
    if (window.__WASM_ENSURE_READY__) {
      await window.__WASM_ENSURE_READY__();
    }
  });
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
  const start = Date.now();
  let lastLog = 0;
  while (!(await button.isEnabled())) {
    const now = Date.now();
    if (now - lastLog >= 5_000) {
      const status = await page.evaluate(() => ({
        loading: window.__WASM_LOADING__ ?? false,
        progress: window.__WASM_PROGRESS__ ?? 0,
      }));
      const elapsed = Math.round((now - start) / 1000);
      if (status.loading) {
        console.log(`[bench] waiting for WASM... ${elapsed}s (${status.progress}%)`);
      } else {
        console.log(`[bench] waiting for WASM... ${elapsed}s`);
      }
      lastLog = now;
    }
    if (now - start > 240_000) {
      throw new Error("Timed out waiting for WASM to become ready.");
    }
    await page.waitForTimeout(500);
  }
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
  await expect
    .soft(page.getByText(`Dataset: ${size} points, ${dims} dimensions`))
    .toBeVisible();
  const datasetCells = page.getByRole("cell", { name: `${size}×${dims}` });
  await expect.soft(datasetCells).toHaveCount(10);
};

const setBenchContext = async (page: Page, scope: string) =>
  page.evaluate((value) => {
    window.__BENCH_EXPORT__ = [];
    window.__BENCH_CONTEXT__ = { scope: value };
  }, scope);

const attachBenchmarkMetrics = async (
  page: Page,
  testInfo: { attach: (name: string, payload: { body: string; contentType: string }) => Promise<void> }
) => {
  const rows = await page.evaluate(() => window.__BENCH_EXPORT__ || []);
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
  await preloadWasm(page);
  const datasetDropdown = datasetSelect(page);
  const datasets = [
    {
      label: "Iris Dataset (150 points, 4D)",
      size: 150,
      dims: 4,
    },
    {
      label: "Swiss Roll (600 points, 3D manifold)",
      size: 600,
      dims: 3,
    },
    {
      label: "MNIST-like (1K points, 784D)",
      size: 1000,
      dims: 784,
    },
  ];

  const { configs } = getWasmConfigsFromEnv({ defaultMode: "js-and-all" });

  for (const config of configs) {
    const configLabel = config.label;
    await applyWasmConfig(page, config.selection);
    await setBenchContext(page, "loop");

    for (const dataset of datasets) {
      const datasetLabel = dataset.label;
      await datasetDropdown.selectOption({ label: dataset.label });
      await clearResults(page);

      for (let run = 0; run < 10; run += 1) {
        console.log(
          `[bench][loop] config=${configLabel} dataset=${datasetLabel} run=${run + 1}/10`
        );
        await runBenchmarkAndWait(page);
      }

      await expectDatasetSummary(page, dataset.size, dataset.dims);
      await expect
        .soft(page.getByText("Average Results (10 runs)"))
        .toBeVisible();
      const tableRows = page.getByRole("row").filter({ hasText: "×" });
      await expect.soft(tableRows).toHaveCount(10);
    }

    await attachBenchmarkMetrics(page, testInfo);
  }
});
