import { test, expect, describe } from "bun:test";
import { fastBrake, detect, check } from "../../src/index";
import type { DetectionOptions, DetectedFeature } from "../../src/types";

describe("fast-brake main API", () => {
  describe("fastBrake function", () => {
    test("should return empty array for code with no detected features", () => {
      const code = "function test() { return 42; }";
      const result = fastBrake(code, { target: "es5" });
      expect(result).toEqual([]);
    });

    test("should return detected features", () => {
      const code = "const arrow = () => {}";
      const result = fastBrake(code, { target: "es5" });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe("arrow_functions");
    });

    test("should return detailed feature information", () => {
      const code = "const arrow = () => {}";
      const result = fastBrake(code, { target: "es5" });
      expect(result.length).toBeGreaterThan(0);
      const feature = result[0];
      expect(feature.name).toBe("arrow_functions");
      // In legacy mode, version is the feature name
      expect(feature.version).toBeDefined();
    });

    test("should not include line and column by default", () => {
      const code = "\n\n  const arrow = () => {}";
      const result = fastBrake(code, { target: "es5" });
      expect(result.length).toBeGreaterThan(0);
      const feature = result[0];
      expect(feature.line).toBeUndefined();
      expect(feature.column).toBeUndefined();
    });

    test("should not include snippet by default", () => {
      const code = "const arrow = () => {}";
      const result = fastBrake(code, { target: "es5" });
      expect(result.length).toBeGreaterThan(0);
      const feature = result[0];
      expect(feature.snippet).toBeUndefined();
    });

    test("should return first feature detected", () => {
      const code = "const a = () => {}; const b = async () => {};";
      const result = fastBrake(code, { target: "es5" });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("arrow_functions");
    });

    test("should detect features quickly", () => {
      const code = "const arrow = () => {}";
      const result = fastBrake(code, { target: "es5" });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("detect function", () => {
    test("should detect features with default options", () => {
      const code = "const arrow = () => {}";
      const features = detect(code);

      expect(features).toBeInstanceOf(Array);
      expect(features.length).toBeGreaterThan(0);
    });

    test("should return first match only", () => {
      const code =
        "const x = () => {}; const y = `template`; async function test() {}";
      const features = detect(code);

      expect(features.length).toBe(1);
      expect(features[0].name).toBe("arrow_functions");
    });

    test("should detect template literals", () => {
      const code = "const str = `hello world`";
      const features = detect(code);

      expect(features.length).toBe(1);
      expect(features[0].name).toBe("template_literals");
    });

    test("should return empty array for ES5 code", () => {
      const code = "function test() { return 42; }";
      const features = detect(code);

      expect(features).toHaveLength(0);
    });

    test("should detect first feature only", () => {
      const code = `
        const arrow = () => {};
        class MyClass {}
        async function test() { await promise; }
      `;
      const features = detect(code);

      expect(features.length).toBe(1);
      expect(features[0].name).toBe("arrow_functions");
    });

    test("should not include location info by default", () => {
      const code = "\n\nconst arrow = () => {}";
      const features = detect(code);

      const arrowFeature = features.find((f) => f.name === "arrow_functions");
      expect(arrowFeature?.line).toBeUndefined();
      expect(arrowFeature?.column).toBeUndefined();
      expect(arrowFeature?.snippet).toBeUndefined();
    });
  });

  describe("check function", () => {
    test("should return true for compatible code", () => {
      const code = "function test() { return 42; }";
      const result = check(code, { target: "es5" });

      expect(result).toBe(true);
    });

    test("should return false for incompatible code", () => {
      const code = "const arrow = () => {}";
      const result = check(code, { target: "es5" });

      expect(result).toBe(false);
    });

    test("should not throw even with throwOnFirst", () => {
      const code = "const arrow = () => {}";
      const result = check(code, { target: "es5", throwOnFirst: true });

      expect(result).toBe(false);
    });

    test("should work with quick mode", () => {
      const code = "const arrow = () => {}";
      const result = check(code, { target: "es5" });

      expect(result).toBe(false);
    });
  });

  describe("type exports", () => {
    test("should export DetectionOptions type", () => {
      const options: DetectionOptions = {
        target: "es5",

        throwOnFirst: true,
      };
      expect(options).toBeDefined();
    });

    test("should export DetectedFeature type", () => {
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
    test("should handle malformed code gracefully", () => {
      const code = "const x = ;"; // Syntax error

      // Should still detect const
      const features = detect(code);
      expect(features.find((f) => f.name === "let_const")).toBeDefined();
    });

    test("should handle very long code", () => {
      const code = "const x = () => {};".repeat(1000);

      expect(() => {
        const features = detect(code, { quick: true });
        expect(features.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    test("should handle unicode in code", () => {
      const code = 'const 你好 = () => { return "世界"; }';

      const features = detect(code);
      expect(features.find((f) => f.name === "arrow_functions")).toBeDefined();
    });

    test("should handle mixed line endings", () => {
      const code = "const a = 1;\r\nconst b = () => {};\rconst c = 3;";

      const features = detect(code);
      expect(features.find((f) => f.name === "arrow_functions")).toBeDefined();
    });
  });

  describe("performance", () => {
    test("detection should be fast", () => {
      const code = "const x = () => {};".repeat(100);

      const start = performance.now();
      detect(code);
      const time = performance.now() - start;

      expect(time).toBeLessThan(10);
    });

    test("should handle large files efficiently", () => {
      const code = `
        function oldStyle() { return 42; }
        var x = 10;
      `.repeat(1000);

      const start = performance.now();
      const result = detect(code);
      const time = performance.now() - start;

      expect(result).toEqual([]);
      expect(time).toBeLessThan(100); // Should be fast
    });
  });
});
