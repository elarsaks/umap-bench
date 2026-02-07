/**
 * Shared page interaction helpers for benchmark Playwright tests.
 * Extracted from benchmark.spec.ts and benchmark-loop.spec.ts to reduce duplication.
 */

import { expect, type Page } from '@playwright/test';
// Import types to activate global Window interface extensions
import './types';

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

/** Get the dataset selection dropdown */
export const datasetSelect = (page: Page) =>
  page.locator('.control-section', { hasText: 'Dataset Selection' }).getByRole('combobox');

/** Get the "Run Benchmark" button */
export const runButton = (page: Page) => page.locator('.run-benchmark-btn');

/** Get the "Clear Results" button */
export const clearButton = (page: Page) => page.locator('.clear-results-btn');

// ─────────────────────────────────────────────────────────────────────────────
// Environment helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Check if WASM should be preloaded based on env */
export const shouldPreloadWasm = () =>
  ['1', 'true', 'yes'].includes((process.env.PRELOAD_WASM || '').toLowerCase());

/** Get timeout from environment variable with fallback */
export const getEnvTimeout = (name: string, fallback: number) => {
  const raw = process.env[name];
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

// ─────────────────────────────────────────────────────────────────────────────
// Diagnostics
// ─────────────────────────────────────────────────────────────────────────────

/** Attach console/error listeners to page for debugging */
export const attachPageDiagnostics = (page: Page, label: string) => {
  const marker = '__benchDiagnosticsAttached__';
  if ((page as unknown as Record<string, boolean>)[marker]) return;
  (page as unknown as Record<string, boolean>)[marker] = true;

  // Control verbosity via env var: set BENCH_VERBOSE=1 to see all console messages.
  const VERBOSE = ['1', 'true', 'yes'].includes((process.env.BENCH_VERBOSE || '').toLowerCase());

  // Blacklist patterns for noisy messages we don't want to see by default.
  const noisePatterns: RegExp[] = [
    /GL Driver Message/i,
    /ReadPixels/i,
    /swiftshader/i,
    /enable-unsafe-swiftshader/i,
    /GPU stall/i,
  ];

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    // Always show errors.
    if (type === 'error') {
      console.error(`[bench][${label}][console:${type}] ${text}`);
      return;
    }

    // Filter warnings/info that match known noisy patterns unless VERBOSE is enabled.
    if (!VERBOSE && (type === 'warning' || type === 'info')) {
      if (noisePatterns.some((r) => r.test(text))) return;
    }

    // Otherwise log at appropriate level.
    if (type === 'warning') console.warn(`[bench][${label}][console:${type}] ${text}`);
    else console.log(`[bench][${label}][console:${type}] ${text}`);
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

// ─────────────────────────────────────────────────────────────────────────────
// WASM loading
// ─────────────────────────────────────────────────────────────────────────────

/** Preload WASM modules if env is configured for it */
export const preloadWasm = async (page: Page) => {
  if (!shouldPreloadWasm()) return;
  console.log('[bench] preloading WASM...');
  await page.evaluate(async () => {
    if (window.__WASM_ENSURE_READY__) {
      await window.__WASM_ENSURE_READY__();
    }
  });
};

/** Wait for WASM to be ready (run button enabled) */
export const waitForWasmReady = async (page: Page, timeoutMs = 240_000) => {
  const button = runButton(page);
  const start = Date.now();
  let lastLog = 0;

  while (true) {
    if (await button.isEnabled()) return;

    const now = Date.now();
    if (now - lastLog >= 5_000) {
      const status = await page.evaluate(() => {
        const btn = document.querySelector<HTMLButtonElement>('.run-benchmark-btn');
        return {
          loading: window.__WASM_LOADING__ ?? false,
          progress: window.__WASM_PROGRESS__ ?? 0,
          buttonDisabled: btn ? btn.disabled : null,
          buttonText: btn?.textContent?.trim() || null,
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

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark execution
// ─────────────────────────────────────────────────────────────────────────────

/** Run a benchmark and wait for completion */
export const runBenchmarkAndWait = async (page: Page, timeoutMs = 240_000) => {
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
        const btn = document.querySelector<HTMLButtonElement>('.run-benchmark-btn');
        return {
          progress: window.__BENCH_PROGRESS__ ?? null,
          buttonDisabled: btn ? btn.disabled : null,
          buttonText: btn?.textContent?.trim() || null,
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
  await expect.soft(page.getByText('Latest Results')).toBeVisible();
};

/** Clear benchmark results */
export const clearResults = async (page: Page) => {
  const button = clearButton(page);
  await button.click();
  await expect(
    page.getByText('No benchmark results yet. Run a benchmark to see performance metrics.')
  ).toBeVisible();
};

// ─────────────────────────────────────────────────────────────────────────────
// Assertions
// ─────────────────────────────────────────────────────────────────────────────

/** Verify dataset summary is visible */
export const expectDatasetSummary = async (page: Page, size: number, dims: number) => {
  await expect
    .soft(page.getByText(`Dataset: ${size} points, ${dims} dimensions`))
    .toBeVisible();
  await expect.soft(page.getByRole('cell', { name: `${size}×${dims}` })).toBeVisible();
};

// ─────────────────────────────────────────────────────────────────────────────
// Benchmark context
// ─────────────────────────────────────────────────────────────────────────────

/** Initialize benchmark context for a test scope */
export const setBenchContext = async (page: Page, scope: string) =>
  page.evaluate((value) => {
    window.__BENCH_EXPORT__ = [];
    window.__BENCH_CONTEXT__ = { scope: value, renderingEnabled: false };
    window.__BENCH_PROGRESS__ = null;
  }, scope);

/** Check if any WASM features are enabled */
export const needsWasm = (selection: Record<string, boolean>) =>
  Object.values(selection).some(Boolean);

/** Attach benchmark metrics to test info for reporting */
export const attachBenchmarkMetrics = async (
  page: Page,
  testInfo: { attach: (name: string, payload: { body: string; contentType: string }) => Promise<void> }
) => {
  const rows = await page.evaluate(() => window.__BENCH_EXPORT__ || []);
  await testInfo.attach('benchmark-metrics', {
    body: JSON.stringify({ rows }, null, 2),
    contentType: 'application/json',
  });
};
