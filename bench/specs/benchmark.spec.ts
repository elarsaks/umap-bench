/**
 * Benchmark spec for scope-based performance testing.
 * Uses shared helpers from bench/lib/.
 */

import { test, expect } from '@playwright/test';
import {
  applyWasmConfig,
  getWasmConfigsFromEnv,
  datasetSelect,
  attachPageDiagnostics,
  preloadWasm,
  waitForWasmReady,
  runBenchmarkAndWait,
  clearResults,
  expectDatasetSummary,
  setBenchContext,
  needsWasm,
  attachBenchmarkMetrics,
  getEnvTimeout,
} from '../lib';

test('small bench: sequential lightweight datasets @small', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  attachPageDiagnostics(page, 'small');
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
      `[bench][small] config=${configLabel} dataset=Small Random (80x10) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'Small Random (80 points)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 80, 10);

    const tableRows = page.getByRole('row').filter({ hasText: '×' });
    await expect.soft(tableRows).toHaveCount(2);
    await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
    await attachBenchmarkMetrics(page, testInfo);
  }
});

test('mid bench: two moderate datasets @mid', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  attachPageDiagnostics(page, 'mid');
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
      `[bench][mid] config=${configLabel} dataset=Swiss Roll (600x3) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'Swiss Roll (600 points, 3D manifold)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 600, 3);

    console.log(
      `[bench][mid] config=${configLabel} dataset=Medium Clustered (600x50) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'Medium Clustered (600 points)' });
    await runBenchmarkAndWait(page);
    await expectDatasetSummary(page, 600, 50);

    const tableRows = page.getByRole('row').filter({ hasText: '×' });
    await expect.soft(tableRows).toHaveCount(2);
    await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
    await attachBenchmarkMetrics(page, testInfo);
  }
});

test('large bench: two heavier datasets @large', async ({ page }, testInfo) => {
  const runTimeoutMs = getEnvTimeout('BENCH_LARGE_RUN_TIMEOUT_MS', 900_000);
  test.setTimeout(runTimeoutMs + 120_000);
  attachPageDiagnostics(page, 'large');
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
      `[bench][large] config=${configLabel} dataset=MNIST-like (1000x784) run=1/1`
    );
    await datasetDropdown.selectOption({ label: 'MNIST-like (1K points, 784D)' });
    await runBenchmarkAndWait(page, runTimeoutMs);
    await expectDatasetSummary(page, 1000, 784);

    console.log(
      `[bench][large] config=${configLabel} dataset=3D Dense Clusters (1000x75) run=1/1`
    );
    await datasetDropdown.selectOption({ label: '3D Dense Clusters (1K points)' });
    await runBenchmarkAndWait(page, runTimeoutMs);
    await expectDatasetSummary(page, 1000, 75);

    const tableRows = page.getByRole('row').filter({ hasText: '×' });
    await expect.soft(tableRows).toHaveCount(2);
    await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
    await attachBenchmarkMetrics(page, testInfo);
  }
});
