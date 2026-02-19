import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    // This repo keeps both .ts and .js side-by-side in src/.
    // Prefer TypeScript sources in tests to avoid accidentally importing
    // the JS build (which may bypass mocks).
    extensions: [
      ".ts",
      ".tsx",
      ".mts",
      ".cts",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".json",
    ],
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "prisma/",
        "**/*.spec.ts",
        "**/*.test.ts",
      ],
    },
    include: ["src/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist"],
  },
});
