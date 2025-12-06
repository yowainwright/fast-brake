import { test, expect, describe, beforeEach } from "bun:test";
import { Detector } from "../../src/detector";
import type { DetectionOptions } from "../../src/types";

describe("Detector", () => {
  let detector: Detector;

  beforeEach(async () => {
    detector = new Detector();
    await detector.initialize();
  });

  describe("detectBoolean", () => {
    test("should return true when no ES features detected", () => {
      const result = detector.detectBoolean("var x = 5");
      expect(result).toBe(false);
    });

    test("should return true when arrow function detected", () => {
      const result = detector.detectBoolean("const fn = () => {}");
      expect(result).toBe(true);
    });

    test("should skip pattern detection for tiny files", () => {
      const tinyCode = "x";
      const result = detector.detectBoolean(tinyCode);
      expect(result).toBe(false);
    });

    test("should detect template literals quickly", () => {
      const result = detector.detectBoolean("const str = `hello`");
      expect(result).toBe(true);
    });
  });

  describe("detectFast", () => {
    test("should return first match with basic info", () => {
      const code = "var fn = () => {}; var str = `hello`";
      const result = detector.detectFast(code);

      expect(result.hasMatch).toBe(true);
      expect(result.mode).toBe("fast");
      expect(result.firstMatch?.name).toBe("arrow_functions");
      expect(result.firstMatch?.rule).toBeDefined();
      expect(result.firstMatch?.index).toBeDefined();
    });

    test("should return no match for ES5 code", () => {
      const result = detector.detectFast("var x = function() {}");
      expect(result.hasMatch).toBe(false);
    });

    test("should detect async/await", () => {
      const code = "async function test() { await promise }";
      const result = detector.detectFast(code);

      expect(result.hasMatch).toBe(true);
      expect(result.firstMatch?.name).toBe("async_function");
    });
  });

  describe("detectDetailed", () => {
    test("should include match index and text", () => {
      const code = "var fn = () => {}";
      const result = detector.detectDetailed(code);

      expect(result.hasMatch).toBe(true);
      expect(result.mode).toBe("detailed");
      expect(result.firstMatch?.name).toBe("arrow_functions");
      expect(result.firstMatch?.index).toBeDefined();
      expect(result.firstMatch?.match).toBe("=>");
    });

    test("should find first string match with position", () => {
      const code = "console.log(`template`)";
      const result = detector.detectDetailed(code);

      expect(result.hasMatch).toBe(true);
      expect(result.firstMatch?.name).toBe("template_literals");
      expect(result.firstMatch?.index).toBe(12);
      expect(result.firstMatch?.match).toBe("`");
    });
  });

  describe("detect with modes", () => {
    test("should use fast mode by default", () => {
      const result = detector.detect("const fn = () => {}");
      expect(result.mode).toBe("fast");
    });

    test("should respect mode parameter", () => {
      const boolResult = detector.detect("() => {}", "boolean");
      expect(boolResult.mode).toBe("boolean");
      expect(boolResult.hasMatch).toBe(true);

      const detailedResult = detector.detect("() => {}", "detailed");
      expect(detailedResult.mode).toBe("detailed");
      expect(detailedResult.firstMatch?.index).toBeDefined();
    });
  });

  describe("detectFile", () => {
    test("should detect from file content", () => {
      const testFile = "/tmp/test-detect.js";
      require("fs").writeFileSync(testFile, "var x = () => {}");

      const result = detector.detectFile(testFile);
      expect(result.hasMatch).toBe(true);
      expect(result.firstMatch?.name).toBe("arrow_functions");

      require("fs").unlinkSync(testFile);
    });

    test("should handle non-existent files", () => {
      const result = detector.detectFile("/non/existent/file.js");
      expect(result.hasMatch).toBe(false);
    });
  });

  describe("check", () => {
    test("should return true for compatible code", () => {
      const options: DetectionOptions = {
        target: "es2015",
        throwOnFirst: false,
      };
      const result = detector.check("var x = 5;", options);
      expect(result).toBe(true);
    });

    test("should return false for incompatible code", () => {
      const options: DetectionOptions = { target: "es5", throwOnFirst: false };
      const result = detector.check("const x = () => {}", options);
      expect(result).toBe(false);
    });
  });

  describe("pattern detection optimization", () => {
    test("should skip patterns for files without complexity indicators", () => {
      const simpleCode =
        "var x = 5; var y = 10; function add(a, b) { return a + b }";
      const result = detector.detectFast(simpleCode);
      expect(result.hasMatch).toBe(false);
    });

    test("should run patterns when complexity indicators present", () => {
      const complexCode = "class MyClass extends Base { async method() {} }";
      const result = detector.detectFast(complexCode);
      expect(result.hasMatch).toBe(true);
    });
  });

  describe("findFirstStringMatch with multiple patterns", () => {
    test("should find first pattern across multiple feature sets", () => {
      const code = "var fn = () => {}; var str = `template`;";
      const result = detector.detectFast(code);
      expect(result.hasMatch).toBe(true);
      expect(result.firstMatch?.name).toBe("arrow_functions");
    });

    test("should handle code with no matches", () => {
      const code = "var x = 5; function test() { return x; }";
      const result = detector.detectFast(code);
      expect(result.hasMatch).toBe(false);
    });

    test("should return first match when multiple patterns present", () => {
      const code = "`template` ${() => {}} class Foo {}";
      const result = detector.detectFast(code);
      expect(result.hasMatch).toBe(true);
      expect(result.firstMatch).toBeDefined();
    });

    test("should skip excluded patterns and find next valid one", () => {
      detector["featureExcludes"]["template_literals"] = ["comment_"];
      const code = "comment_`invalid`; const valid = `template`;";
      const result = detector.detectFast(code);
      expect(result.hasMatch).toBe(true);
    });
  });

  describe("detectAll", () => {
    test("should return all matches in code", () => {
      const code = "const fn = () => {}; const str = `template`; async function test() {}";
      const matches = detector.detectAll(code);

      expect(matches.length).toBeGreaterThan(1);
      const names = matches.map((m) => m.name);
      expect(names).toContain("arrow_functions");
      expect(names).toContain("template_literals");
    });

    test("should return matches sorted by index", () => {
      const code = "const fn = () => {}; const str = `template`;";
      const matches = detector.detectAll(code);

      const indices = matches.map((m) => m.index ?? 0);
      const sorted = [...indices].sort((a, b) => a - b);
      expect(indices).toEqual(sorted);
    });

    test("should return empty array for ES5 code", () => {
      const code = "var x = function() { return 5; };";
      const matches = detector.detectAll(code);

      expect(matches).toEqual([]);
    });

    test("should deduplicate matches at same position", () => {
      const code = "const x = 1;";
      const matches = detector.detectAll(code);

      const positions = matches.map((m) => `${m.name}:${m.index}`);
      const unique = [...new Set(positions)];
      expect(positions.length).toBe(unique.length);
    });

    test("should preprocess by default", () => {
      const code = 'const str = "=>"; const fn = () => {};';
      const matches = detector.detectAll(code);

      const arrowMatches = matches.filter((m) => m.name === "arrow_functions");
      expect(arrowMatches.length).toBe(1);
    });

    test("should skip preprocessing when disabled", () => {
      const code = 'const str = "=>"; const fn = () => {};';
      const matches = detector.detectAll(code, { preprocess: false });

      const arrowMatches = matches.filter((m) => m.name === "arrow_functions");
      expect(arrowMatches.length).toBe(2);
    });
  });

  describe("preprocess", () => {
    test("should strip comments and string contents", () => {
      const code = '// comment\nconst x = "test_123";';
      const processed = detector.preprocess(code);

      expect(processed).not.toContain("comment");
      expect(processed).not.toContain("test_123");
      expect(processed).toContain("const x");
    });
  });

  describe("initializeSync", () => {
    test("should initialize detector with plugin synchronously", () => {
      const newDetector = new Detector();
      const mockPlugin = {
        name: "test-plugin",
        description: "Test plugin",
        spec: {
          orderedRules: ["rule1"],
          matches: {
            test_feature: {
              rule: "rule1",
              strings: ["testPattern"],
            },
          },
        },
      };

      newDetector.initializeSync(mockPlugin);

      expect(newDetector.isInitialized()).toBe(true);
      expect(newDetector.getPlugin()).toBe(mockPlugin);
    });

    test("should only initialize once", () => {
      const newDetector = new Detector();
      const plugin1 = {
        name: "plugin1",
        description: "First plugin",
        spec: { orderedRules: [], matches: {} },
      };
      const plugin2 = {
        name: "plugin2",
        description: "Second plugin",
        spec: { orderedRules: [], matches: {} },
      };

      newDetector.initializeSync(plugin1);
      newDetector.initializeSync(plugin2);

      expect(newDetector.getPlugin()?.name).toBe("plugin1");
    });
  });

  describe("resilience", () => {
    test("should throw when detecting without initialization", () => {
      const uninitializedDetector = new Detector();
      expect(() => uninitializedDetector.detectFast("const x = 1")).toThrow(
        "Detector not initialized",
      );
    });

    test("should throw when detectBoolean called without initialization", () => {
      const uninitializedDetector = new Detector();
      expect(() => uninitializedDetector.detectBoolean("const x = 1")).toThrow(
        "Detector not initialized",
      );
    });

    test("should throw when detectAll called without initialization", () => {
      const uninitializedDetector = new Detector();
      expect(() => uninitializedDetector.detectAll("const x = 1")).toThrow(
        "Detector not initialized",
      );
    });

    test("should throw when check called without initialization", () => {
      const uninitializedDetector = new Detector();
      expect(() =>
        uninitializedDetector.check("const x = 1", { target: "es5" }),
      ).toThrow("Detector not initialized");
    });

    test("should throw on null input", () => {
      expect(() => detector.detectFast(null as unknown as string)).toThrow(
        "Code input cannot be null or undefined",
      );
    });

    test("should throw on undefined input", () => {
      expect(() => detector.detectFast(undefined as unknown as string)).toThrow(
        "Code input cannot be null or undefined",
      );
    });

    test("should throw on non-string input", () => {
      expect(() => detector.detectFast(123 as unknown as string)).toThrow(
        "Code input must be a string",
      );
    });

    test("should return error in detectFile for non-existent file", () => {
      const result = detector.detectFile("/non/existent/path/file.js");
      expect(result.hasMatch).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("ENOENT");
    });

    test("should handle plugin with invalid regex gracefully", () => {
      const badPlugin = {
        name: "bad-plugin",
        description: "Plugin with invalid regex",
        spec: {
          orderedRules: ["es2015"],
          matches: {
            bad_pattern: {
              rule: "es2015",
              patterns: [{ pattern: "[" }],
            },
          },
        },
      };

      const badDetector = new Detector();
      expect(() => badDetector.initializeSync(badPlugin)).not.toThrow();
      expect(badDetector.isInitialized()).toBe(true);
    });
  });
});
