import { describe, test, expect } from "bun:test";
import {
  es2016Plugin,
  es2016,
  es7Plugin,
  es7,
} from "../../../src/plugins/es2016";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2016/constants";

describe("ES2016 Plugin", () => {
  test("should export es2016Plugin", () => {
    expect(es2016Plugin).toBeDefined();
    expect(es2016Plugin.name).toBe("es-version-es2016");
    expect(es2016Plugin.patterns).toBeDefined();
    expect(es2016Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es7Plugin).toBe(es2016Plugin);
    expect(es7).toBe(es2016Plugin);
    expect(es2016).toBe(es2016Plugin);
  });

  test("should filter features newer than ES2016", () => {
    const matches = [
      { name: "exponentiation", message: "", line: 1, column: 1 },
      { name: "async_await", message: "", line: 2, column: 1 },
      { name: "optional_chaining", message: "", line: 3, column: 1 },
    ];

    const filtered = es2016Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(2);
    expect(filtered.some((m) => m.name === "async_await")).toBe(true);
    expect(filtered.some((m) => m.name === "optional_chaining")).toBe(true);
    expect(filtered.some((m) => m.name === "exponentiation")).toBe(false);
  });

  test("should allow ES2016 and earlier features", () => {
    const matches = [
      { name: "exponentiation", message: "", line: 1, column: 1 },
      { name: "arrow_functions", message: "", line: 2, column: 1 },
      { name: "classes", message: "", line: 3, column: 1 },
    ];

    const filtered = es2016Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2016Plugin.patterns.find((p) => p.name === "async_await");
    expect(pattern?.message).toContain("es2017");
    expect(pattern?.message).toContain("es2016");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2016")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2016Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
