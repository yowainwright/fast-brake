import { test, expect, describe } from "bun:test";
import { fastBrakeSync } from "../../src/sync";
import esversionPlugin from "../../src/plugins/esversion/schema.json";
import type { Plugin } from "../../src/types";

describe("fastBrakeSync", () => {
  test("should detect features synchronously", () => {
    const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
    const code = "const arrow = () => {}";
    const result = fb.detect(code);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe("arrow_functions");
  });

  test("should check code compatibility with target version", () => {
    const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
    const es5Code = "var x = 5;";
    const es6Code = "const arrow = () => {};";

    const es5Compatible = fb.check(es5Code, {
      target: "es5",
      sourceType: "script",
    });
    expect(es5Compatible).toBe(true);

    const es6InEs5 = fb.check(es6Code, { target: "es5", sourceType: "script" });
    expect(es6InEs5).toBe(false);

    const es6InEs6 = fb.check(es6Code, {
      target: "es2015",
      sourceType: "script",
    });
    expect(es6InEs6).toBe(true);
  });

  test("should automatically include orderedRules from plugin in check", () => {
    const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
    const code = "const arrow = () => {};";

    const isCompatible = fb.check(code, {
      target: "es2015",
      sourceType: "script",
    });
    expect(isCompatible).toBe(true);
  });

  test("should return false for incompatible features", () => {
    const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
    const asyncCode = "async function test() {}";

    const isCompatible = fb.check(asyncCode, {
      target: "es5",
      sourceType: "script",
    });
    expect(isCompatible).toBe(false);
  });

  test("should work without plugins", () => {
    const fb = fastBrakeSync();
    const code = "var x = 5;";
    const result = fb.detect(code);
    expect(result).toEqual([]);
  });

  describe("extension processing", () => {
    test("should process extensions and add to detected feature", () => {
      const mockExtension = {
        name: "test-extension",
        process: (context: any) => {
          return {
            spec: {
              customField: "value",
              line: 1,
            },
          };
        },
      };

      const fb = fastBrakeSync({
        plugins: [esversionPlugin as Plugin],
        extensions: [mockExtension],
      });

      const code = "const arrow = () => {}";
      const result = fb.detect(code);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].customField).toBe("value");
      expect(result[0].line).toBe(1);
    });

    test("should handle multiple extensions in order", () => {
      const ext1 = {
        name: "ext1",
        process: (context: any) => ({
          spec: { field1: "value1" },
        }),
      };

      const ext2 = {
        name: "ext2",
        process: (context: any) => ({
          spec: { field2: "value2" },
        }),
      };

      const fb = fastBrakeSync({
        plugins: [esversionPlugin as Plugin],
        extensions: [ext1, ext2],
      });

      const code = "const arrow = () => {}";
      const result = fb.detect(code);

      expect(result[0].field1).toBe("value1");
      expect(result[0].field2).toBe("value2");
    });

    test("should pass correct context to extensions", () => {
      let capturedContext: any;
      const mockExtension = {
        name: "test-extension",
        process: (context: any) => {
          capturedContext = context;
          return { spec: {} };
        },
      };

      const fb = fastBrakeSync({
        plugins: [esversionPlugin as Plugin],
        extensions: [mockExtension],
      });

      const code = "const arrow = () => {}";
      fb.detect(code);

      expect(capturedContext).toBeDefined();
      expect(capturedContext.code).toBe(code);
      expect(capturedContext.result).toBeDefined();
      expect(capturedContext.result.name).toBe("arrow_functions");
      expect(capturedContext.result.match).toBe("=>");
      expect(capturedContext.result.index).toBeDefined();
    });

    test("should handle extension with no spec returned", () => {
      const mockExtension = {
        name: "test-extension",
        process: (context: any) => ({
          spec: undefined,
        }),
      };

      const fb = fastBrakeSync({
        plugins: [esversionPlugin as Plugin],
        extensions: [mockExtension],
      });

      const code = "const arrow = () => {}";
      const result = fb.detect(code);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe("arrow_functions");
    });
  });

  describe("error handling", () => {
    test("should handle check errors gracefully", () => {
      const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
      const result = fb.check("const arrow = () => {}", {
        target: undefined as any,
        sourceType: "script",
      });
      expect(result).toBe(false);
    });

    test("should return empty array when no match found", () => {
      const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
      const code = "var x = 5;";
      const result = fb.detect(code);
      expect(result).toEqual([]);
    });

    test("should handle extension errors gracefully", () => {
      const errorExtension = {
        name: "error-extension",
        process: (context: any) => {
          throw new Error("Extension error");
        },
      };

      const fb = fastBrakeSync({
        plugins: [esversionPlugin as Plugin],
        extensions: [errorExtension],
      });

      const code = "const arrow = () => {}";
      expect(() => fb.detect(code)).toThrow();
    });
  });

  describe("edge cases", () => {
    test("should handle empty code string", () => {
      const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
      const result = fb.detect("");
      expect(result).toEqual([]);
    });

    test("should handle code with only whitespace", () => {
      const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
      const result = fb.detect("   \n\n\t  ");
      expect(result).toEqual([]);
    });

    test("should handle very long code strings", () => {
      const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
      const longCode = "var x = 1;\n".repeat(10000) + "const arrow = () => {}";
      const result = fb.detect(longCode);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe("arrow_functions");
    });

    test("should handle code with unicode characters", () => {
      const fb = fastBrakeSync({ plugins: [esversionPlugin as Plugin] });
      const code = "const fn = () => { return '你好世界' }";
      const result = fb.detect(code);
      expect(result.length).toBeGreaterThan(0);
    });

    test("should handle multiple plugins in array", () => {
      const fb = fastBrakeSync({
        plugins: [esversionPlugin as Plugin, esversionPlugin as Plugin],
      });
      const code = "const arrow = () => {}";
      const result = fb.detect(code);
      expect(result.length).toBeGreaterThan(0);
    });

    test("should handle empty plugins array", () => {
      const fb = fastBrakeSync({ plugins: [] });
      const code = "const arrow = () => {}";
      const result = fb.detect(code);
      expect(result).toEqual([]);
    });

    test("should handle check without orderedRules", () => {
      const pluginWithoutRules = {
        name: "test-plugin",
        spec: {
          matches: {},
        },
      } as Plugin;

      const fb = fastBrakeSync({ plugins: [pluginWithoutRules] });
      const result = fb.check("var x = 5;", {
        target: "es5",
        sourceType: "script",
      });
      expect(result).toBe(true);
    });
  });
});
