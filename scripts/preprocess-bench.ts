import { parse as acornParse } from "acorn";
import { Detector } from "../src/detector";
import { safePreprocessor } from "../src/plugins/jscomments";
import { normalizeZeroWidth } from "../src/utils";

async function fetchCode(url: string): Promise<string> {
  const response = await fetch(url);
  return response.text();
}

async function main() {
  const code = await fetchCode("https://unpkg.com/lodash-es@4.17.21/lodash.js");
  console.log(`Code size: ${code.length} chars`);

  const warmup = 20;
  const iterations = 100;

  const detector = new Detector();
  await detector.initialize();
  const preprocessed = safePreprocessor(normalizeZeroWidth(code));

  // Warmup all code paths
  for (let i = 0; i < warmup; i++) {
    try {
      acornParse(code, { ecmaVersion: 2020, sourceType: "module" });
    } catch {}
    safePreprocessor(code);
    detector.detectFast(code);
    detector.detectFast(preprocessed, { skipPreprocess: true });
    detector.detectBoolean(preprocessed, { skipPreprocess: true });
  }

  console.log(
    `Warmup: ${warmup} iterations, Benchmark: ${iterations} iterations\n`,
  );

  // Benchmark acorn
  const acornStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    try {
      acornParse(code, { ecmaVersion: 2020, sourceType: "module" });
    } catch {}
  }
  const acornTime = (performance.now() - acornStart) / iterations;

  // Benchmark safePreprocessor
  const safeStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    safePreprocessor(code);
  }
  const safeTime = (performance.now() - safeStart) / iterations;

  // Default detectFast
  const detectStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    detector.detectFast(code);
  }
  const detectTime = (performance.now() - detectStart) / iterations;

  // With skipPreprocess
  const skipStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    detector.detectFast(preprocessed, { skipPreprocess: true });
  }
  const skipTime = (performance.now() - skipStart) / iterations;

  // detectBoolean with skipPreprocess
  const boolStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    detector.detectBoolean(preprocessed, { skipPreprocess: true });
  }
  const boolTime = (performance.now() - boolStart) / iterations;

  console.log("--- Results ---");
  console.log(
    `acorn parse:                    ${(acornTime * 1000).toFixed(0)}μs`,
  );
  console.log(
    `safePreprocessor:               ${(safeTime * 1000).toFixed(0)}μs`,
  );
  console.log(
    `detectFast (default):           ${(detectTime * 1000).toFixed(0)}μs`,
  );
  console.log(
    `detectFast (skipPreprocess):    ${(skipTime * 1000).toFixed(1)}μs`,
  );
  console.log(
    `detectBoolean (skipPreprocess): ${(boolTime * 1000).toFixed(1)}μs`,
  );

  console.log("\n--- Performance vs Acorn ---");
  console.log(
    `acorn:                          ${(acornTime * 1000).toFixed(0)}μs (baseline)`,
  );
  console.log(
    `fast-brake default:             ${(detectTime * 1000).toFixed(0)}μs (${(acornTime / detectTime).toFixed(1)}x faster)`,
  );
  console.log(
    `fast-brake skip:                ${(skipTime * 1000).toFixed(1)}μs (${(acornTime / skipTime).toFixed(0)}x faster)`,
  );
  console.log(
    `fast-brake boolean+skip:        ${(boolTime * 1000).toFixed(1)}μs (${(acornTime / boolTime).toFixed(0)}x faster)`,
  );
  console.log(
    `preprocess + boolean+skip:      ${((safeTime + boolTime) * 1000).toFixed(0)}μs (${(acornTime / (safeTime + boolTime)).toFixed(1)}x faster)`,
  );
}

main();
