import { test, expect, describe } from "bun:test";
import { parse as acornParse } from "acorn";
import { Detector } from "../../src/detector";
import { safePreprocessor } from "../../src/plugins/jscomments";

type EcmaVersion = 5 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024;

const ES_VERSIONS: EcmaVersion[] = [5, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

function acornCanParse(code: string, ecmaVersion: EcmaVersion): boolean {
  try {
    acornParse(code, {
      ecmaVersion,
      sourceType: "module",
      allowHashBang: true,
    });
    return true;
  } catch {
    return false;
  }
}

function acornCanParseScript(code: string, ecmaVersion: EcmaVersion): boolean {
  try {
    acornParse(code, {
      ecmaVersion,
      sourceType: "script",
    });
    return true;
  } catch {
    return false;
  }
}

function getMinimumEsVersion(code: string): EcmaVersion | null {
  for (const version of ES_VERSIONS) {
    const canParse = acornCanParse(code, version);
    if (canParse) return version;
  }
  return null;
}

async function fetchCode(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

const TEST_PACKAGES = {
  "lodash-es": {
    url: "https://unpkg.com/lodash-es@4.17.21/lodash.js",
    fastBrakeDetects: true,
    description: "lodash-es (ES modules)",
  },
  "tslib-es6": {
    url: "https://unpkg.com/tslib@2.8.1/tslib.es6.js",
    fastBrakeDetects: true,
    description: "tslib ES6 build",
  },
  "ramda": {
    url: "https://unpkg.com/ramda@0.30.1/dist/ramda.js",
    fastBrakeDetects: true,
    description: "ramda (modern build)",
  },
};

const CODE_SAMPLES = {
  es5: {
    code: 'var x = 5; function test() { return x; }',
    minVersion: 5,
    fastBrakeDetects: false,
    description: "ES5 - var and function",
  },
  es2015_arrow: {
    code: "var fn = () => 42;",
    minVersion: 2015,
    fastBrakeDetects: true,
    description: "ES2015 - arrow function",
  },
  es2015_const: {
    code: "const x = 5;",
    minVersion: 2015,
    fastBrakeDetects: true,
    description: "ES2015 - const declaration",
  },
  es2015_let: {
    code: "let x = 5;",
    minVersion: 2015,
    fastBrakeDetects: true,
    description: "ES2015 - let declaration",
  },
  es2015_template: {
    code: "var str = `hello ${name}`;",
    minVersion: 2015,
    fastBrakeDetects: true,
    description: "ES2015 - template literal",
  },
  es2015_class: {
    code: "class Foo { constructor() {} }",
    minVersion: 2015,
    fastBrakeDetects: true,
    description: "ES2015 - class declaration",
  },
  es2015_spread: {
    code: "var arr = [...other];",
    minVersion: 2015,
    fastBrakeDetects: true,
    description: "ES2015 - spread operator",
  },
  es2016_exponent: {
    code: "var x = 2 ** 3;",
    minVersion: 2016,
    fastBrakeDetects: true,
    description: "ES2016 - exponentiation operator",
  },
  es2017_async: {
    code: "async function test() { await promise; }",
    minVersion: 2017,
    fastBrakeDetects: true,
    description: "ES2017 - async/await",
  },
  es2018_rest_props: {
    code: "var { a, ...rest } = obj;",
    minVersion: 2018,
    fastBrakeDetects: true,
    description: "ES2018 - object rest properties",
  },
  es2018_async_iter: {
    code: "async function* gen() { yield 1; }",
    minVersion: 2018,
    fastBrakeDetects: true,
    description: "ES2018 - async generator",
  },
  es2020_nullish: {
    code: "var x = a ?? b;",
    minVersion: 2020,
    fastBrakeDetects: true,
    description: "ES2020 - nullish coalescing",
  },
  es2020_optional: {
    code: "var x = obj?.prop;",
    minVersion: 2020,
    fastBrakeDetects: true,
    description: "ES2020 - optional chaining",
  },
  es2021_logical_assign: {
    code: "x ||= 5;",
    minVersion: 2021,
    fastBrakeDetects: true,
    description: "ES2021 - logical assignment",
  },
  es2022_class_fields: {
    code: "class Foo { #private = 1; }",
    minVersion: 2022,
    fastBrakeDetects: true,
    description: "ES2022 - private class fields",
  },
  es2022_static_block: {
    code: "class Foo { static { this.x = 1; } }",
    minVersion: 2022,
    fastBrakeDetects: true,
    description: "ES2022 - static initialization block",
  },
  es2022_top_level_await: {
    code: "await Promise.resolve();",
    minVersion: 2022,
    fastBrakeDetects: true,
    description: "ES2022 - top-level await",
  },
};

describe("E2E: Parser Parity Tests", () => {
  describe("Code Samples - Acorn Baseline Verification", () => {
    Object.entries(CODE_SAMPLES).forEach(([, { code, minVersion, description }]) => {
      test(`${description} - acorn parses at ES${minVersion}`, () => {
        const acornMin = getMinimumEsVersion(code);
        expect(acornMin).toBe(minVersion);
      });
    });
  });

  describe("Code Samples - fast-brake Detection", () => {
    let detector: Detector;

    test("initialize detector", async () => {
      detector = new Detector();
      await detector.initialize();
      expect(detector.isInitialized()).toBe(true);
    });

    Object.entries(CODE_SAMPLES).forEach(([, { code, fastBrakeDetects, description }]) => {
      test(`${description} - fast-brake detection`, () => {
        const result = detector.detectFast(code);
        expect(result.hasMatch).toBe(fastBrakeDetects);
      });
    });
  });

  describe("Real Packages - ES Version Detection", () => {
    let detector: Detector;

    test("initialize detector", async () => {
      detector = new Detector();
      await detector.initialize();
    });

    Object.entries(TEST_PACKAGES).forEach(([, { url, fastBrakeDetects, description }]) => {
      test(`${description} - fast-brake detection`, async () => {
        const code = await fetchCode(url);
        const preprocessed = safePreprocessor(code);
        const result = detector.detectFast(preprocessed, { skipPreprocess: true });

        expect(result.hasMatch).toBe(fastBrakeDetects);
      });
    });
  });

  describe("ES5 Compatibility Check", () => {
    let detector: Detector;

    test("initialize detector", async () => {
      detector = new Detector();
      await detector.initialize();
    });

    test("ES5 code passes both acorn ES5 and fast-brake check", () => {
      const es5Code = 'var x = 5; function add(a, b) { return a + b; }';

      const acornParsesEs5 = acornCanParse(es5Code, 5);
      const fastBrakeResult = detector.check(es5Code, { target: "es5" });

      expect(acornParsesEs5).toBe(true);
      expect(fastBrakeResult).toBe(true);
    });

    test("ES2015 code fails acorn ES5 and fast-brake ES5 check", () => {
      const es2015Code = "const fn = () => 42;";

      const acornParsesEs5 = acornCanParse(es2015Code, 5);
      const fastBrakeResult = detector.check(es2015Code, { target: "es5" });

      expect(acornParsesEs5).toBe(false);
      expect(fastBrakeResult).toBe(false);
    });

    test("ES2020 code fails acorn ES2015 and detected by fast-brake", () => {
      const es2020Code = "const x = obj?.prop ?? 'default';";

      const acornParsesEs2015 = acornCanParse(es2020Code, 2015);
      const fastBrakeResult = detector.detectFast(es2020Code);

      expect(acornParsesEs2015).toBe(false);
      expect(fastBrakeResult.hasMatch).toBe(true);
    });
  });

  describe("Performance Comparison", () => {
    let detector: Detector;

    test("initialize detector", async () => {
      detector = new Detector();
      await detector.initialize();
    });

    test("fast-brake is faster than acorn for ES version detection", async () => {
      const code = await fetchCode(TEST_PACKAGES["lodash-es"].url);

      const acornStart = performance.now();
      for (const version of ES_VERSIONS) {
        acornCanParse(code, version);
      }
      const acornDuration = performance.now() - acornStart;

      const fastBrakeStart = performance.now();
      detector.detectFast(code);
      const fastBrakeDuration = performance.now() - fastBrakeStart;

      expect(fastBrakeDuration).toBeLessThan(acornDuration);
    });
  });

  describe("Acorn Script Mode (es-check style)", () => {
    let detector: Detector;

    test("initialize detector", async () => {
      detector = new Detector();
      await detector.initialize();
    });

    test("ES5 code - acorn ES5 script parses, fast-brake passes check", () => {
      const es5Code = 'var x = 5; function add(a, b) { return a + b; }';

      const acornPasses = acornCanParseScript(es5Code, 5);
      const fbResult = detector.check(es5Code, { target: "es5" });

      expect(acornPasses).toBe(true);
      expect(fbResult).toBe(true);
    });

    test("ES2015 arrow - acorn ES5 fails, fast-brake detects", () => {
      const arrowCode = "var fn = () => 42;";

      const acornPasses = acornCanParseScript(arrowCode, 5);
      const fbResult = detector.detectFast(arrowCode);

      expect(acornPasses).toBe(false);
      expect(fbResult.hasMatch).toBe(true);
    });

    test("ES2015 class - acorn ES5 fails, fast-brake detects", () => {
      const classCode = "class Foo { constructor() {} }";

      const acornPasses = acornCanParseScript(classCode, 5);
      const fbResult = detector.detectFast(classCode);

      expect(acornPasses).toBe(false);
      expect(fbResult.hasMatch).toBe(true);
    });

    test("ES2020 optional chaining - acorn ES2015 fails, fast-brake detects", () => {
      const optionalCode = "var x = obj?.prop;";

      const acornPasses = acornCanParseScript(optionalCode, 2015);
      const fbResult = detector.detectFast(optionalCode);

      expect(acornPasses).toBe(false);
      expect(fbResult.hasMatch).toBe(true);
    });
  });

  describe("Parser Performance Benchmark", () => {
    let detector: Detector;

    test("initialize detector", async () => {
      detector = new Detector();
      await detector.initialize();
    });

    test("fast-brake vs acorn checking all ES versions", async () => {
      const code = await fetchCode(TEST_PACKAGES["lodash-es"].url);

      const acornStart = performance.now();
      for (const version of ES_VERSIONS) {
        acornCanParse(code, version);
      }
      const acornTime = performance.now() - acornStart;

      const fbStart = performance.now();
      detector.detectFast(code);
      const fbTime = performance.now() - fbStart;

      expect(fbTime).toBeLessThan(acornTime);
    });

    test("fast-brake completes detection in reasonable time", async () => {
      const code = await fetchCode(TEST_PACKAGES["lodash-es"].url);

      const start = performance.now();
      const result = detector.detectFast(code);
      const duration = performance.now() - start;

      expect(result.hasMatch).toBe(true);
      expect(duration).toBeLessThan(10);
    });
  });
});
