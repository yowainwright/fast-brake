import { describe, test, expect } from "bun:test";
import {
  es2021Plugin,
  es2021,
  es12Plugin,
  es12,
} from "../../../src/plugins/es2021";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2021/constants";

describe("ES2021 Plugin", () => {
  test("should export es2021Plugin", () => {
    expect(es2021Plugin).toBeDefined();
    expect(es2021Plugin.name).toBe("es-version-es2021");
    expect(es2021Plugin.patterns).toBeDefined();
    expect(es2021Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es12Plugin).toBe(es2021Plugin);
    expect(es12).toBe(es2021Plugin);
    expect(es2021).toBe(es2021Plugin);
  });

  test("should filter features newer than ES2021", () => {
    const matches = [
      { name: "logical_assignment", message: "", line: 1, column: 1 },
      { name: "numeric_separators", message: "", line: 2, column: 1 },
      { name: "class_fields", message: "", line: 3, column: 1 },
      { name: "array_at", message: "", line: 4, column: 1 },
    ];

    const filtered = es2021Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(2);
    expect(filtered.some((m) => m.name === "class_fields")).toBe(true);
    expect(filtered.some((m) => m.name === "array_at")).toBe(true);
    expect(filtered.some((m) => m.name === "logical_assignment")).toBe(false);
    expect(filtered.some((m) => m.name === "numeric_separators")).toBe(false);
  });

  test("should allow ES2021 and earlier features", () => {
    const matches = [
      { name: "logical_assignment", message: "", line: 1, column: 1 },
      { name: "string_replaceAll", message: "", line: 2, column: 1 },
      { name: "promise_any", message: "", line: 3, column: 1 },
      { name: "optional_chaining", message: "", line: 4, column: 1 },
    ];

    const filtered = es2021Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2021Plugin.patterns.find(
      (p) => p.name === "class_fields",
    );
    expect(pattern?.message).toContain("es2022");
    expect(pattern?.message).toContain("es2021");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2021")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2021Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
