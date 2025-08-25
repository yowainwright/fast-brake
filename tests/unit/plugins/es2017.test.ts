import { describe, test, expect } from "bun:test";
import {
  es2017Plugin,
  es2017,
  es8Plugin,
  es8,
} from "../../../src/plugins/es2017";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2017/constants";

describe("ES2017 Plugin", () => {
  test("should export es2017Plugin", () => {
    expect(es2017Plugin).toBeDefined();
    expect(es2017Plugin.name).toBe("es-version-es2017");
    expect(es2017Plugin.patterns).toBeDefined();
    expect(es2017Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es8Plugin).toBe(es2017Plugin);
    expect(es8).toBe(es2017Plugin);
    expect(es2017).toBe(es2017Plugin);
  });

  test("should filter features newer than ES2017", () => {
    const matches = [
      { name: "async_await", message: "", line: 1, column: 1 },
      { name: "async_iteration", message: "", line: 2, column: 1 },
      { name: "optional_chaining", message: "", line: 3, column: 1 },
    ];

    const filtered = es2017Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(2);
    expect(filtered.some((m) => m.name === "async_iteration")).toBe(true);
    expect(filtered.some((m) => m.name === "optional_chaining")).toBe(true);
    expect(filtered.some((m) => m.name === "async_await")).toBe(false);
  });

  test("should allow ES2017 and earlier features", () => {
    const matches = [
      { name: "async_await", message: "", line: 1, column: 1 },
      { name: "exponentiation", message: "", line: 2, column: 1 },
      { name: "arrow_functions", message: "", line: 3, column: 1 },
    ];

    const filtered = es2017Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2017Plugin.patterns.find(
      (p) => p.name === "async_iteration",
    );
    expect(pattern?.message).toContain("es2018");
    expect(pattern?.message).toContain("es2017");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2017")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2017Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
