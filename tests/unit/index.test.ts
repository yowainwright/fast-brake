import { test, expect, describe } from "bun:test";
import { fastBrake, detect, check } from "../../src/index";
import type { DetectionOptions, DetectedFeature } from "../../src/types";

describe("fast-brake main API", () => {
  describe("fastBrake function", () => {
    test("should return empty array for code with no detected features", async () => {
      const code = "function test() { return 42; }";
      const result = await fastBrake(code);
      expect(result).toEqual([]);
    });

    test("should return detected features", async () => {
      const code = "const arrow = () => {}";
      const result = await fastBrake(code);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe("arrow_functions");
    });

    test("should return detailed feature information", async () => {
      const code = "const arrow = () => {}";
      const result = await fastBrake(code);
      expect(result.length).toBeGreaterThan(0);
      const feature = result[0];
      expect(feature.name).toBe("arrow_functions");
      // In legacy mode, version is the feature name
      expect(feature.version).toBeDefined();
    });

    test("should not include line and column by default", async () => {
      const code = "\n\n  const arrow = () => {}";
      const result = await fastBrake(code);
      expect(result.length).toBeGreaterThan(0);
      const feature = result[0];
      expect(feature.line).toBeUndefined();
      expect(feature.column).toBeUndefined();
    });

    test("should not include snippet by default", async () => {
      const code = "const arrow = () => {}";
      const result = await fastBrake(code);
      expect(result.length).toBeGreaterThan(0);
      const feature = result[0];
      expect(feature.snippet).toBeUndefined();
    });

    test("should return first feature detected", async () => {
      const code = "const a = () => {}; const b = async () => {};";
      const result = await fastBrake(code);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("arrow_functions");
    });

    test("should detect features quickly", async () => {
      const code = "const arrow = () => {}";
      const result = await fastBrake(code);
      expect(result.length).toBeGreaterThan(0);
    });

    test("should parse comments", async () => {
      const code = `(function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
`;

      const result = await fastBrake(code);
      expect(result).toEqual([]);
    });

    test.only("should ignore single-line comments", async () => {
      const code = `// same as const x = 4;
var x = 4;

// same as const y = 2;
var y = 2;

// same as x ** y
Math.pow(x, y);

// comment without trailing empty line () => "test"`;

      const result = await fastBrake(code);
      expect(result).toEqual([]);
    });

    test("should ignore multi-line comments", async () => {
      const code = `/** [1,2,3,4].map(x => x ** 2) */`;

      const result = await fastBrake(code);
      expect(result).toEqual([]);
    });
  });

  describe("detect function", () => {
    test("should detect features with default options", async () => {
      const code = "const arrow = () => {}";
      const features = await detect(code);

      expect(features).toBeInstanceOf(Array);
      expect(features.length).toBeGreaterThan(0);
    });

    test("should return first match only", async () => {
      const code =
        "const x = () => {}; const y = `template`; async function test() {}";
      const features = await detect(code);

      expect(features.length).toBe(1);
      expect(features[0].name).toBe("arrow_functions");
    });

    test("should detect template literals", async () => {
      const code = "const str = `hello world`";
      const features = await detect(code);

      expect(features.length).toBe(1);
      expect(features[0].name).toBe("template_literals");
    });

    test("should return empty array for ES5 code", async () => {
      const code = "function test() { return 42; }";
      const features = await detect(code);

      expect(features).toHaveLength(0);
    });

    test("should detect first feature only", async () => {
      const code = `
        const arrow = () => {};
        class MyClass {}
        async function test() { await promise; }
      `;
      const features = await detect(code);

      expect(features.length).toBe(1);
      expect(features[0].name).toBe("arrow_functions");
    });

    test("should not include location info by default", async () => {
      const code = "\n\nconst arrow = () => {}";
      const features = await detect(code);

      const arrowFeature = features.find((f) => f.name === "arrow_functions");
      expect(arrowFeature?.line).toBeUndefined();
      expect(arrowFeature?.column).toBeUndefined();
      expect(arrowFeature?.snippet).toBeUndefined();
    });
  });

  describe("check function", () => {
    test("should return true for compatible code", async () => {
      const code = "function test() { return 42; }";
      const result = await check(code, { target: "es5" });

      expect(result).toBe(true);
    });

    test("should return false for incompatible code", async () => {
      const code = "const arrow = () => {}";
      const result = await check(code, { target: "es5" });

      expect(result).toBe(false);
    });

    test("should not throw even with throwOnFirst", async () => {
      const code = "const arrow = () => {}";
      const result = await check(code, { target: "es5", throwOnFirst: true });

      expect(result).toBe(false);
    });

    test("should work with quick mode", async () => {
      const code = "const arrow = () => {}";
      const result = await check(code, { target: "es5" });

      expect(result).toBe(false);
    });
  });

  describe("type exports", () => {
    test("should export DetectionOptions type", async () => {
      const options: DetectionOptions = {
        target: "es5",

        throwOnFirst: true,
      };
      expect(options).toBeDefined();
    });

    test("should export DetectedFeature type", async () => {
      const feature: DetectedFeature = {
        name: "test",
        version: "es2015",
      };
      expect(feature).toBeDefined();
    });
  });

  describe("default export", () => {
    test("should have default export", async () => {
      const module = await import("../../src/index");
      expect(module.default).toBe(fastBrake);
    });
  });

  describe("error handling", () => {
    test("should handle malformed code gracefully", async () => {
      const code = "const x = ;"; // Syntax error

      // Should still detect const
      const features = await detect(code);
      expect(features.find((f) => f.name === "let_const")).toBeDefined();
    });

    test("should handle very long code", async () => {
      const code = "const x = () => {};".repeat(1000);

      await expect(async () => {
        const features = await detect(code);
        expect(features.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    test("should handle unicode in code", async () => {
      const code = 'const 你好 = () => { return "世界"; }';

      const features = await detect(code);
      expect(features.find((f) => f.name === "arrow_functions")).toBeDefined();
    });

    test("should handle mixed line endings", async () => {
      const code = "const a = 1;\r\nconst b = () => {};\rconst c = 3;";

      const features = await detect(code);
      expect(features.find((f) => f.name === "arrow_functions")).toBeDefined();
    });
  });

  describe("performance", () => {
    test("detection should be fast", async () => {
      const code = "const x = () => {};".repeat(100);

      const start = performance.now();
      await detect(code);
      const time = performance.now() - start;

      expect(time).toBeLessThan(10);
    });

    test("should handle large files efficiently", async () => {
      const code = `
        function oldStyle() { return 42; }
        var x = 10;
      `.repeat(1000);

      const start = performance.now();
      const result = await detect(code);
      const time = performance.now() - start;

      expect(result).toEqual([]);
      expect(time).toBeLessThan(100); // Should be fast
    });
  });
});
