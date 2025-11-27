import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Mobile first - test mobile before desktop
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['iPhone 13 Pro'],
        viewport: { width: 390, height: 844 }
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13 Pro'],
        browserName: 'webkit',
      },
    },
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
