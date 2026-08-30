import { defineConfig } from "vitest/config";

// No DOM here: the highlighter is a pure tokenizer.
export default defineConfig({ test: { globals: true, environment: "node" } });
