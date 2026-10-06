import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", fullyParallel: false,
  use: { baseURL: process.env.DEMO_URL ?? "http://localhost:3000", channel: "msedge", trace: "retain-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } }],
  webServer: process.env.DEMO_URL ? undefined : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI, timeout: 120000 },
});
