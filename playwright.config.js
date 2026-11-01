// Landing-page acceptance scenarios (Team Board TB-35), run against the
// production build. Build first: `CI=true npm run build`, then `npm run e2e`.
const { defineConfig, devices } = require('@playwright/test');

const PORT = 4173;

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1366, height: 768 },
  },
  webServer: {
    command: `node e2e/server.js`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
