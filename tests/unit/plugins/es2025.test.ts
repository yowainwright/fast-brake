import { describe, test, expect } from "bun:test";
import {
  es2025Plugin,
  es2025,
  es16Plugin,
  es16,
} from "../../../src/plugins/es2025";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/es2025/constants";

describe("ES2025 Plugin", () => {
  test("should export es2025Plugin", () => {
    expect(es2025Plugin).toBeDefined();
    expect(es2025Plugin.name).toBe("es-version-es2025");
    expect(es2025Plugin.patterns).toBeDefined();
    expect(es2025Plugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(es16Plugin).toBe(es2025Plugin);
    expect(es16).toBe(es2025Plugin);
    expect(es2025).toBe(es2025Plugin);
  });

  test("should filter features newer than ES2025", () => {
    const matches = [
      { name: "temporal", message: "", line: 1, column: 1 },
      {
        name: "regexp_duplicate_named_groups",
        message: "",
        line: 2,
        column: 1,
      },
      { name: "set_methods", message: "", line: 3, column: 1 },
    ];

    // Since ES2025 is the latest version, no features should be filtered out
    const filtered = es2025Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should allow all ES2025 and earlier features", () => {
    const matches = [
      { name: "temporal", message: "", line: 1, column: 1 },
      {
        name: "regexp_duplicate_named_groups",
        message: "",
        line: 2,
        column: 1,
      },
      { name: "set_methods", message: "", line: 3, column: 1 },
      { name: "regexp_v_flag", message: "", line: 4, column: 1 },
      { name: "array_fromAsync", message: "", line: 5, column: 1 },
    ];

    const filtered = es2025Plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(0);
  });

  test("should have correct error messages for hypothetical future features", () => {
    // For ES2025 being the latest, this test ensures the message structure is correct
    const patterns = es2025Plugin.patterns;
    expect(patterns.length).toBeGreaterThan(0);
    for (const pattern of patterns) {
      expect(pattern.message).toContain("es2025");
    }
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.includes("es2025")).toBe(true);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of es2025Plugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
