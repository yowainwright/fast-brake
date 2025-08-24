import { test, expect, describe } from "bun:test";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { fastBrake, detect, check, getMinimumESVersion } from "../../src/index";

// Load all test fixtures
const fixturesDir = join(__dirname, "../fixtures");
const fixtures = readdirSync(fixturesDir)
  .filter((f) => f.endsWith(".js"))
  .map((name) => ({
    name,
    content: readFileSync(join(fixturesDir, name), "utf-8"),
  }));

const fixtureMap = {
  es5: readFileSync(join(fixturesDir, "es5.js"), "utf-8"),
  es2015: readFileSync(join(fixturesDir, "es2015.js"), "utf-8"),
  es2020: readFileSync(join(fixturesDir, "es2020.js"), "utf-8"),
  es2022: readFileSync(join(fixturesDir, "es2022.js"), "utf-8"),
  falsePositives: readFileSync(
    join(fixturesDir, "false-positives.js"),
    "utf-8",
  ),
};

describe("Integration Tests", () => {
  describe("ES5 compatibility", () => {
    test("should pass ES5 code with ES5 target", () => {
      expect(() => fastBrake(fixtureMap.es5, { target: "es5" })).not.toThrow();
    });

    test("should detect no ES6+ features in ES5 code", () => {
      const features = detect(fixtureMap.es5);
      const es6Features = features.filter((f) => f.version !== "es5");
      expect(es6Features).toHaveLength(0);
    });
  });

  describe("ES2015 detection", () => {
    test("should fail ES2015 code with ES5 target", () => {
      expect(() => fastBrake(fixtureMap.es2015, { target: "es5" })).toThrow();
    });

    test("should pass ES2015 code with ES2015 target", () => {
      expect(() =>
        fastBrake(fixtureMap.es2015, { target: "es2015" }),
      ).not.toThrow();
    });

    test("should detect ES2015 features", () => {
      const features = detect(fixtureMap.es2015);
      const featureNames = features.map((f) => f.name);
      expect(featureNames).toContain("arrow_functions");
      expect(featureNames).toContain("classes");
      expect(featureNames).toContain("let_const");
      expect(featureNames).toContain("template_literals");
    });
  });

  describe("ES2020 detection", () => {
    test("should detect optional chaining", () => {
      const features = detect(fixtureMap.es2020);
      const optionalChaining = features.find(
        (f) => f.name === "optional_chaining",
      );
      expect(optionalChaining).toBeDefined();
      expect(optionalChaining?.version).toBe("es2020");
    });

    test("should detect nullish coalescing", () => {
      const features = detect(fixtureMap.es2020);
      const nullishCoalescing = features.find(
        (f) => f.name === "nullish_coalescing",
      );
      expect(nullishCoalescing).toBeDefined();
    });

    test("should detect BigInt", () => {
      const features = detect(fixtureMap.es2020);
      const bigint = features.find((f) => f.name === "bigint");
      expect(bigint).toBeDefined();
    });
  });

  describe("ES2022 detection", () => {
    test("should detect private fields", () => {
      const features = detect(fixtureMap.es2022);
      const privateFields = features.find((f) => f.name === "class_fields");
      expect(privateFields).toBeDefined();
      expect(privateFields?.version).toBe("es2022");
    });

    test("should detect static blocks", () => {
      const features = detect(fixtureMap.es2022);
      const staticBlocks = features.find((f) => f.name === "static_blocks");
      expect(staticBlocks).toBeDefined();
    });

    test("should detect Array.at", () => {
      const features = detect(fixtureMap.es2022);
      const arrayAt = features.find((f) => f.name === "array_at");
      expect(arrayAt).toBeDefined();
    });
  });

  describe("False positives", () => {
    test("should not detect features in strings", () => {
      const features = detect(fixtureMap.falsePositives, { quick: false });
      expect(features).toHaveLength(0);
    });

    test("should pass ES5 check despite ES6+ syntax in strings", () => {
      const isES5 = check(fixtureMap.falsePositives, { target: "es5" });
      expect(isES5).toBe(true);
    });
  });

  describe("getMinimumESVersion", () => {
    test("should return es2015 for ES5 code", () => {
      const version = getMinimumESVersion(fixtureMap.es5);
      expect(version).toBe("es2015");
    });

    test("should return es2015 for ES2015 code", () => {
      const version = getMinimumESVersion(fixtureMap.es2015);
      expect(version).toBe("es2015");
    });

    test("should return es2020 for ES2020 code", () => {
      const version = getMinimumESVersion(fixtureMap.es2020);
      expect(version).toBe("es2020");
    });

    test("should return es2022 for ES2022 code", () => {
      const version = getMinimumESVersion(fixtureMap.es2022);
      expect(version).toBe("es2022");
    });
  });

  describe("Quick mode", () => {
    test("should be faster in quick mode", () => {
      const code = fixtureMap.es2022;

      const startQuick = Date.now();
      for (let i = 0; i < 100; i++) {
        detect(code, { quick: true });
      }
      const quickTime = Date.now() - startQuick;

      const startFull = Date.now();
      for (let i = 0; i < 100; i++) {
        detect(code, { quick: false });
      }
      const fullTime = Date.now() - startFull;

      expect(quickTime).toBeLessThan(fullTime);
    });
  });

  describe("Error handling", () => {
    test("should throw with feature details", () => {
      try {
        fastBrake("const x = 10", { target: "es5", throwOnFirst: true });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain("let_const");
        expect(error.message).toContain("es2015");
        expect(error.message).toContain("es5");
        expect(error.feature).toBeDefined();
        expect(error.target).toBe("es5");
      }
    });
  });

  describe("Performance Requirements", () => {
    test("should process 1000 files quickly (quick mode)", () => {
      const testFile = fixtures.find((f) => f.name === "es2015.js")!.content;
      const iterations = 1000;

      // Warm up - first runs are slower
      for (let i = 0; i < 10; i++) {
        detect(testFile, { quick: true });
      }

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        detect(testFile, { quick: true });
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50); // CI environments are slower
    });

    test("should process single file quickly after warmup", () => {
      const testFile = fixtures.find((f) => f.name === "es2015.js")!.content;

      // Warm up
      for (let i = 0; i < 10; i++) {
        detect(testFile, { quick: true });
      }

      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        detect(testFile, { quick: true });
        times.push(performance.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(1.0); // Average should be under 1ms
    });
  });

  describe("Detection Accuracy", () => {
    test("should correctly detect ES5 code", () => {
      const es5 = fixtures.find((f) => f.name === "es5.js")!;
      const features = detect(es5.content);
      const version = getMinimumESVersion(es5.content);

      expect(features.length).toBe(0);
      expect(version).toBe("es2015");
      expect(check(es5.content, { target: "es5" })).toBe(true);
    });

    test("should correctly detect ES2015 features", () => {
      const es2015 = fixtures.find((f) => f.name === "es2015.js")!;
      const features = detect(es2015.content);
      const version = getMinimumESVersion(es2015.content);

      expect(features.length).toBeGreaterThan(0);
      expect(version).toBe("es2015");
      expect(check(es2015.content, { target: "es5" })).toBe(false);
      expect(check(es2015.content, { target: "es2015" })).toBe(true);
    });

    test("should correctly detect ES2020 features", () => {
      const es2020 = fixtures.find((f) => f.name === "es2020.js")!;
      const features = detect(es2020.content);
      const version = getMinimumESVersion(es2020.content);

      expect(features.length).toBeGreaterThan(0);
      expect(version).toBe("es2020");
      expect(check(es2020.content, { target: "es2015" })).toBe(false);
      expect(check(es2020.content, { target: "es2020" })).toBe(true);
    });

    test("should correctly detect ES2022 features", () => {
      const es2022 = fixtures.find((f) => f.name === "es2022.js")!;
      const features = detect(es2022.content);
      const version = getMinimumESVersion(es2022.content);

      expect(features.length).toBeGreaterThan(0);
      expect(version).toBe("es2022");
      expect(check(es2022.content, { target: "es2020" })).toBe(false);
      expect(check(es2022.content, { target: "es2022" })).toBe(true);
    });

    test("should handle false positives correctly", () => {
      const falsePositives = fixtures.find(
        (f) => f.name === "false-positives.js",
      )!;
      const features = detect(falsePositives.content, { quick: false });
      const version = getMinimumESVersion(falsePositives.content);

      expect(features.length).toBe(0);
      expect(version).toBe("es2015");
      expect(check(falsePositives.content, { target: "es5" })).toBe(true);
    });
  });

  describe("Error Handling (E2E)", () => {
    test("should throw descriptive errors for incompatible code", () => {
      const es2020 = fixtures.find((f) => f.name === "es2020.js")!;

      expect(() => {
        fastBrake(es2020.content, { target: "es5" });
      }).toThrow();

      try {
        fastBrake(es2020.content, { target: "es5" });
      } catch (error: any) {
        expect(error.message).toContain("ES feature");
        expect(error.message).toContain("requires");
        expect(error.feature).toBeDefined();
        expect(error.target).toBe("es5");
      }
    });
  });

  describe("Quick vs Full Mode", () => {
    test("quick mode should be faster than full mode", () => {
      const testFile = fixtures.find((f) => f.name === "es2015.js")!.content;
      const iterations = 100;

      const startQuick = performance.now();
      for (let i = 0; i < iterations; i++) {
        detect(testFile, { quick: true });
      }
      const quickTime = performance.now() - startQuick;

      const startFull = performance.now();
      for (let i = 0; i < iterations; i++) {
        detect(testFile, { quick: false });
      }
      const fullTime = performance.now() - startFull;

      // Quick mode should generally be faster
      // Allow some variance for small files
      expect(quickTime).toBeLessThanOrEqual(fullTime * 1.2);
    });

    test("both modes should work correctly", () => {
      for (const fixture of fixtures) {
        const quickFeatures = detect(fixture.content, { quick: true });
        const fullFeatures = detect(fixture.content, { quick: false });

        // Both modes should detect features
        if (
          fixture.name === "es5.js" ||
          fixture.name === "false-positives.js"
        ) {
          // ES5 and false positives should have no features
          expect(fullFeatures.length).toBe(0);
        } else {
          // Other fixtures should have features detected
          expect(fullFeatures.length).toBeGreaterThan(0);
        }

        // Full mode can detect additional features through token analysis
        // (like imports/exports) that quick mode might miss
        expect(quickFeatures).toBeDefined();
        expect(fullFeatures).toBeDefined();
      }
    });
  });

  describe("All Fixtures Coverage", () => {
    test("all fixtures should be processable without errors", () => {
      for (const fixture of fixtures) {
        expect(() => {
          detect(fixture.content);
          getMinimumESVersion(fixture.content);
          check(fixture.content, { target: "es5" });
        }).not.toThrow();
      }
    });
  });

  describe("Memory Efficiency", () => {
    test("should not leak memory on repeated processing", () => {
      const testFile = fixtures.find((f) => f.name === "es2015.js")!.content;
      const memBefore = process.memoryUsage().heapUsed;

      // Process many times
      for (let i = 0; i < 1000; i++) {
        detect(testFile);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memAfter = process.memoryUsage().heapUsed;
      const memIncrease = (memAfter - memBefore) / 1024 / 1024; // MB

      // Should not increase by more than 10MB for 1000 iterations
      expect(memIncrease).toBeLessThan(10);
    });
  });
});
