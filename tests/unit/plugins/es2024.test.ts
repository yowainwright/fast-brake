import { describe, test, expect } from "bun:test";
import {
  es2024Plugin,
  es2024,
  es15Plugin,
  es15,
} from "../../../src/plugins/es2024";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2024/constants";

describe("ES2024 Plugin", () => {
  test("should export es2024Plugin", () => {
    expect(es2024Plugin).toBeDefined();
    expect(es2024Plugin.name).toBe("es-version-es2024");
    expect(es2024Plugin.patterns).toBeDefined();
    expect(es2024Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es15Plugin).toBe(es2024Plugin);
    expect(es15).toBe(es2024Plugin);
    expect(es2024).toBe(es2024Plugin);
  });

  test("should filter features newer than ES2024", () => {
    const matches = [
      { name: "regexp_v_flag", message: "", line: 1, column: 1 },
      { name: "array_fromAsync", message: "", line: 2, column: 1 },
      { name: "promise_withResolvers", message: "", line: 3, column: 1 },
      { name: "temporal", message: "", line: 4, column: 1 },
    ];

    const filtered = es2024Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(1);
    expect(filtered.some((m) => m.name === "temporal")).toBe(true);
    expect(filtered.some((m) => m.name === "regexp_v_flag")).toBe(false);
    expect(filtered.some((m) => m.name === "array_fromAsync")).toBe(false);
    expect(filtered.some((m) => m.name === "promise_withResolvers")).toBe(
      false,
    );
  });

  test("should allow ES2024 and earlier features", () => {
    const matches = [
      { name: "regexp_v_flag", message: "", line: 1, column: 1 },
      { name: "array_fromAsync", message: "", line: 2, column: 1 },
      { name: "promise_withResolvers", message: "", line: 3, column: 1 },
      { name: "object_groupBy", message: "", line: 4, column: 1 },
      { name: "map_groupBy", message: "", line: 5, column: 1 },
    ];

    const filtered = es2024Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2024Plugin.patterns.find((p) => p.name === "temporal");
    expect(pattern?.message).toContain("es2025");
    expect(pattern?.message).toContain("es2024");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2024")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2024Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
