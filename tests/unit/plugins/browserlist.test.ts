import { describe, test, expect } from "bun:test";
import {
  createBrowserlistPlugin,
  parseBrowserlist,
  getMinESVersionForBrowsers,
  isFeatureSupportedInBrowsers,
  modernBrowsers,
  legacyBrowsers,
  defaultBrowsers,
} from "../../../src/plugins/browserlist";

describe("Browserlist Plugin", () => {
  test("should create browserlist plugin", () => {
    const plugin = createBrowserlistPlugin("chrome 80");
    expect(plugin.name).toContain("browserlist");
    expect(plugin.description).toBeDefined();
    expect(plugin.spec).toBeDefined();
    expect(plugin.spec.orderedRules).toBeDefined();
    expect(plugin.spec.matches).toBeDefined();
  });

  test("should parse browser strings", () => {
    const targets = parseBrowserlist("chrome 80");
    expect(targets).toHaveLength(1);
    expect(targets[0]).toEqual({ name: "chrome", version: 80 });
  });

  test("should parse multiple browsers", () => {
    const targets = parseBrowserlist(["chrome 80", "firefox 74"]);
    expect(targets).toHaveLength(2);
    expect(targets[0]).toEqual({ name: "chrome", version: 80 });
    expect(targets[1]).toEqual({ name: "firefox", version: 74 });
  });

  test('should parse "last X versions"', () => {
    const targets = parseBrowserlist("last 2 versions");
    expect(targets).toHaveLength(3);
    expect(targets.some((t) => t.name === "chrome")).toBe(true);
    expect(targets.some((t) => t.name === "firefox")).toBe(true);
    expect(targets.some((t) => t.name === "safari")).toBe(true);
  });

  test("should parse defaults", () => {
    const targets = parseBrowserlist("defaults");
    expect(targets).toHaveLength(3);
  });

  test("should get minimum ES version for browsers", () => {
    const targets = [{ name: "chrome", version: 51 }];
    const version = getMinESVersionForBrowsers(targets);
    expect(["es2015", "es2016", "es2017"]).toContain(version);
  });

  test("should check feature support in browsers", () => {
    const targets = [{ name: "chrome", version: 80 }];
    const supported = isFeatureSupportedInBrowsers("es2020", targets);
    expect(supported).toBe(true);
  });

  test("should filter features based on browser support", () => {
    const plugin = createBrowserlistPlugin("chrome 50");
    expect(plugin.spec.matches).toBeDefined();
    const matchKeys = Object.keys(plugin.spec.matches);

    expect(matchKeys.length).toBeGreaterThan(0);
  });

  test("should export preset plugins", () => {
    expect(modernBrowsers).toBeDefined();
    expect(modernBrowsers.name).toContain("browserlist");
    expect(modernBrowsers.spec).toBeDefined();

    expect(legacyBrowsers).toBeDefined();
    expect(legacyBrowsers.name).toContain("browserlist");
    expect(legacyBrowsers.spec).toBeDefined();

    expect(defaultBrowsers).toBeDefined();
    expect(defaultBrowsers.name).toContain("browserlist");
    expect(defaultBrowsers.spec).toBeDefined();
  });

  test("should have proper plugin structure", () => {
    const plugin = createBrowserlistPlugin("chrome 80");
    expect(plugin.spec.orderedRules).toContain("es2015");
    expect(plugin.spec.orderedRules).toContain("es2020");
    expect(Object.keys(plugin.spec.matches).length).toBeGreaterThan(0);
  });

  test("should filter matches for older browsers", () => {
    const oldPlugin = createBrowserlistPlugin("chrome 40");
    const newPlugin = createBrowserlistPlugin("chrome 90");

    const oldMatches = Object.keys(oldPlugin.spec.matches).length;
    const newMatches = Object.keys(newPlugin.spec.matches).length;

    expect(oldMatches).toBeGreaterThan(newMatches);
  });
});
