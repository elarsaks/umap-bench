import { test, expect, type Page } from '@playwright/test';
import { applyWasmConfig, getWasmConfigFromEnv } from './wasm-config';

const datasetSelect = (page: Page) =>
  page.locator('.control-section', { hasText: 'Dataset Selection' }).getByRole('combobox');

const runButton = (page: Page) => page.locator('.run-benchmark-btn');

const runBenchmarkAndWait = async (page: Page) => {
  const button = runButton(page);
  await button.click();
  await expect.soft(button).toBeDisabled();
  await expect(button).toBeEnabled({ timeout: 240_000 });
  await expect.soft(page.getByText('Latest Results')).toBeVisible();
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
  await setBenchContext(page, 'small');
  const { selection: wasmSelection } = getWasmConfigFromEnv();
  await applyWasmConfig(page, wasmSelection);

  const datasetDropdown = datasetSelect(page);

  await datasetDropdown.selectOption({ label: 'Iris Dataset (150 points, 4D)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 150, 4);

  await datasetDropdown.selectOption({ label: 'Small Random (100 points)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 100, 10);

  const tableRows = page.getByRole('row').filter({ hasText: '×' });
  await expect.soft(tableRows).toHaveCount(2);
  await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
  await attachBenchmarkMetrics(page, testInfo);
});

test('mid bench: two moderate datasets @mid', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await page.goto('/');
  await setBenchContext(page, 'mid');
  const { selection: wasmSelection } = getWasmConfigFromEnv();
  await applyWasmConfig(page, wasmSelection);

  const datasetDropdown = datasetSelect(page);

  await datasetDropdown.selectOption({ label: 'Swiss Roll (1K points, 3D manifold)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 1000, 3);

  await datasetDropdown.selectOption({ label: 'Medium Clustered (1K points)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 1000, 50);

  const tableRows = page.getByRole('row').filter({ hasText: '×' });
  await expect.soft(tableRows).toHaveCount(2);
  await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
  await attachBenchmarkMetrics(page, testInfo);
});

test('large bench: two heavier datasets @large', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await page.goto('/');
  await setBenchContext(page, 'large');
  const { selection: wasmSelection } = getWasmConfigFromEnv();
  await applyWasmConfig(page, wasmSelection);

  const datasetDropdown = datasetSelect(page);

  await datasetDropdown.selectOption({ label: 'MNIST-like (2K points, 784D)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 2000, 784);

  await datasetDropdown.selectOption({ label: '3D Dense Clusters (2K points)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 2000, 75);

  const tableRows = page.getByRole('row').filter({ hasText: '×' });
  await expect.soft(tableRows).toHaveCount(2);
  await expect.soft(page.getByText('Average Results (2 runs)')).toBeVisible();
  await attachBenchmarkMetrics(page, testInfo);
});
