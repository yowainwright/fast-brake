import { describe, test, expect } from "bun:test";
import {
  es2019Plugin,
  es2019,
  es10Plugin,
  es10,
} from "../../../src/plugins/es2019";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2019/constants";

describe("ES2019 Plugin", () => {
  test("should export es2019Plugin", () => {
    expect(es2019Plugin).toBeDefined();
    expect(es2019Plugin.name).toBe("es-version-es2019");
    expect(es2019Plugin.patterns).toBeDefined();
    expect(es2019Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es10Plugin).toBe(es2019Plugin);
    expect(es10).toBe(es2019Plugin);
    expect(es2019).toBe(es2019Plugin);
  });

  test("should filter features newer than ES2019", () => {
    const matches = [
      { name: "array_flat", message: "", line: 1, column: 1 },
      { name: "optional_chaining", message: "", line: 2, column: 1 },
      { name: "nullish_coalescing", message: "", line: 3, column: 1 },
    ];

    const filtered = es2019Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(2);
    expect(filtered.some((m) => m.name === "optional_chaining")).toBe(true);
    expect(filtered.some((m) => m.name === "nullish_coalescing")).toBe(true);
    expect(filtered.some((m) => m.name === "array_flat")).toBe(false);
  });

  test("should allow ES2019 and earlier features", () => {
    const matches = [
      { name: "array_flat", message: "", line: 1, column: 1 },
      { name: "async_iteration", message: "", line: 2, column: 1 },
      { name: "async_await", message: "", line: 3, column: 1 },
    ];

    const filtered = es2019Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2019Plugin.patterns.find(
      (p) => p.name === "optional_chaining",
    );
    expect(pattern?.message).toContain("es2020");
    expect(pattern?.message).toContain("es2019");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2019")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2019Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
