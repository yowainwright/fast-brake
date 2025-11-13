import { test, expect, describe } from "bun:test";
import { safePreprocessor } from "../../src/plugins/jscomments";

describe("safePreprocessor - GitHub Issue #338 fixes", () => {
  test("should blank out underscore in string (numeric separator false positive)", () => {
    const code = 'const img = "image-froth_1426534_7KYhd4UUl";';
    const result = safePreprocessor(code);

    expect(result).not.toContain("_1426534_");
    expect(result).toContain('const img = "');
    expect(result).toContain('";');
  });

  test("should blank out ** in string (exponentiation false positive)", () => {
    const code = 'const str = "**important**";';
    const result = safePreprocessor(code);

    expect(result).not.toContain("**important**");
    expect(result).toContain('const str = "');
    expect(result).toContain('";');
  });

  test("should blank out ?. in string (optional chaining false positive)", () => {
    const code = 'const x = "?.prop";';
    const result = safePreprocessor(code);

    expect(result).not.toContain("?.prop");
    expect(result).toContain('const x = "');
    expect(result).toContain('";');
  });

  test("should preserve real optional chaining in code", () => {
    const code = "const x = obj?.prop;";
    const result = safePreprocessor(code);

    expect(result).toBe(code);
  });

  test("should preserve real exponentiation operator", () => {
    const code = "const x = 2 ** 3;";
    const result = safePreprocessor(code);

    expect(result).toBe(code);
  });

  test("should preserve real numeric separators", () => {
    const code = "const x = 1_000_000;";
    const result = safePreprocessor(code);

    expect(result).toBe(code);
  });

  test("should handle mixed case - string with false positive + real code", () => {
    const code = 'const img = "test_123"; const num = 1_000;';
    const result = safePreprocessor(code);

    expect(result).not.toContain('"test_123"');
    expect(result).toContain("const num = 1_000;");
  });
});
