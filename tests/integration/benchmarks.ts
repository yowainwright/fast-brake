#!/usr/bin/env node
// Benchmark fast-brake against requirements
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { detect, getMinimumESVersion } from "../src/index";

// Test fixtures
const fixturesDir = join(__dirname, "fixtures");
const files = readdirSync(fixturesDir)
  .filter((f) => f.endsWith(".js"))
  .map((f) => ({
    name: f,
    path: join(fixturesDir, f),
    content: readFileSync(join(fixturesDir, f), "utf-8"),
    size: statSync(join(fixturesDir, f)).size,
  }));

console.log("🚀 Fast-Brake Performance Benchmark\n");
console.log("Files:", files.map((f) => f.name).join(", "));
console.log("-----------------------------------\n");

// Single file benchmarks
console.log("📄 Single File Performance:");
for (const file of files) {
  const iterations = 1000;

  // Quick mode
  const startQuick = Date.now();
  for (let i = 0; i < iterations; i++) {
    detect(file.content, { target: "es2015" });
  }
  const quickTime = Date.now() - startQuick;
  const quickPerFile = quickTime / iterations;

  // Full mode
  const startFull = Date.now();
  for (let i = 0; i < iterations; i++) {
    detect(file.content, { target: "es2015" });
  }
  const fullTime = Date.now() - startFull;
  const fullPerFile = fullTime / iterations;

  console.log(`  ${file.name} (${file.size} bytes):`);
  console.log(`    Quick mode: ${quickPerFile.toFixed(3)}ms per file`);
  console.log(`    Full mode:  ${fullPerFile.toFixed(3)}ms per file`);
}

// Batch processing benchmark
console.log("\n📦 Batch Processing (1000 files):");
const batchSize = 1000;
const testFile = files[1].content; // Use ES2015 fixture

const startBatchQuick = Date.now();
for (let i = 0; i < batchSize; i++) {
  getMinimumESVersion(testFile, { quick: true });
}
const batchQuickTime = Date.now() - startBatchQuick;

const startBatchFull = Date.now();
for (let i = 0; i < batchSize; i++) {
  getMinimumESVersion(testFile, { quick: false });
}
const batchFullTime = Date.now() - startBatchFull;

console.log(
  `  Quick mode: ${batchQuickTime}ms total (${(batchQuickTime / batchSize).toFixed(3)}ms per file)`,
);
console.log(
  `  Full mode:  ${batchFullTime}ms total (${(batchFullTime / batchSize).toFixed(3)}ms per file)`,
);

// Performance requirements check
console.log("\n✅ Performance Requirements:");
const requirement = 15; // 15ms for 1000 files
const requirementPerFile = 0.5; // 0.5ms per file

if (batchQuickTime < requirement) {
  console.log(
    `  ✓ 1000 files in ${batchQuickTime}ms < ${requirement}ms requirement`,
  );
} else {
  console.log(
    `  ✗ 1000 files in ${batchQuickTime}ms > ${requirement}ms requirement`,
  );
}

const avgQuickTime = batchQuickTime / batchSize;
if (avgQuickTime < requirementPerFile) {
  console.log(
    `  ✓ Single file in ${avgQuickTime.toFixed(3)}ms < ${requirementPerFile}ms requirement`,
  );
} else {
  console.log(
    `  ✗ Single file in ${avgQuickTime.toFixed(3)}ms > ${requirementPerFile}ms requirement`,
  );
}

// Memory usage
const memUsage = process.memoryUsage();
console.log("\n💾 Memory Usage:");
console.log(`  Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`  RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);

// Feature detection accuracy
console.log("\n🎯 Detection Accuracy:");
for (const file of files) {
  const features = detect(file.content);
  const minVersion = getMinimumESVersion(file.content);
  console.log(
    `  ${file.name}: ${features.length} features detected, minimum version: ${minVersion}`,
  );
}
