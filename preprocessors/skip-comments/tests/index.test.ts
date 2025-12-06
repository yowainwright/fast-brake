import { test, expect, describe } from "bun:test";
import {
  isInsideComment,
  isInsideString,
  isInsideCommentOrString,
  shouldSkipMatch,
} from "../src/index";

describe("isInsideComment", () => {
  test("should return false for code outside comments", () => {
    const code = "const x = 1;";
    expect(isInsideComment(code, 6)).toBe(false);
  });

  test("should return true for code inside line comment", () => {
    const code = "// const x = 1;";
    expect(isInsideComment(code, 6)).toBe(true);
  });

  test("should return true for code inside block comment", () => {
    const code = "/* const x = 1; */";
    expect(isInsideComment(code, 6)).toBe(true);
  });

  test("should return false after block comment closes", () => {
    const code = "/* comment */ const x = 1;";
    expect(isInsideComment(code, 20)).toBe(false);
  });

  test("should handle multiline block comments", () => {
    const code = "/*\n * comment\n */ const x = 1;";
    expect(isInsideComment(code, 10)).toBe(true);
    expect(isInsideComment(code, 25)).toBe(false);
  });

  test("should return false for // inside string", () => {
    const code = 'const url = "http://example.com";';
    expect(isInsideComment(code, 20)).toBe(false);
  });

  test("should handle JSDoc comments", () => {
    const code = "/** @param {string} x */";
    expect(isInsideComment(code, 5)).toBe(true);
    expect(isInsideComment(code, 3)).toBe(true);
  });

  test("should handle nested-looking comments", () => {
    const code = "/* outer /* inner */ outside";
    expect(isInsideComment(code, 10)).toBe(true);
    expect(isInsideComment(code, 25)).toBe(false);
  });
});

describe("isInsideString", () => {
  test("should return false for code outside strings", () => {
    const code = "const x = 1;";
    expect(isInsideString(code, 6)).toBe(false);
  });

  test("should return true for code inside double quotes", () => {
    const code = 'const x = "hello";';
    expect(isInsideString(code, 13)).toBe(true);
  });

  test("should return true for code inside single quotes", () => {
    const code = "const x = 'hello';";
    expect(isInsideString(code, 13)).toBe(true);
  });

  test("should return true for code inside template literal", () => {
    const code = "const x = `hello`;";
    expect(isInsideString(code, 13)).toBe(true);
  });

  test("should return false after string closes", () => {
    const code = 'const x = "hi"; const y = 1;';
    expect(isInsideString(code, 22)).toBe(false);
  });

  test("should handle escaped quotes", () => {
    const code = 'const x = "say \\"hello\\"";';
    expect(isInsideString(code, 18)).toBe(true);
  });

  test("should handle mixed quote types", () => {
    const code = `const x = "it's fine";`;
    expect(isInsideString(code, 15)).toBe(true);
  });

  test("should handle arrow function inside string", () => {
    const code = 'const x = "=> arrow";';
    expect(isInsideString(code, 12)).toBe(true);
  });

  test("should return false for arrow function outside string", () => {
    const code = "const fn = () => {};";
    expect(isInsideString(code, 15)).toBe(false);
  });
});

describe("isInsideCommentOrString", () => {
  test("should return true for comment", () => {
    const code = "// comment\ncode";
    expect(isInsideCommentOrString(code, 5)).toBe(true);
  });

  test("should return true for string", () => {
    const code = 'const x = "string";';
    expect(isInsideCommentOrString(code, 13)).toBe(true);
  });

  test("should return false for code", () => {
    const code = "const x = 1;";
    expect(isInsideCommentOrString(code, 6)).toBe(false);
  });
});

describe("shouldSkipMatch", () => {
  test("should return skip: true with reason comment", () => {
    const code = "// comment with =>";
    const result = shouldSkipMatch(code, 17);
    expect(result.skip).toBe(true);
    expect(result.reason).toBe("comment");
  });

  test("should return skip: true with reason string", () => {
    const code = 'const x = "=> arrow";';
    const result = shouldSkipMatch(code, 12);
    expect(result.skip).toBe(true);
    expect(result.reason).toBe("string");
  });

  test("should return skip: false for valid code", () => {
    const code = "const fn = () => {};";
    const result = shouldSkipMatch(code, 15);
    expect(result.skip).toBe(false);
    expect(result.reason).toBeUndefined();
  });

  test("should prioritize comment over string check", () => {
    const code = '// "string in comment"';
    const result = shouldSkipMatch(code, 10);
    expect(result.skip).toBe(true);
    expect(result.reason).toBe("comment");
  });
});

describe("real-world scenarios", () => {
  test("should handle URL in code", () => {
    const code = 'fetch("https://api.example.com/data");';
    expect(isInsideComment(code, 15)).toBe(false);
    expect(isInsideString(code, 15)).toBe(true);
  });

  test("should handle regex-like patterns in strings", () => {
    const code = 'const pattern = "/**/";';
    expect(isInsideComment(code, 18)).toBe(false);
    expect(isInsideString(code, 18)).toBe(true);
  });

  test("should handle multiline template literal", () => {
    const code = "const x = `line1\nline2\nline3`;";
    expect(isInsideString(code, 20)).toBe(true);
  });

  test("should handle code after multiline comment", () => {
    const code = `/**
 * JSDoc comment
 * @param x
 */
const fn = () => {};`;
    const arrowIndex = code.indexOf("=>");
    expect(isInsideComment(code, arrowIndex)).toBe(false);
  });
});
