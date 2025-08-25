import { describe, test, expect } from "bun:test";
import { allPlugin, all, esAll } from "../../../src/plugins/all";
import {
  QUICK_PATTERNS,
  FEATURE_VERSIONS,
} from "../../../src/plugins/all/constants";

describe("All Plugin", () => {
  test("should export allPlugin", () => {
    expect(allPlugin).toBeDefined();
    expect(allPlugin.name).toBe("es-all");
    expect(allPlugin.patterns).toBeDefined();
    expect(allPlugin.validate).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(esAll).toBe(allPlugin);
    expect(all).toBe(allPlugin);
  });

  test("should return all matches without filtering", () => {
    const matches = [
      { name: "arrow_functions", message: "", line: 1, column: 1 },
      { name: "optional_chaining", message: "", line: 2, column: 1 },
      { name: "temporal", message: "", line: 3, column: 1 },
      { name: "classes", message: "", line: 4, column: 1 },
    ];

    const result = allPlugin.validate?.({}, matches) || [];
    expect(result).toHaveLength(4);
    expect(result).toEqual(matches);
  });

  test("should return empty array for no matches", () => {
    const matches: any[] = [];

    const result = allPlugin.validate?.({}, matches) || [];
    expect(result).toHaveLength(0);
  });

  test("should have info severity patterns with correct message format", () => {
    for (const pattern of allPlugin.patterns) {
      expect(pattern.severity).toBe("info");
      expect(pattern.message).toMatch(/^ES feature ".+" detected \(es\d{4}\)$/);
    }
  });

  test("should include all ES features in patterns", () => {
    const patternNames = new Set(allPlugin.patterns.map((p) => p.name));
    const featureNames = new Set(Object.keys(FEATURE_VERSIONS));

    // All features should have corresponding patterns
    expect(patternNames.size).toBe(featureNames.size);
    for (const featureName of featureNames) {
      expect(patternNames.has(featureName)).toBe(true);
    }
  });

  test("should have constants", () => {
    expect(QUICK_PATTERNS).toBeDefined();
    expect(Object.keys(QUICK_PATTERNS).length).toBeGreaterThan(0);

    expect(FEATURE_VERSIONS).toBeDefined();
    expect(Object.keys(FEATURE_VERSIONS).length).toBeGreaterThan(0);
  });

  test("patterns should be valid RegExp", () => {
    for (const pattern of allPlugin.patterns) {
      expect(pattern.pattern).toBeInstanceOf(RegExp);
    }
  });
});
