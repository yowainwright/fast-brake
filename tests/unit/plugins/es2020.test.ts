import { describe, test, expect } from "bun:test";
import {
  es2020Plugin,
  es2020,
  es11Plugin,
  es11,
} from "../../../src/plugins/es2020";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2020/constants";

describe("ES2020 Plugin", () => {
  test("should export es2020Plugin", () => {
    expect(es2020Plugin).toBeDefined();
    expect(es2020Plugin.name).toBe("es-version-es2020");
    expect(es2020Plugin.patterns).toBeDefined();
    expect(es2020Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es11Plugin).toBe(es2020Plugin);
    expect(es11).toBe(es2020Plugin);
    expect(es2020).toBe(es2020Plugin);
  });

  test("should filter features newer than ES2020", () => {
    const matches = [
      { name: "optional_chaining", message: "", line: 1, column: 1 },
      { name: "logical_assignment", message: "", line: 2, column: 1 },
      { name: "array_at", message: "", line: 3, column: 1 },
    ];

    const filtered = es2020Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(2);
    expect(filtered.some((m) => m.name === "logical_assignment")).toBe(true);
    expect(filtered.some((m) => m.name === "array_at")).toBe(true);
    expect(filtered.some((m) => m.name === "optional_chaining")).toBe(false);
  });

  test("should allow ES2020 features", () => {
    const matches = [
      { name: "optional_chaining", message: "", line: 1, column: 1 },
      { name: "nullish_coalescing", message: "", line: 2, column: 1 },
      { name: "bigint", message: "", line: 3, column: 1 },
      { name: "promise_allSettled", message: "", line: 4, column: 1 },
      { name: "globalThis", message: "", line: 5, column: 1 },
    ];

    const filtered = es2020Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2020Plugin.patterns.find(
      (p) => p.name === "logical_assignment",
    );
    expect(pattern?.message).toContain("es2021");
    expect(pattern?.message).toContain("es2020");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2020")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2020Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
