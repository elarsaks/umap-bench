import { test, expect, type Page } from '@playwright/test';
import { applyWasmConfig, getWasmConfigsFromEnv } from './wasm-config';

const datasetSelect = (page: Page) =>
  page.locator('.control-section', { hasText: 'Dataset Selection' }).getByRole('combobox');

const runButton = (page: Page) => page.locator('.run-benchmark-btn');

const clearButton = (page: Page) => page.locator('.clear-results-btn');

const shouldPreloadWasm = () =>
  ['1', 'true', 'yes'].includes((process.env.PRELOAD_WASM || '').toLowerCase());

const attachPageDiagnostics = (page: Page, label: string) => {
  const marker = '__benchDiagnosticsAttached__';
  if ((page as unknown as Record<string, boolean>)[marker]) return;
  (page as unknown as Record<string, boolean>)[marker] = true;

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[bench][${label}][console:${type}] ${text}`);
  });

  page.on('pageerror', (err) => {
    console.error(`[bench][${label}][pageerror]`, err);
  });

  page.on('crash', () => {
    console.error(`[bench][${label}][crash] page crashed`);
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    const failure = req.failure()?.errorText || 'unknown';
    console.warn(`[bench][${label}][requestfailed] ${failure} ${url}`);
  });
};

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
      const status = await page.evaluate(() => {
        const button = document.querySelector<HTMLButtonElement>('.run-benchmark-btn');
        return {
          loading: window.__WASM_LOADING__ ?? false,
          progress: window.__WASM_PROGRESS__ ?? 0,
          buttonDisabled: button ? button.disabled : null,
          buttonText: button?.textContent?.trim() || null,
        };
      });
      const elapsed = Math.round((now - start) / 1000);
      if (status.loading) {
        console.log(
          `[bench] waiting for WASM... ${elapsed}s (${status.progress}%)` +
            ` btnDisabled=${status.buttonDisabled} btnText=${status.buttonText}`
        );
      } else {
        console.log(
          `[bench] waiting for WASM... ${elapsed}s` +
            ` btnDisabled=${status.buttonDisabled} btnText=${status.buttonText}`
        );
      }
      lastLog = now;
    }

    if (now - start > timeoutMs) {
      throw new Error('Timed out waiting for WASM to become ready.');
    }
    await page.waitForTimeout(500);
  }
};

const runBenchmarkAndWait = async (page: Page, timeoutMs = 240_000) => {
  const button = runButton(page);
  await waitForWasmReady(page);
  const startExportLen = await page.evaluate(
    () => (window.__BENCH_EXPORT__ || []).length
  );
  await button.click();
  await expect.soft(button).toBeDisabled();
  const start = Date.now();
  let lastLog = 0;
  while (true) {
    const exportDone = await page.evaluate(
      (initialLen) => (window.__BENCH_EXPORT__ || []).length > initialLen,
      startExportLen
    );
    if (exportDone || (await button.isEnabled())) break;

    const now = Date.now();
    if (now - lastLog >= 10_000) {
      const status = await page.evaluate(() => {
        const button = document.querySelector<HTMLButtonElement>('.run-benchmark-btn');
        return {
          progress: window.__BENCH_PROGRESS__ ?? null,
          buttonDisabled: button ? button.disabled : null,
          buttonText: button?.textContent?.trim() || null,
        };
      });
      const elapsed = Math.round((now - start) / 1000);
      if (status.progress) {
        console.log(
          `[bench] running... ${elapsed}s (epoch ${status.progress.epoch}, ${status.progress.elapsedMs}ms)` +
            ` btnDisabled=${status.buttonDisabled} btnText=${status.buttonText}`
        );
      } else {
        console.log(
          `[bench] running... ${elapsed}s` +
            ` btnDisabled=${status.buttonDisabled} btnText=${status.buttonText}`
        );
      }
      lastLog = now;
    }

    if (now - start > timeoutMs) {
      throw new Error('Timed out waiting for benchmark to complete.');
    }
    await page.waitForTimeout(1000);
  }
  // Rely on export completion instead of button re-enable for long JS-only runs.
  await expect.soft(page.getByText('Latest Results')).toBeVisible();
};

const getEnvTimeout = (name: string, fallback: number) => {
  const raw = process.env[name];
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
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
    window.__BENCH_PROGRESS__ = null;
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
