import { defineConfig } from "tsup";

export default defineConfig([
  // Library (public API) — dual CJS + ESM
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    splitting: false,
    treeshake: true,
  },
  // CLI entry point — CJS (for maximum compatibility with commander + Node builtins)
  {
    entry: ["src/cli/index.ts"],
    format: ["cjs"],
    outDir: "dist/cli",
    banner: {
      js: "#!/usr/bin/env node",
    },
    sourcemap: true,
    splitting: false,
    treeshake: true,
  },
]);
