/**
 * Syncs the getContextAtIndex implementation from fast-brake's validators
 * to the @fast-brake/skip-comments package.
 *
 * This ensures both implementations stay in sync while keeping fast-brake
 * dependency-free.
 *
 * Usage: bun scripts/sync-skip-comments.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");
const VALIDATORS_PATH = join(ROOT, "src/brake/validators.ts");
const SKIP_COMMENTS_PATH = join(
  ROOT,
  "preprocessors/skip-comments/src/index.ts",
);

function extractGetContextAtIndex(source: string): string {
  const typeDefMatch = source.match(/type ContextType = [^;]+;/);
  if (!typeDefMatch) {
    throw new Error("Could not find ContextType definition");
  }

  const funcStartMarker = "/**\n * Scans code up to the given index";
  const funcStart = source.indexOf(funcStartMarker);
  if (funcStart === -1) {
    throw new Error("Could not find getContextAtIndex function start");
  }

  const funcEndMarker = "\n}\n\nexport function isInsideComment";
  const funcEnd = source.indexOf(funcEndMarker);
  if (funcEnd === -1) {
    throw new Error("Could not find getContextAtIndex function end");
  }

  const funcBody = source.substring(funcStart, funcEnd + 2);
  return `${typeDefMatch[0]}\n\n${funcBody}`;
}

function updateSkipComments(extracted: string): void {
  const skipCommentsSource = readFileSync(SKIP_COMMENTS_PATH, "utf-8");

  const headerEnd = skipCommentsSource.indexOf("type ContextType");
  if (headerEnd === -1) {
    throw new Error("Could not find ContextType in skip-comments");
  }

  const exportStart = skipCommentsSource.indexOf(
    "\n/**\n * Checks if the given index is inside any type of comment",
  );
  if (exportStart === -1) {
    throw new Error("Could not find isInsideComment export in skip-comments");
  }

  const header = skipCommentsSource.substring(0, headerEnd);
  const exports = skipCommentsSource.substring(exportStart);

  const newSource = `${header}${extracted}\n${exports}`;
  writeFileSync(SKIP_COMMENTS_PATH, newSource);
}

function main(): void {
  console.log("Reading validators.ts...");
  const validatorsSource = readFileSync(VALIDATORS_PATH, "utf-8");

  console.log("Extracting getContextAtIndex...");
  const extracted = extractGetContextAtIndex(validatorsSource);

  console.log("Updating skip-comments package...");
  updateSkipComments(extracted);

  console.log("Done! Run tests to verify:");
  console.log("  bun test preprocessors/skip-comments");
  console.log("  bun test tests/unit");
}

main();
