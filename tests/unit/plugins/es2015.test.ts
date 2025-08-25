import { describe, test, expect } from "bun:test";
import { es2015Plugin, es2015StrictPlugin } from "../../../src/plugins/es2015";
import { POST_ES2015_PATTERNS } from "../../../src/plugins/es2015/constants";

describe("ES2015 Plugin", () => {
  test("should export es2015Plugin", () => {
    expect(es2015Plugin).toBeDefined();
    expect(es2015Plugin.name).toBe("es2015-baseline");
    expect(es2015Plugin.patterns).toBeDefined();
    expect(es2015Plugin.patterns.length).toBeGreaterThan(0);
  });

  test("should export es2015StrictPlugin", () => {
    expect(es2015StrictPlugin).toBeDefined();
    expect(es2015StrictPlugin.name).toBe("es2015-strict");
    expect(es2015StrictPlugin.patterns).toBeDefined();
  });

  test("should have warning severity in baseline plugin", () => {
    const warningPatterns = es2015Plugin.patterns.filter(
      (p) => p.severity === "warning",
    );
    const infoPatterns = es2015Plugin.patterns.filter(
      (p) => p.severity === "info",
    );
    expect(warningPatterns.length).toBeGreaterThan(0);
    expect(infoPatterns.length).toBeGreaterThan(0);
  });

  test("should have error severity in strict plugin", () => {
    const errorPatterns = es2015StrictPlugin.patterns.filter(
      (p) => p.severity === "error",
    );
    expect(errorPatterns.length).toBe(es2015StrictPlugin.patterns.length);
  });

  test("should detect ES2016+ features", () => {
    const patterns = es2015Plugin.patterns;

    // ES2016
    expect(patterns.some((p) => p.name === "exponentiation")).toBe(true);

    // ES2017
    expect(patterns.some((p) => p.name === "async_await")).toBe(true);

    // ES2020
    expect(patterns.some((p) => p.name === "optional_chaining")).toBe(true);
    expect(patterns.some((p) => p.name === "nullish_coalescing")).toBe(true);

    // ES2022
    expect(patterns.some((p) => p.name === "class_fields")).toBe(true);
    expect(patterns.some((p) => p.name === "static_blocks")).toBe(true);
  });

  test("should have correct pattern messages", () => {
    const optionalChaining = es2015Plugin.patterns.find(
      (p) => p.name === "optional_chaining",
    );
    expect(optionalChaining?.message).toContain("ES2020");

    const asyncAwait = es2015Plugin.patterns.find(
      (p) => p.name === "async_await",
    );
    expect(asyncAwait?.message).toContain("ES2017");
  });

  test("should export constants", () => {
    expect(POST_ES2015_PATTERNS).toBeDefined();
    expect(POST_ES2015_PATTERNS.length).toBeGreaterThan(0);
    expect(POST_ES2015_PATTERNS[0].name).toBeDefined();
    expect(POST_ES2015_PATTERNS[0].pattern).toBeDefined();
    expect(POST_ES2015_PATTERNS[0].message).toBeDefined();
    expect(POST_ES2015_PATTERNS[0].severity).toBeDefined();
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2015Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });

  test("should match actual ES2016+ code", () => {
    const exponentiation = es2015Plugin.patterns.find(
      (p) => p.name === "exponentiation",
    );
    expect(exponentiation?.pattern.test("2 ** 3")).toBe(true);

    const asyncAwait = es2015Plugin.patterns.find(
      (p) => p.name === "async_await",
    );
    expect(asyncAwait?.pattern.test("async function test() {}")).toBe(true);
    expect(asyncAwait?.pattern.test("await promise")).toBe(true);

    const optionalChaining = es2015Plugin.patterns.find(
      (p) => p.name === "optional_chaining",
    );
    expect(optionalChaining?.pattern.test("obj?.property")).toBe(true);
  });
});
