import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3500',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false, // Run in headed mode
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 500, // Slow down actions by 500ms for visibility
        },
      },
    },
  ],

  // Server is already running, commenting out webServer config
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3500',
  //   reuseExistingServer: true,
  //   timeout: 120 * 1000,
  // },
});