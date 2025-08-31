import { test, expect, describe } from "bun:test";
import {
  ES_VERSIONS,
  VERSION_ORDER,
  MDN_URLS,
  TINY_FILE_SIZE,
  COMPLEXITY_INDICATORS,
} from "../../src/constants";

describe("Constants", () => {
  describe("ES_VERSIONS", () => {
    test("should have all ES versions defined", () => {
      expect(ES_VERSIONS).toHaveProperty("es5");
      expect(ES_VERSIONS).toHaveProperty("es2015");
      expect(ES_VERSIONS).toHaveProperty("es2016");
      expect(ES_VERSIONS).toHaveProperty("es2017");
      expect(ES_VERSIONS).toHaveProperty("es2018");
      expect(ES_VERSIONS).toHaveProperty("es2019");
      expect(ES_VERSIONS).toHaveProperty("es2020");
      expect(ES_VERSIONS).toHaveProperty("es2021");
      expect(ES_VERSIONS).toHaveProperty("es2022");
    });

    test("should have browser versions for each ES version", () => {
      for (const [_version, browsers] of Object.entries(ES_VERSIONS)) {
        expect(browsers).toHaveProperty("chrome");
        expect(browsers).toHaveProperty("firefox");
        expect(browsers).toHaveProperty("safari");
        expect(typeof browsers.chrome).toBe("number");
        expect(typeof browsers.firefox).toBe("number");
        expect(typeof browsers.safari).toBe("number");
      }
    });

    test("should have generally increasing browser versions", () => {
      const chromeVersions = Object.values(ES_VERSIONS).map((v) => v.chrome);
      const safariVersions = Object.values(ES_VERSIONS).map((v) => v.safari);

      // Chrome and Safari should be strictly increasing
      for (let i = 1; i < chromeVersions.length; i++) {
        expect(chromeVersions[i]).toBeGreaterThanOrEqual(chromeVersions[i - 1]);
        expect(safariVersions[i]).toBeGreaterThanOrEqual(safariVersions[i - 1]);
      }

      // Firefox had some features earlier (async/await in 53 vs other ES2016 features in 55)
      // so we just check it's generally increasing over time
      const firefoxVersions = Object.values(ES_VERSIONS).map((v) => v.firefox);
      expect(firefoxVersions[firefoxVersions.length - 1]).toBeGreaterThan(
        firefoxVersions[0],
      );
    });
  });

  describe("VERSION_ORDER", () => {
    test("should contain all ES versions in order", () => {
      expect(VERSION_ORDER).toEqual([
        "es5",
        "es2015",
        "es2016",
        "es2017",
        "es2018",
        "es2019",
        "es2020",
        "es2021",
        "es2022",
        "es2023",
        "es2024",
        "es2025",
        "esnext",
      ]);
    });

    test("should have esnext as the last version", () => {
      expect(VERSION_ORDER[VERSION_ORDER.length - 1]).toBe("esnext");
    });

    test("should have es5 as the first version", () => {
      expect(VERSION_ORDER[0]).toBe("es5");
    });
  });

  describe("MDN_URLS", () => {
    test("should have correct MDN URLs", () => {
      expect(MDN_URLS).toHaveLength(5);
      expect(MDN_URLS).toContain(
        "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/builtins.json",
      );
      expect(MDN_URLS).toContain(
        "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/statements.json",
      );
      expect(MDN_URLS).toContain(
        "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/expressions.json",
      );
      expect(MDN_URLS).toContain(
        "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/operators.json",
      );
      expect(MDN_URLS).toContain(
        "https://raw.githubusercontent.com/mdn/browser-compat-data/main/javascript/grammar.json",
      );
    });

    test("should all be HTTPS URLs", () => {
      for (const url of MDN_URLS) {
        expect(url).toMatch(/^https:\/\//);
      }
    });

    test("should all point to browser-compat-data", () => {
      for (const url of MDN_URLS) {
        expect(url).toContain("browser-compat-data");
      }
    });
  });

  describe("TINY_FILE_SIZE", () => {
    test("should be a reasonable size", () => {
      expect(TINY_FILE_SIZE).toBe(500);
      expect(typeof TINY_FILE_SIZE).toBe("number");
    });
  });

  describe("COMPLEXITY_INDICATORS", () => {
    test("should be an array of strings", () => {
      expect(Array.isArray(COMPLEXITY_INDICATORS)).toBe(true);
      expect(COMPLEXITY_INDICATORS.length).toBeGreaterThan(0);

      for (const indicator of COMPLEXITY_INDICATORS) {
        expect(typeof indicator).toBe("string");
      }
    });

    test("should include common complexity indicators", () => {
      expect(COMPLEXITY_INDICATORS).toContain("async");
      expect(COMPLEXITY_INDICATORS).toContain("class");
      expect(COMPLEXITY_INDICATORS).toContain("import");
      expect(COMPLEXITY_INDICATORS).toContain("=>");
    });
  });
});
