import { test, expect, describe } from "bun:test";
import { Detector } from "../../src/detector";
import { stripComments } from "../../src/plugins/jscomments";

const PACKAGES = {
  lodash: {
    name: "lodash",
    versions: {
      main: "https://unpkg.com/lodash@4.17.21/lodash.js",
      min: "https://unpkg.com/lodash@4.17.21/lodash.min.js",
    },
  },
  "lodash-es": {
    name: "lodash-es",
    versions: {
      es: "https://unpkg.com/lodash-es@4.17.21/lodash.js",
    },
  },
  ramda: {
    name: "ramda",
    versions: {
      main: "https://unpkg.com/ramda@0.30.1/dist/ramda.js",
      min: "https://unpkg.com/ramda@0.30.1/dist/ramda.min.js",
    },
  },
  "core-js": {
    name: "core-js",
    versions: {
      full: "https://unpkg.com/core-js@3.39.0/index.js",
      modules: "https://unpkg.com/core-js@3.39.0/modules/es.array.concat.js",
    },
  },
  tslib: {
    name: "tslib",
    versions: {
      es5: "https://unpkg.com/tslib@2.8.1/tslib.js",
      es6: "https://unpkg.com/tslib@2.8.1/tslib.es6.js",
    },
  },
};

async function fetchCode(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

describe("E2E: Open Source Projects via unpkg", () => {
  test("lodash - should detect ES features", async () => {
    const detector = new Detector();
    await detector.initialize();

    const code = await fetchCode(PACKAGES.lodash.versions.main);
    const result = detector.detectFast(code);

    expect(result).toBeDefined();
    expect(result.mode).toBe("fast");
    expect(result.hasMatch).toBe(true);
  });

  test("lodash-es - should detect ES module features", async () => {
    const detector = new Detector();
    await detector.initialize();

    const code = await fetchCode(PACKAGES["lodash-es"].versions.es);
    const result = detector.detectFast(code);

    expect(result).toBeDefined();
    expect(result.hasMatch).toBe(true);
    if (result.firstMatch) {
      const es2015Features = [
        "export",
        "import",
        "const",
        "let",
        "arrow_functions",
        "template_literals",
      ];
      expect(es2015Features).toContain(result.firstMatch.name);
    }
  });

  test("ramda - should detect ES features", async () => {
    const detector = new Detector();
    await detector.initialize();

    const code = await fetchCode(PACKAGES.ramda.versions.main);
    const result = detector.detectFast(code);

    expect(result).toBeDefined();
    expect(result.mode).toBe("fast");
  });

  test("core-js - should detect features in modules", async () => {
    const detector = new Detector();
    await detector.initialize();

    const fullCode = await fetchCode(PACKAGES["core-js"].versions.full);
    const moduleCode = await fetchCode(PACKAGES["core-js"].versions.modules);

    const fullResult = detector.detectFast(fullCode);
    const moduleResult = detector.detectFast(moduleCode);

    expect(fullResult).toBeDefined();
    expect(moduleResult).toBeDefined();
  });

  test("tslib - ES5 vs ES6 build comparison", async () => {
    const detector = new Detector();
    await detector.initialize();

    const es5Code = await fetchCode(PACKAGES.tslib.versions.es5);
    const es6Code = await fetchCode(PACKAGES.tslib.versions.es6);

    const es5Result = detector.detectFast(es5Code);
    const es6Result = detector.detectFast(es6Code);

    expect(es5Result).toBeDefined();
    expect(es6Result).toBeDefined();
    expect(es6Result.hasMatch).toBe(true);
  });

  test("lodash - stripComments should not break detection", async () => {
    const detector = new Detector();
    await detector.initialize();

    const code = await fetchCode(PACKAGES.lodash.versions.main);
    const stripped = stripComments(code);

    const originalResult = detector.detectFast(code);
    const strippedResult = detector.detectFast(stripped);

    expect(originalResult.hasMatch).toBe(strippedResult.hasMatch);
  });

  test("ramda - performance check on real package", async () => {
    const detector = new Detector();
    await detector.initialize();

    const code = await fetchCode(PACKAGES.ramda.versions.main);

    const start = performance.now();
    const result = detector.detectFast(code);
    const duration = performance.now() - start;

    expect(result).toBeDefined();
    expect(duration).toBeLessThan(200);
  });

  test("core-js - should handle large package", async () => {
    const detector = new Detector();
    await detector.initialize();

    const code = await fetchCode(PACKAGES["core-js"].versions.full);

    const start = performance.now();
    const result = detector.detectFast(code);
    const duration = performance.now() - start;

    expect(result).toBeDefined();
    expect(duration).toBeLessThan(500);
  });
});
