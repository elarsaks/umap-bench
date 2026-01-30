import { test, expect, type Page } from '@playwright/test';
import { applyWasmConfig, getWasmConfigsFromEnv } from './wasm-config';

const datasetSelect = (page: Page) =>
  page.locator('.control-section', { hasText: 'Dataset Selection' }).getByRole('combobox');

const runButton = (page: Page) => page.locator('.run-benchmark-btn');

const clearButton = (page: Page) => page.locator('.clear-results-btn');

const shouldPreloadWasm = () =>
  ['1', 'true', 'yes'].includes((process.env.PRELOAD_WASM || '').toLowerCase());

const preloadWasm = async (page: Page) => {
  if (!shouldPreloadWasm()) return;
  console.log('[bench] preloading WASM...');
  await page.evaluate(async () => {
    if (window.__WASM_ENSURE_READY__) {
      await window.__WASM_ENSURE_READY__();
    }
  });
};

const waitForWasmReady = async (page: Page, timeoutMs = 240_000) => {
  const button = runButton(page);
  const start = Date.now();
  let lastLog = 0;

  while (true) {
    if (await button.isEnabled()) return;

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

    if (now - start > timeoutMs) {
      throw new Error('Timed out waiting for WASM to become ready.');
    }
    await page.waitForTimeout(500);
  }
};

const runBenchmarkAndWait = async (page: Page) => {
  const button = runButton(page);
  await waitForWasmReady(page);
  await button.click();
  await expect.soft(button).toBeDisabled();
  await expect(button).toBeEnabled({ timeout: 240_000 });
  await expect.soft(page.getByText('Latest Results')).toBeVisible();
};

const clearResults = async (page: Page) => {
  const button = clearButton(page);
  await button.click();
  await expect(
    page.getByText('No benchmark results yet. Run a benchmark to see performance metrics.')
  ).toBeVisible();
};

const expectDatasetSummary = async (page: Page, size: number, dims: number) => {
  await expect
    .soft(page.getByText(`Dataset: ${size} points, ${dims} dimensions`))
    .toBeVisible();
  await expect.soft(page.getByRole('cell', { name: `${size}×${dims}` })).toBeVisible();
};

const setBenchContext = async (page: Page, scope: string) =>
  page.evaluate((value) => {
    window.__BENCH_EXPORT__ = [];
    window.__BENCH_CONTEXT__ = { scope: value };
  }, scope);

const needsWasm = (selection: Record<string, boolean>) =>
  Object.values(selection).some(Boolean);

const attachBenchmarkMetrics = async (
  page: Page,
  testInfo: { attach: (name: string, payload: { body: string; contentType: string }) => Promise<void> }
) => {
  const rows = await page.evaluate(() => window.__BENCH_EXPORT__ || []);
  await testInfo.attach('benchmark-metrics', {
    body: JSON.stringify({ rows }, null, 2),
    contentType: 'application/json',
  });
};

test('small bench: sequential lightweight datasets @small', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await page.goto('/');
  await preloadWasm(page);
  const { configs } = getWasmConfigsFromEnv();

  for (const config of configs) {
    const configLabel = config.label;
    await applyWasmConfig(page, config.selection);
    if (needsWasm(config.selection)) {
      await waitForWasmReady(page);
    }
    await clearResults(page);
    await setBenchContext(page, 'small');

    const datasetDropdown = datasetSelect(page);

    console.log(
      `[bench][small] config=${configLabel} dataset=Iris (150x4) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'Iris Dataset (150 points, 4D)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 150, 4);

    console.log(
      `[bench][small] config=${configLabel} dataset=Small Random (100x10) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'Small Random (100 points)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 100, 10);

    const tableRows = page.getByRole('row').filter({ hasText: '×' });
    await expect.soft(tableRows).toHaveCount(2);
    await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
    await attachBenchmarkMetrics(page, testInfo);
  }
});

test('mid bench: two moderate datasets @mid', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await page.goto('/');
  await preloadWasm(page);
  const { configs } = getWasmConfigsFromEnv();

  for (const config of configs) {
    const configLabel = config.label;
    await applyWasmConfig(page, config.selection);
    if (needsWasm(config.selection)) {
      await waitForWasmReady(page);
    }
    await clearResults(page);
    await setBenchContext(page, 'mid');

    const datasetDropdown = datasetSelect(page);

    console.log(
      `[bench][mid] config=${configLabel} dataset=Swiss Roll (1000x3) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'Swiss Roll (1K points, 3D manifold)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 1000, 3);

    console.log(
      `[bench][mid] config=${configLabel} dataset=Medium Clustered (1000x50) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'Medium Clustered (1K points)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 1000, 50);

    const tableRows = page.getByRole('row').filter({ hasText: '×' });
    await expect.soft(tableRows).toHaveCount(2);
    await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
    await attachBenchmarkMetrics(page, testInfo);
  }
});

test('large bench: two heavier datasets @large', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await page.goto('/');
  await preloadWasm(page);
  const { configs } = getWasmConfigsFromEnv();

  for (const config of configs) {
    const configLabel = config.label;
    await applyWasmConfig(page, config.selection);
    if (needsWasm(config.selection)) {
      await waitForWasmReady(page);
    }
    await clearResults(page);
    await setBenchContext(page, 'large');

    const datasetDropdown = datasetSelect(page);

    console.log(
      `[bench][large] config=${configLabel} dataset=MNIST-like (2000x784) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'MNIST-like (2K points, 784D)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 2000, 784);

    console.log(
      `[bench][large] config=${configLabel} dataset=3D Dense Clusters (2000x75) run=1/1`
    );
    await datasetDropdown.selectOption({ label: '3D Dense Clusters (2K points)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 2000, 75);

    const tableRows = page.getByRole('row').filter({ hasText: '×' });
    await expect.soft(tableRows).toHaveCount(2);
    await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
    await attachBenchmarkMetrics(page, testInfo);
  }
});
