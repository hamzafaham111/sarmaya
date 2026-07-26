import { defineConfig } from "@playwright/test";

// Production server on a dedicated port: no dev single-instance lock, and it
// tests what Vercel actually serves.
const PORT = 3210;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  // One long journey test spanning phases 2-6 against a remote DB.
  timeout: 240_000,
  expect: { timeout: 20_000 },
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
