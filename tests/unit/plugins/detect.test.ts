import { describe, test, expect } from "bun:test";
import { detectPlugin, detect, esDetect } from "../../../src/plugins/detect";

describe("Detect Plugin", () => {
  test("should export detectPlugin", () => {
    expect(detectPlugin).toBeDefined();
    expect(detectPlugin.name).toBe("es-detect");
    expect(detectPlugin.description).toBeDefined();
    expect(detectPlugin.spec).toBeDefined();
    expect(detectPlugin.spec.orderedRules).toBeDefined();
    expect(detectPlugin.spec.matches).toBeDefined();
  });

  test("should have correct aliases", () => {
    expect(esDetect).toBe(detectPlugin);
    expect(detect).toBe(detectPlugin);
  });

  test("should have reversed order rules (newest to oldest)", () => {
    const rules = detectPlugin.spec.orderedRules;
    expect(rules).toBeDefined();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0]).toBe("esnext");
    expect(rules[rules.length - 1]).toBe("es5");
  });

  test("should have matches for ES features", () => {
    const matches = detectPlugin.spec.matches;
    expect(matches).toBeDefined();
    expect(Object.keys(matches).length).toBeGreaterThan(0);

    expect(matches.arrow_functions).toBeDefined();
    expect(matches.arrow_functions.rule).toBe("es2015");

    expect(matches.async_await).toBeDefined();
    expect(matches.async_await.rule).toBe("es2017");

    expect(matches.optional_chaining).toBeDefined();
    expect(matches.optional_chaining.rule).toBe("es2020");
  });

  test("should have string patterns for simple features", () => {
    const matches = detectPlugin.spec.matches;

    expect(matches.arrow_functions.strings).toContain("=>");
    expect(matches.template_literals.strings).toContain("`");
    expect(matches.optional_chaining.strings).toContain("?.");
    expect(matches.nullish_coalescing.strings).toContain("??");
  });

  test("should have regex patterns for complex features", () => {
    const matches = detectPlugin.spec.matches;

    expect(matches.for_of.patterns).toBeDefined();
    expect(matches.for_of.patterns[0].pattern).toContain("for");

    expect(matches.destructuring.patterns).toBeDefined();
    expect(matches.destructuring.patterns[0].pattern).toBeDefined();
  });

  test("should have newest features", () => {
    const matches = detectPlugin.spec.matches;

    expect(matches.temporal).toBeDefined();
    expect(matches.temporal.rule).toBe("es2025");

    expect(matches.array_fromAsync).toBeDefined();
    expect(matches.array_fromAsync.rule).toBe("es2024");

    expect(matches.array_findLast).toBeDefined();
    expect(matches.array_findLast.rule).toBe("es2023");
  });
});
