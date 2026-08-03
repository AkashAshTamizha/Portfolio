import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.js"],
      exclude: [
        "src/server.js",
        "src/config/**",
        "src/migrations/**",
        "src/utils/seedAdmin.js",
      ],
      // Coverage is measured and uploaded, but not yet enforced as a gate.
      // Raise these as real test coverage grows, then flip
      // `thresholds.autoUpdate`/CI behavior to fail the build below 100%.
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
