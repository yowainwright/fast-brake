import { test, expect, describe } from "bun:test";
import { existsSync } from "fs";
import { join } from "path";
import benchmarkerPkg from "../../utils/benchmarker/package.json";

describe("Benchmarker Setup", () => {
  test("benchmark script exists", () => {
    const scriptPath = join(
      __dirname,
      "../../utils/benchmarker/src/benchmark.ts",
    );
    expect(existsSync(scriptPath)).toBe(true);
  });

  test("package.json has benchmark scripts", () => {
    expect(benchmarkerPkg.scripts.benchmark).toBeDefined();
    expect(benchmarkerPkg.scripts["benchmark:table"]).toBeDefined();
  });
});
