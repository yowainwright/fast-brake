import { describe, test, expect } from "bun:test";
import {
  es2023Plugin,
  es2023,
  es14Plugin,
  es14,
} from "../../../src/plugins/es2023";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2023/constants";

describe("ES2023 Plugin", () => {
  test("should export es2023Plugin", () => {
    expect(es2023Plugin).toBeDefined();
    expect(es2023Plugin.name).toBe("es-version-es2023");
    expect(es2023Plugin.patterns).toBeDefined();
    expect(es2023Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es14Plugin).toBe(es2023Plugin);
    expect(es14).toBe(es2023Plugin);
    expect(es2023).toBe(es2023Plugin);
  });

  test("should filter features newer than ES2023", () => {
    const matches = [
      { name: "array_findLast", message: "", line: 1, column: 1 },
      { name: "array_toReversed", message: "", line: 2, column: 1 },
      { name: "hashbang", message: "", line: 3, column: 1 },
      { name: "regexp_v_flag", message: "", line: 4, column: 1 },
    ];

    const filtered = es2023Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(1);
    expect(filtered.some((m) => m.name === "regexp_v_flag")).toBe(true);
    expect(filtered.some((m) => m.name === "array_findLast")).toBe(false);
    expect(filtered.some((m) => m.name === "array_toReversed")).toBe(false);
    expect(filtered.some((m) => m.name === "hashbang")).toBe(false);
  });

  test("should allow ES2023 and earlier features", () => {
    const matches = [
      { name: "array_findLast", message: "", line: 1, column: 1 },
      { name: "array_findLastIndex", message: "", line: 2, column: 1 },
      { name: "array_toReversed", message: "", line: 3, column: 1 },
      { name: "array_toSorted", message: "", line: 4, column: 1 },
      { name: "array_toSpliced", message: "", line: 5, column: 1 },
      { name: "array_with", message: "", line: 6, column: 1 },
      { name: "hashbang", message: "", line: 7, column: 1 },
    ];

    const filtered = es2023Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2023Plugin.patterns.find(
      (p) => p.name === "regexp_v_flag",
    );
    expect(pattern?.message).toContain("es2024");
    expect(pattern?.message).toContain("es2023");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2023")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2023Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
