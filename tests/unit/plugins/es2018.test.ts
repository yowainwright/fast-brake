import { describe, test, expect } from "bun:test";
import {
  es2018Plugin,
  es2018,
  es9Plugin,
  es9,
} from "../../../src/plugins/es2018";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2018/constants";

describe("ES2018 Plugin", () => {
  test("should export es2018Plugin", () => {
    expect(es2018Plugin).toBeDefined();
    expect(es2018Plugin.name).toBe("es-version-es2018");
    expect(es2018Plugin.patterns).toBeDefined();
    expect(es2018Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es9Plugin).toBe(es2018Plugin);
    expect(es9).toBe(es2018Plugin);
    expect(es2018).toBe(es2018Plugin);
  });

  test("should filter features newer than ES2018", () => {
    const matches = [
      { name: "async_iteration", message: "", line: 1, column: 1 },
      { name: "rest_spread_properties", message: "", line: 2, column: 1 },
      { name: "array_flat", message: "", line: 3, column: 1 },
      { name: "optional_chaining", message: "", line: 4, column: 1 },
    ];

    const filtered = es2018Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(2);
    expect(filtered.some((m) => m.name === "array_flat")).toBe(true);
    expect(filtered.some((m) => m.name === "optional_chaining")).toBe(true);
    expect(filtered.some((m) => m.name === "async_iteration")).toBe(false);
    expect(filtered.some((m) => m.name === "rest_spread_properties")).toBe(
      false,
    );
  });

  test("should allow ES2018 and earlier features", () => {
    const matches = [
      { name: "async_iteration", message: "", line: 1, column: 1 },
      { name: "rest_spread_properties", message: "", line: 2, column: 1 },
      { name: "async_await", message: "", line: 3, column: 1 },
    ];

    const filtered = es2018Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages", () => {
    const pattern = es2018Plugin.patterns.find((p) => p.name === "array_flat");
    expect(pattern?.message).toContain("es2019");
    expect(pattern?.message).toContain("es2018");
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2018")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2018Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
