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
    expect(plugin.name).toBe("browserlist");
    expect(plugin.patterns).toBeDefined();
    expect(plugin.validate).toBeDefined();
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
    expect(version).toBe("es2015");
  });

  test("should check feature support in browsers", () => {
    const targets = [{ name: "chrome", version: 80 }];
    const supported = isFeatureSupportedInBrowsers("es2020", targets);
    expect(supported).toBe(true);
  });

  test("should validate features based on browser support", () => {
    const plugin = createBrowserlistPlugin("chrome 50");
    const matches = [
      { name: "optional_chaining", message: "", line: 1, column: 1 },
    ];
    const filtered = plugin.validate?.({}, matches) || [];
    expect(filtered).toHaveLength(1);
  });

  test("should export preset plugins", () => {
    expect(modernBrowsers).toBeDefined();
    expect(modernBrowsers.name).toBe("browserlist");

    expect(legacyBrowsers).toBeDefined();
    expect(legacyBrowsers.name).toBe("browserlist");

    expect(defaultBrowsers).toBeDefined();
    expect(defaultBrowsers.name).toBe("browserlist");
  });

  test("should have constants", () => {
    const {
      FEATURE_STRINGS,
      FEATURE_PATTERNS,
      FEATURE_VERSIONS,
      ES_VERSIONS,
    } = require("../../../src/plugins/browserlist/constants");
    expect(FEATURE_STRINGS).toBeDefined();
    expect(FEATURE_PATTERNS).toBeDefined();
    expect(FEATURE_VERSIONS).toBeDefined();
    expect(ES_VERSIONS).toBeDefined();
  });
});
