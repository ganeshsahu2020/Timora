// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

const PORT = 5161;
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'tests',
  timeout: 90_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: BASE,                 // all page.goto('/') hits http://localhost:5161
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Auto-start your dev server on port 5161 (and fail if it's taken)
  webServer: {
    command: 'npm run dev -- --port 5161 --strictPort',
    url: BASE,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],

  retries: 1,
  fullyParallel: true,
  workers: '50%',
});
