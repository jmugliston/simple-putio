import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: "./",
        },
        {
          src: "assets/icons",
          dest: "./",
        },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        worker: resolve(__dirname, "/src/service-worker.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "worker") {
            return "service-worker.js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["src/setupTest.ts"],
    onConsoleLog(log) {
      if (log.includes("Warning: react-modal: App element is not defined.")) {
        return false;
      }
      if (log.includes("Could not find icon")) {
        return false;
      }
    },
    coverage: {
      include: ["src/**/*"],
      exclude: ["src/service-worker.ts", "src/main.tsx"],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 85,
        lines: 95,
      },
    },
  },
});
