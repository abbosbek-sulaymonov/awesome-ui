import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      // Tests live outside src now, so nothing test-shaped can reach the
      // published types in the first place.
      include: ["src"],
      exclude: ["src/**/*.stories.tsx"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  css: {
    modules: {
      // Readable in devtools, collision-proof in the wild.
      generateScopedName: "aui-[local]-[hash:base64:5]",
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    // One stylesheet, one import for the consumer.
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
      output: {
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith(".css") ? "styles.css" : "[name][extname]",
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: true,
  },
});
