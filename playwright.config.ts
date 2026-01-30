import { defineConfig, devices } from '@playwright/test';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Keep Playwright artifacts out of the repo by writing them to an OS temp folder.
const outputDir = join(tmpdir(), 'umap-bench-playwright-output');

export default defineConfig({
  testDir: './bench',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  outputDir,
  // Use line reporter for live progress and JSON reporter for machine output.
  reporter: [
    ['line'],
    ['json', { outputFile: join(outputDir, 'results.json') }],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: {
      args: ['--enable-precise-memory-info'],
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn preview --host 0.0.0.0 --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
