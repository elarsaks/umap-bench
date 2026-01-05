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

test('small bench: sequential lightweight datasets @small', async ({ page }) => {
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
});

test('mid bench: two moderate datasets @mid', async ({ page }) => {
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
});

test('large bench: two heavier datasets @large', async ({ page }) => {
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
});