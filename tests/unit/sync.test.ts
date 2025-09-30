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
});
