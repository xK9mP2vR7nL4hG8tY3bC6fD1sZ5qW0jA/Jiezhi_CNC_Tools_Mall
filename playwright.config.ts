import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://127.0.0.1:4173", trace: "on-first-retry" },
  webServer: {
    command: "node node_modules/vite/bin/vite.js preview --host 127.0.0.1",
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: devices["iPhone 13"].userAgent,
      },
    },
  ],
});
