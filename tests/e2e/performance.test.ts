import { test, expect, describe } from "bun:test";
import { Detector } from "../../src/detector";
import { esAll } from "../../src/plugins/esversion";
import { readFileSync } from "fs";
import { join } from "path";

const FIXTURES_DIR = join(__dirname, "../fixtures");

const PERFORMANCE_THRESHOLDS = {
  smallFile: {
    maxTimeMs: 0.1,
    minOpsPerSec: 100000,
  },
  mediumFile: {
    maxTimeMs: 0.5,
    minOpsPerSec: 50000,
  },
  largeFile: {
    maxTimeMs: 2,
    minOpsPerSec: 10000,
  },
  withPreprocess: {
    maxTimeMs: 1,
    minOpsPerSec: 20000,
  },
};

function readFixture(name: string): string {
  return readFileSync(join(FIXTURES_DIR, `${name}.js`), "utf-8");
}

function measurePerformance(
  detector: Detector,
  code: string,
  iterations: number,
  skipPreprocess: boolean = true,
): { avgTimeMs: number; opsPerSec: number } {
  for (let i = 0; i < 10; i++) {
    detector.detectFast(code, { skipPreprocess });
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    detector.detectFast(code, { skipPreprocess });
  }
  const totalMs = performance.now() - start;

  const avgTimeMs = totalMs / iterations;
  const opsPerSec = Math.round(1000 / avgTimeMs);

  return { avgTimeMs, opsPerSec };
}

describe("E2E: Performance Verification", () => {
  let detector: Detector;

  test("setup detector", () => {
    detector = new Detector();
    detector.initializeSync(esAll);
    expect(detector.isInitialized()).toBe(true);
  });

  describe("Small files (< 1KB)", () => {
    test("ES2015 fixture meets performance threshold", () => {
      const code = readFixture("es2015");
      const iterations = 1000;

      const { avgTimeMs, opsPerSec } = measurePerformance(
        detector,
        code,
        iterations,
      );

      expect(avgTimeMs).toBeLessThan(
        PERFORMANCE_THRESHOLDS.smallFile.maxTimeMs,
      );
      expect(opsPerSec).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.smallFile.minOpsPerSec,
      );
    });

    test("ES2020 fixture meets performance threshold", () => {
      const code = readFixture("es2020");
      const iterations = 1000;

      const { avgTimeMs, opsPerSec } = measurePerformance(
        detector,
        code,
        iterations,
      );

      expect(avgTimeMs).toBeLessThan(
        PERFORMANCE_THRESHOLDS.smallFile.maxTimeMs,
      );
      expect(opsPerSec).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.smallFile.minOpsPerSec,
      );
    });

    test("ES2022 fixture meets performance threshold", () => {
      const code = readFixture("es2022");
      const iterations = 1000;

      const { avgTimeMs, opsPerSec } = measurePerformance(
        detector,
        code,
        iterations,
      );

      expect(avgTimeMs).toBeLessThan(
        PERFORMANCE_THRESHOLDS.smallFile.maxTimeMs,
      );
      expect(opsPerSec).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.smallFile.minOpsPerSec,
      );
    });
  });

  describe("Large files (scaled 100x)", () => {
    test("100x ES2015 code meets performance threshold", () => {
      const baseCode = readFixture("es2015");
      const code = Array(100).fill(baseCode).join("\n");
      const iterations = 100;

      const { avgTimeMs, opsPerSec } = measurePerformance(
        detector,
        code,
        iterations,
      );

      expect(avgTimeMs).toBeLessThan(
        PERFORMANCE_THRESHOLDS.largeFile.maxTimeMs,
      );
      expect(opsPerSec).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.largeFile.minOpsPerSec,
      );
    });
  });

  describe("With preprocessing (comment stripping)", () => {
    test("ES2015 with preprocessing meets threshold", () => {
      const code = readFixture("es2015");
      const iterations = 1000;

      const { avgTimeMs, opsPerSec } = measurePerformance(
        detector,
        code,
        iterations,
        false,
      );

      expect(avgTimeMs).toBeLessThan(
        PERFORMANCE_THRESHOLDS.withPreprocess.maxTimeMs,
      );
      expect(opsPerSec).toBeGreaterThan(
        PERFORMANCE_THRESHOLDS.withPreprocess.minOpsPerSec,
      );
    });

    test("preprocessing is slower than no preprocessing", () => {
      const code = readFixture("es2015");
      const iterations = 500;

      const withoutPreprocess = measurePerformance(
        detector,
        code,
        iterations,
        true,
      );
      const withPreprocess = measurePerformance(
        detector,
        code,
        iterations,
        false,
      );

      expect(withoutPreprocess.opsPerSec).toBeGreaterThan(
        withPreprocess.opsPerSec,
      );
    });
  });

  describe("Relative performance vs expectations", () => {
    test("fast-brake achieves >300k ops/sec on ES2015 code", () => {
      const code = readFixture("es2015");
      const iterations = 1000;

      const { opsPerSec } = measurePerformance(detector, code, iterations);

      expect(opsPerSec).toBeGreaterThan(300000);
    });

    test("fast-brake achieves >400k ops/sec on ES2022+ code", () => {
      const code = readFixture("es2022");
      const iterations = 1000;

      const { opsPerSec } = measurePerformance(detector, code, iterations);

      expect(opsPerSec).toBeGreaterThan(400000);
    });

    test("large file (72KB) achieves >400k ops/sec", () => {
      const baseCode = readFixture("es2015");
      const code = Array(100).fill(baseCode).join("\n");
      const iterations = 100;

      const { opsPerSec } = measurePerformance(detector, code, iterations);

      expect(opsPerSec).toBeGreaterThan(400000);
    });
  });

  describe("Consistency checks", () => {
    test("repeated runs produce consistent results", () => {
      const code = readFixture("es2015");
      const iterations = 500;

      const run1 = measurePerformance(detector, code, iterations);
      const run2 = measurePerformance(detector, code, iterations);
      const run3 = measurePerformance(detector, code, iterations);

      const avgOps = (run1.opsPerSec + run2.opsPerSec + run3.opsPerSec) / 3;
      const variance1 = Math.abs(run1.opsPerSec - avgOps) / avgOps;
      const variance2 = Math.abs(run2.opsPerSec - avgOps) / avgOps;
      const variance3 = Math.abs(run3.opsPerSec - avgOps) / avgOps;

      expect(variance1).toBeLessThan(0.3);
      expect(variance2).toBeLessThan(0.3);
      expect(variance3).toBeLessThan(0.3);
    });

    test("detection accuracy is maintained at high speed", () => {
      const code = readFixture("es2015");
      const iterations = 1000;

      let hasMatchCount = 0;
      let es2015Count = 0;

      for (let i = 0; i < iterations; i++) {
        const result = detector.detectFast(code, { skipPreprocess: true });
        if (result.hasMatch) hasMatchCount++;
        if (result.firstMatch?.rule === "es2015") es2015Count++;
      }

      expect(hasMatchCount).toBe(iterations);
      expect(es2015Count).toBe(iterations);
    });
  });
});
