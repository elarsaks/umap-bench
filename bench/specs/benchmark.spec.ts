import { test, expect, type Page } from '@playwright/test';

const datasetSelect = (page: Page) =>
  page.locator('.control-section', { hasText: 'Dataset Selection' }).getByRole('combobox');

const runButton = (page: Page) => page.locator('.run-benchmark-btn');

const runBenchmarkAndWait = async (page: Page) => {
  const button = runButton(page);
  await button.click();
  await expect(button).toBeDisabled();
  await expect(button).toBeEnabled({ timeout: 120_000 });
  await expect(page.getByText('Latest Results')).toBeVisible();
};

const expectDatasetSummary = async (page: Page, size: number, dims: number) => {
  await expect(page.getByText(`Dataset: ${size} points, ${dims} dimensions`)).toBeVisible();
  await expect(page.getByRole('cell', { name: `${size}×${dims}` })).toBeVisible();
};

const collectTableRows = async (page: Page, scenario: string) =>
  page.$$eval(
    '.results-table tbody tr',
    (rows, context) =>
      rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('td')).map((cell) =>
          (cell.textContent || '').trim()
        );
        return {
          scenario: context.scenario,
          datasetLabel: '',
          run: Number(cells[0] || 0),
          runtimeMs: Number.parseFloat(cells[1] || '0'),
          memoryMb: Number.parseFloat(cells[2] || '0'),
          qualityPercent: Number.parseFloat(cells[3] || '0'),
          fps: Number.parseFloat(cells[4] || '0'),
          latencyMs: Number.parseFloat(cells[5] || '0'),
          wasmFeatures: cells[6] || '',
          dataset: cells[7] || '',
        };
      }),
    { scenario }
  );

const attachBenchmarkMetrics = async (
  page: Page,
  scenario: string,
  testInfo: { attach: (name: string, payload: { body: string; contentType: string }) => Promise<void> }
) => {
  const rows = await collectTableRows(page, scenario);
  await testInfo.attach('benchmark-metrics', {
    body: JSON.stringify({ rows }, null, 2),
    contentType: 'application/json',
  });
};

test('small bench: sequential lightweight datasets @small', async ({ page }, testInfo) => {
  await page.goto('/');

  const datasetDropdown = datasetSelect(page);

  await datasetDropdown.selectOption({ label: 'Iris Dataset (150 points, 4D)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 150, 4);

  await datasetDropdown.selectOption({ label: 'Small Random (100 points)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 100, 10);

  const tableRows = page.getByRole('row').filter({ hasText: '×' });
  await expect(tableRows).toHaveCount(2);
  await expect(page.getByText('Average Results (2 runs)')).toBeVisible();
  await attachBenchmarkMetrics(page, testInfo.title, testInfo);
});

test('mid bench: two moderate datasets @mid', async ({ page }, testInfo) => {
  await page.goto('/');

  const datasetDropdown = datasetSelect(page);

  await datasetDropdown.selectOption({ label: 'Swiss Roll (1K points, 3D manifold)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 1000, 3);

  await datasetDropdown.selectOption({ label: 'Medium Clustered (1K points)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 1000, 50);

  const tableRows = page.getByRole('row').filter({ hasText: '×' });
  await expect(tableRows).toHaveCount(2);
  await expect(page.getByText('Average Results (2 runs)')).toBeVisible();
  await attachBenchmarkMetrics(page, testInfo.title, testInfo);
});

test('large bench: two heavier datasets @large', async ({ page }, testInfo) => {
  await page.goto('/');

  const datasetDropdown = datasetSelect(page);

  await datasetDropdown.selectOption({ label: 'MNIST-like (2K points, 784D)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 2000, 784);

  await datasetDropdown.selectOption({ label: '3D Dense Clusters (2K points)' });
  await runBenchmarkAndWait(page);
  await expectDatasetSummary(page, 2000, 75);

  const tableRows = page.getByRole('row').filter({ hasText: '×' });
  await expect(tableRows).toHaveCount(2);
  await expect(page.getByText('Average Results (2 runs)')).toBeVisible();
  await attachBenchmarkMetrics(page, testInfo.title, testInfo);
});
