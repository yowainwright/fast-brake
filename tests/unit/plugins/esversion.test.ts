import { describe, test, expect } from "bun:test";
import {
  createESVersionPlugin,
  getESVersionPlugin,
  es5,
  es2015,
  es2020,
  es2025,
  esAll,
  esDetect,
  es6,
  es11,
} from "../../../src/plugins/esversion";

describe("ESVersion Plugin", () => {
  test("should create ES version plugin", () => {
    const plugin = createESVersionPlugin("es2020");
    expect(plugin.name).toBe("es-version-es2020");
    expect(plugin.description).toContain("es2020");
    expect(plugin.spec).toBeDefined();
    expect(plugin.spec.orderedRules).toBeDefined();
    expect(plugin.spec.matches).toBeDefined();
  });

  test("should filter features for target version", () => {
    const es5Plugin = createESVersionPlugin("es5");
    const es2020Plugin = createESVersionPlugin("es2020");

    const es5Matches = Object.keys(es5Plugin.spec.matches);
    const es2020Matches = Object.keys(es2020Plugin.spec.matches);

    expect(es5Matches.length).toBeGreaterThan(es2020Matches.length);
  });

  test("should export version-specific plugins", () => {
    expect(es5).toBeDefined();
    expect(es5.name).toBe("es-version-es5");

    expect(es2015).toBeDefined();
    expect(es2015.name).toBe("es-version-es2015");

    expect(es2020).toBeDefined();
    expect(es2020.name).toBe("es-version-es2020");

    expect(es2025).toBeDefined();
    expect(es2025.name).toBe("es-version-es2025");
  });

  test("should have version aliases", () => {
    expect(es6).toBe(es2015);
    expect(es11).toBe(es2020);
  });

  test("should export esAll plugin", () => {
    expect(esAll).toBeDefined();
    expect(esAll.name).toBe("esversion");
    expect(esAll.spec).toBeDefined();
    expect(Object.keys(esAll.spec.matches).length).toBeGreaterThan(0);
  });

  test("should export esDetect plugin", () => {
    expect(esDetect).toBeDefined();
    expect(esDetect.name).toBe("es-detect");
    expect(esDetect.description).toContain("minimum");
    expect(esDetect.spec).toBeDefined();
  });

  test("getESVersionPlugin should return correct plugins", () => {
    expect(getESVersionPlugin("es5")).toBe(es5);
    expect(getESVersionPlugin("es2015")).toBe(es2015);
    expect(getESVersionPlugin("es6")).toBe(es6);
    expect(getESVersionPlugin("all")).toBe(esAll);
    expect(getESVersionPlugin("detect")).toBe(esDetect);
    expect(getESVersionPlugin("unknown")).toBe(es5);
  });

  test("should have ordered rules", () => {
    const plugin = createESVersionPlugin("es2020");
    const rules = plugin.spec.orderedRules;

    expect(rules).toContain("es5");
    expect(rules).toContain("es2015");
    expect(rules).toContain("es2020");
    expect(rules).toContain("esnext");

    const es5Index = rules.indexOf("es5");
    const es2015Index = rules.indexOf("es2015");
    const es2020Index = rules.indexOf("es2020");

    expect(es5Index).toBeLessThan(es2015Index);
    expect(es2015Index).toBeLessThan(es2020Index);
  });

  test("should only include features newer than target", () => {
    const plugin = createESVersionPlugin("es2017");
    const matches = plugin.spec.matches;

    if (Object.keys(matches).length > 0) {
      for (const match of Object.values(matches)) {
        const ruleIndex = plugin.spec.orderedRules.indexOf(match.rule);
        const targetIndex = plugin.spec.orderedRules.indexOf("es2017");
        expect(ruleIndex).toBeGreaterThan(targetIndex);
      }
    }
  });
});
