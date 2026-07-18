// @ts-check
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: false, // keep false: both use cases log into the same account/session
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    // Community Edition control room URLs are account-specific (sent in your welcome email),
    // e.g. https://community.cloud.automationanywhere.digital or a communityN.cloud-N... variant.
    // Set yours in a .env file as AA_BASE_URL - do NOT hardcode/commit it.
    baseURL: process.env.AA_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
