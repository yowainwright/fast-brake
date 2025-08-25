import { describe, test, expect } from "bun:test";
import { detectPlugin, detect, esDetect } from "../../../src/plugins/detect";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
  VERSION_ORDER,
} from "../../../src/plugins/detect/constants";

describe("Detect Plugin", () => {
  test("should export detectPlugin", () => {
    expect(detectPlugin).toBeDefined();
    expect(detectPlugin.name).toBe("es-detect");
    expect(detectPlugin.patterns).toBeDefined();
    expect(detectPlugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(esDetect).toBe(detectPlugin);
    expect(detect).toBe(detectPlugin);
  });

  test("should detect minimum required ES version", () => {
    const matches = [
      { name: "arrow_functions", message: "", line: 1, column: 1 },
      { name: "async_await", message: "", line: 2, column: 1 },
      { name: "optional_chaining", message: "", line: 3, column: 1 },
    ];

    const result = detectPlugin.validate?.({}, matches) || [];
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("minimum_version");
    expect(result[0].message).toBe("Minimum ES version required: es2020");
    expect(result[0].severity).toBe("info");
  });

  test("should return empty array for no matches", () => {
    const matches: any[] = [];

    const result = detectPlugin.validate?.({}, matches) || [];
    expect(result).toHaveLength(0);
  });

  test("should detect highest version from multiple features", () => {
    const matches = [
      { name: "classes", message: "", line: 1, column: 1 }, // es2015
      { name: "exponentiation", message: "", line: 2, column: 1 }, // es2016
      { name: "logical_assignment", message: "", line: 3, column: 1 }, // es2021
      { name: "array_at", message: "", line: 4, column: 1 }, // es2022
    ];

    const result = detectPlugin.validate?.({}, matches) || [];
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe("Minimum ES version required: es2022");
  });

  test("should have info severity patterns", () => {
    for (const pattern of detectPlugin.patterns) {
      expect(pattern.severity).toBe("info");
      expect(pattern.message).toMatch(/^es\d{4} feature:/);
    }
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);

    expect(VERSION_ORDER).toBeDefined();
    expect(VERSION_ORDER.length).toBeGreaterThan(0);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of detectPlugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
