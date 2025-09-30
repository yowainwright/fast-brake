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
      const code = "const fn = () => {}; const str = `hello`";
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
      expect(result.firstMatch?.name).toBe("async_await");
    });
  });

  describe("detectDetailed", () => {
    test("should include match index and text", () => {
      const code = "const fn = () => {}";
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
      require("fs").writeFileSync(testFile, "const x = () => {}");

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

  describe("findFirstValidIndex (private method)", () => {
    test("should find first valid index when pattern appears once", () => {
      const code = "const arrow = () => {}";
      const result = detector["findFirstValidIndex"](
        code,
        "=>",
        "arrow_functions",
      );
      expect(result).toBe(17);
    });

    test("should find first non-excluded index when pattern appears multiple times", () => {
      const code = "const arrow = () => {}; const second = () => {}";
      const result = detector["findFirstValidIndex"](
        code,
        "=>",
        "arrow_functions",
      );
      expect(result).toBe(17);
    });

    test("should return -1 when pattern not found", () => {
      const code = "var x = function() {}";
      const result = detector["findFirstValidIndex"](
        code,
        "=>",
        "arrow_functions",
      );
      expect(result).toBe(-1);
    });

    test("should skip excluded occurrences and return first valid one", () => {
      const code = "// arrow => comment\nconst fn = () => {}";
      const result = detector["findFirstValidIndex"](
        code,
        "=>",
        "arrow_functions",
      );
      expect(result).toBeGreaterThan(-1);
    });

    test("should return -1 when all occurrences are excluded", () => {
      detector["featureExcludes"]["test_feature"] = ["prefix_"];
      const code = "prefix_pattern prefix_pattern";
      const result = detector["findFirstValidIndex"](
        code,
        "pattern",
        "test_feature",
      );
      expect(result).toBe(-1);
    });
  });

  describe("checkPatternMatch (private method)", () => {
    test("should return null when pattern not found", () => {
      const code = "var x = 5";
      const result = detector["checkPatternMatch"](
        code,
        "arrow_functions",
        "=>",
      );
      expect(result).toBeNull();
    });

    test("should return DetectionMatch when pattern found", () => {
      const code = "const fn = () => {}";
      const result = detector["checkPatternMatch"](
        code,
        "arrow_functions",
        "=>",
      );
      expect(result).not.toBeNull();
      expect(result?.name).toBe("arrow_functions");
      expect(result?.match).toBe("=>");
      expect(result?.index).toBe(14);
    });

    test("should return null when pattern is excluded", () => {
      detector["featureExcludes"]["test_feature"] = ["exclude_"];
      const code = "exclude_pattern";
      const result = detector["checkPatternMatch"](
        code,
        "test_feature",
        "pattern",
      );
      expect(result).toBeNull();
    });

    test("should include rule from plugin when available", () => {
      const code = "const fn = () => {}";
      const result = detector["checkPatternMatch"](
        code,
        "arrow_functions",
        "=>",
      );
      expect(result?.rule).toBeDefined();
      expect(result?.spec).toBe("esversion");
    });

    test("should use legacy mode when no plugin available", () => {
      const originalPlugin = detector["plugin"];
      detector["plugin"] = null;
      const code = "const fn = () => {}";
      const result = detector["checkPatternMatch"](
        code,
        "arrow_functions",
        "=>",
      );
      expect(result?.spec).toBe("legacy");
      expect(result?.rule).toBe("arrow_functions");
      detector["plugin"] = originalPlugin;
    });
  });

  describe("isExcluded (private method)", () => {
    test("should return false when no excludes defined", () => {
      const code = "const arrow = () => {}";
      const result = detector["isExcluded"](code, 14, "arrow_functions");
      expect(result).toBe(false);
    });

    test("should return true when context ends with exclude pattern", () => {
      detector["featureExcludes"]["test_feature"] = ["prefix_"];
      const code = "prefix_pattern";
      const result = detector["isExcluded"](code, 7, "test_feature");
      expect(result).toBe(true);
    });

    test("should return false when context does not end with exclude pattern", () => {
      detector["featureExcludes"]["test_feature"] = ["prefix_"];
      const code = "other_pattern";
      const result = detector["isExcluded"](code, 6, "test_feature");
      expect(result).toBe(false);
    });

    test("should check context within 20 characters before index", () => {
      detector["featureExcludes"]["test_feature"] = ["exclude"];
      const code = "a".repeat(50) + "exclude" + "pattern";
      const patternIndex = 57;
      const result = detector["isExcluded"](code, patternIndex, "test_feature");
      expect(result).toBe(true);
    });

    test("should handle index near beginning of string", () => {
      detector["featureExcludes"]["test_feature"] = ["ex"];
      const code = "export default";
      const result = detector["isExcluded"](code, 2, "test_feature");
      expect(result).toBe(true);
    });
  });

  describe("findFirstStringMatch with multiple patterns", () => {
    test("should find first pattern across multiple feature sets", () => {
      const code = "const fn = () => {}; const str = `template`;";
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
});
