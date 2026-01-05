# Performance Benchmarks

Playwright-based performance tests for measuring UMAP implementation performance across different releases and datasets.

## Structure

```
performance/
├── specs/              # Test specifications
│   └── example.spec.ts # Basic smoke tests
├── utils/              # Benchmark utilities (future)
└── README.md           # This file
```

## Running Tests

```bash
# Run all performance tests
yarn bench

# Run with visible browser
yarn bench:headed

# Interactive UI mode
yarn bench:ui

# Run multiple times with machine specs
yarn bench:loop         # defaults to 10 runs
RUNS=20 yarn bench:loop # customize
```

## Test Results

Results are saved to `test-results/`:
Results are saved to `performance/test-results/`:
- `bench-runs-<timestamp>.json` - Multi-run results with machine specs
- Playwright HTML reports are removed by default to avoid clutter; the runner preserves JSON output only.

## Adding New Tests

Create new spec files in `specs/`:

```typescript
import { test, expect } from '@playwright/test';

test('your test name', async ({ page }) => {
  await page.goto('/');
  // your test logic
});
```

## Machine Comparison

The `bench:loop` command captures:
- CPU model and cores
- Total memory
- OS platform and release
- Git commit and branch
- Test run durations and results

Use this data to compare performance across different machines and environments.
