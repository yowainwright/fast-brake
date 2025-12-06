#!/usr/bin/env bun
import { readdirSync, renameSync } from "fs";
import { join } from "path";
import { $ } from "bun";

async function getEntries() {
  const pluginsDir = join(import.meta.dir, "../src/plugins");
  const extensionsDir = join(import.meta.dir, "../src/extensions");

  const base = ["src/index.ts", "src/sync.ts"];

  const pluginDirs = readdirSync(pluginsDir, { withFileTypes: true });
  const pluginEntries = Array.from(
    pluginDirs.filter((dir) => dir.isDirectory()),
    (dir) => `src/plugins/${dir.name}/index.ts`,
  );

  const pluginBase = ["src/plugins/index.ts", "src/plugins/loader.ts"];

  const extensionDirs = readdirSync(extensionsDir, { withFileTypes: true });
  const extensionEntries = Array.from(
    extensionDirs.filter((dir) => dir.isDirectory()),
    (dir) => `src/extensions/${dir.name}/index.ts`,
  );

  return [...base, ...pluginEntries, ...pluginBase, ...extensionEntries];
}

function renameJsToCjs(dir: string): void {
  const entries = readdirSync(dir, { withFileTypes: true });

  Array.from(entries, (entry) => {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      renameJsToCjs(fullPath);
      return;
    }

    const isChunk = entry.name.startsWith("chunk-");
    if (isChunk) return;

    const isJsFile = entry.name.endsWith(".js");
    if (isJsFile) {
      const newPath = fullPath.replace(/\.js$/, ".cjs");
      renameSync(fullPath, newPath);
      return;
    }

    const isJsMap = entry.name.endsWith(".js.map");
    if (isJsMap) {
      const newPath = fullPath.replace(/\.js\.map$/, ".cjs.map");
      renameSync(fullPath, newPath);
    }
  });
}

const entries = await getEntries();

console.log("Building ESM...");
await Bun.build({
  entrypoints: entries,
  outdir: "./dist",
  target: "node",
  format: "esm",
  splitting: false,
  minify: true,
  sourcemap: "external",
});

console.log("Building CJS...");
await Bun.build({
  entrypoints: entries,
  outdir: "./dist-cjs",
  target: "node",
  format: "cjs",
  minify: true,
  sourcemap: "external",
});

console.log("Renaming CJS files to .cjs extension...");
renameJsToCjs("./dist-cjs");

console.log("Merging CJS files with ESM...");
await $`rsync -a dist-cjs/src/ dist/src/ && rm -rf dist-cjs`;

console.log("Flattening dist structure...");
await $`rsync -a dist/src/ dist/ && rm -rf dist/src`;

console.log("Generating type declarations...");
await $`tsc --emitDeclarationOnly --declaration --outDir dist`;

console.log("✓ Build complete");
