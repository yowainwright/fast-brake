import { describe, test, expect } from "bun:test";
import {
  es2022Plugin,
  es2022,
  es13Plugin,
  es13,
} from "../../../src/plugins/es2022";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2022/constants";

describe("ES2022 Plugin", () => {
  test("should export es2022Plugin", () => {
    expect(es2022Plugin).toBeDefined();
    expect(es2022Plugin.name).toBe("es-version-es2022");
    expect(es2022Plugin.patterns).toBeDefined();
    expect(es2022Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es13Plugin).toBe(es2022Plugin);
    expect(es13).toBe(es2022Plugin);
    expect(es2022).toBe(es2022Plugin);
  });

  test("should filter features newer than ES2022", () => {
    const matches = [
      { name: "class_fields", message: "", line: 1, column: 1 },
      { name: "private_fields", message: "", line: 2, column: 1 },
      { name: "array_at", message: "", line: 3, column: 1 },
      { name: "array_findLast", message: "", line: 4, column: 1 },
    ];

    const filtered = es2022Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(1);
    expect(filtered.some((m) => m.name === "array_findLast")).toBe(true);
    expect(filtered.some((m) => m.name === "class_fields")).toBe(false);
    expect(filtered.some((m) => m.name === "private_fields")).toBe(false);
    expect(filtered.some((m) => m.name === "array_at")).toBe(false);
  });

  test("should allow ES2022 and earlier features", () => {
    const matches = [
      { name: "class_fields", message: "", line: 1, column: 1 },
      { name: "private_fields", message: "", line: 2, column: 1 },
      { name: "static_blocks", message: "", line: 3, column: 1 },
      { name: "array_at", message: "", line: 4, column: 1 },
      { name: "object_hasOwn", message: "", line: 5, column: 1 },
      { name: "top_level_await", message: "", line: 6, column: 1 },
    ];

    const filtered = es2022Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2022Plugin.patterns.find(
      (p) => p.name === "array_findLast",
    );
    expect(pattern?.message).toContain("es2023");
    expect(pattern?.message).toContain("es2022");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2022")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2022Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
