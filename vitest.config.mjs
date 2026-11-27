import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["src/**/*.test.js"],
    experimental: { viteModuleRunner: false },
    execArgv: [
      "--import",
      new URL("./scripts/test-resolver.mjs", import.meta.url).href,
    ],
  },
});
