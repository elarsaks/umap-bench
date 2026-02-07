/**
 * Benchmark loop spec for running multiple iterations.
 * Uses shared helpers from bench/lib/.
 */

import { test, expect } from '@playwright/test';
import {
  applyWasmConfig,
  getWasmConfigsFromEnv,
  datasetSelect,
  preloadWasm,
  waitForWasmReady,
  runBenchmarkAndWait,
  clearResults,
  expectDatasetSummary,
  setBenchContext,
  attachBenchmarkMetrics,
} from '../lib';

test('bench loop: 10x small/mid/large with JS then WASM @loop', async (
  { page },
  testInfo
) => {
  test.setTimeout(1_800_000);
  await page.goto('/');
  await preloadWasm(page);
  const datasetDropdown = datasetSelect(page);
  const datasets = [
    {
      label: 'Iris Dataset (150 points, 4D)',
      size: 150,
      dims: 4,
    },
    {
      label: 'Swiss Roll (600 points, 3D manifold)',
      size: 600,
      dims: 3,
    },
    {
      label: 'MNIST-like (1K points, 784D)',
      size: 1000,
      dims: 784,
    },
  ];

  const { configs } = getWasmConfigsFromEnv({ defaultMode: 'js-and-all' });

  for (const config of configs) {
    const configLabel = config.label;
    await applyWasmConfig(page, config.selection);
    await waitForWasmReady(page);
    await setBenchContext(page, 'loop');

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
        .soft(page.getByText('Average Results (10 runs)'))
        .toBeVisible();
      const tableRows = page.getByRole('row').filter({ hasText: '×' });
      await expect.soft(tableRows).toHaveCount(10);
    }

    await attachBenchmarkMetrics(page, testInfo);
  }
});
