import { test, expect } from '@playwright/test';

test('app loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loaded
  await expect(page.locator('#root')).toBeVisible();
  
  // Check for main heading or controls
  await expect(page.locator('text=Benchmark Configuration')).toBeVisible();
});

test('can click Run Benchmark button', async ({ page }) => {
  await page.goto('/');
  
  const runButton = page.locator('button:has-text("Run Benchmark")');
  await expect(runButton).toBeVisible();
  await expect(runButton).toBeEnabled();
});
