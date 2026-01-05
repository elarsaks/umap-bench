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
  // Use JSON reporter to keep machine-readable output and avoid HTML artifacts.
  // Configure to write JSON to stdout (no outputFile) so Playwright does not
  // create a separate `playwright-results` folder during runs — our runner
  // captures stdout and embeds the JSON into the single bench payload.
  reporter: [['json']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
