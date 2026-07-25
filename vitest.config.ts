import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // *.test.ts = Vitest; tests/*.spec.ts = Playwright.
    include: ["lib/**/*.test.ts", "components/**/*.test.ts"],
  },
});
