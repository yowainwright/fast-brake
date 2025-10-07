import { test, expect, describe } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { getCachedRegex, fastIndexOf } from "../../src/utils";
import {
  stripComments,
  countNewlines,
  isWordChar,
  isRegexFlag,
  findPrevNonSpace,
} from "../../src/plugins/jscomments";

describe("getCachedRegex", () => {
  test("should return same regex instance for same pattern", () => {
    const regex1 = getCachedRegex("test.*pattern");
    const regex2 = getCachedRegex("test.*pattern");
    expect(regex1).toBe(regex2);
  });

  test("should return different instances for different patterns", () => {
    const regex1 = getCachedRegex("pattern1");
    const regex2 = getCachedRegex("pattern2");
    expect(regex1).not.toBe(regex2);
  });

  test("should handle flags correctly", () => {
    const regex1 = getCachedRegex("test", "i");
    const regex2 = getCachedRegex("test", "g");
    expect(regex1).not.toBe(regex2);
  });

  test("should reset lastIndex on retrieval", () => {
    const regex = getCachedRegex("test", "g");
    regex.exec("test test test");
    const regex2 = getCachedRegex("test", "g");
    expect(regex2.lastIndex).toBe(0);
  });
});

describe("fastIndexOf", () => {
  test("should find pattern at beginning", () => {
    const result = fastIndexOf("hello world", "hello");
    expect(result).toBe(0);
  });

  test("should find pattern in middle", () => {
    const result = fastIndexOf("hello world", "world");
    expect(result).toBe(6);
  });

  test("should return -1 when pattern not found", () => {
    const result = fastIndexOf("hello world", "foo");
    expect(result).toBe(-1);
  });

  test("should handle empty pattern", () => {
    const result = fastIndexOf("hello", "");
    expect(result).toBe(0);
  });

  test("should handle pattern longer than text", () => {
    const result = fastIndexOf("hi", "hello");
    expect(result).toBe(-1);
  });

  test("should handle long patterns", () => {
    const longPattern = "this is a very long pattern to search for";
    const text = "some text before " + longPattern + " and after";
    const result = fastIndexOf(text, longPattern);
    expect(result).toBe(17);
  });

  test("should respect startIndex parameter", () => {
    const text = "hello hello hello";
    const result = fastIndexOf(text, "hello", 6);
    expect(result).toBe(6);
  });

  test("should handle special characters in pattern", () => {
    const text = "const regex = /test.*pattern/";
    const result = fastIndexOf(text, ".*");
    expect(result).toBe(19);
  });
});

describe("stripComments", () => {
  test("should strip line comments", () => {
    const code = "const x = 1; // comment\nconst y = 2;";
    const result = stripComments(code);
    expect(result).toBe("const x = 1; \nconst y = 2;");
  });

  test("should strip block comments", () => {
    const code = "const x = 1; /* comment */ const y = 2;";
    const result = stripComments(code);
    expect(result).toBe("const x = 1;  const y = 2;");
  });

  test("should strip multiline block comments", () => {
    const code = "const x = 1;\n/* line1\nline2\nline3 */\nconst y = 2;";
    const result = stripComments(code);
    expect(result).toBe("const x = 1;\n\n\n\nconst y = 2;");
  });

  test("should preserve strings with comment-like content", () => {
    const code = 'const x = "// not a comment";';
    const result = stripComments(code);
    expect(result).toBe(code);
  });

  test("should preserve strings with block comment-like content", () => {
    const code = 'const x = "/* not a comment */";';
    const result = stripComments(code);
    expect(result).toBe(code);
  });

  test("should preserve template literals", () => {
    const code = "const x = `template // with comment-like ${expr}`;";
    const result = stripComments(code);
    expect(result).toBe(code);
  });

  test("should preserve regex literals", () => {
    const code = "const regex = /test/gi;";
    const result = stripComments(code);
    expect(result).toBe(code);
  });

  test("should preserve division operators", () => {
    const code = "const x = a / b;";
    const result = stripComments(code);
    expect(result).toBe(code);
  });

  test("should handle escaped quotes in strings", () => {
    const code = 'const x = "string with \\" quote";';
    const result = stripComments(code);
    expect(result).toBe(code);
  });

  test("should handle line comment at end of file", () => {
    const code = "const x = 1; // comment";
    const result = stripComments(code);
    expect(result).toBe("const x = 1; ");
  });

  test("should handle unclosed block comment", () => {
    const code = "const x = 1; /* unclosed";
    const result = stripComments(code);
    expect(result).toBe("const x = 1; ");
  });

  test("should handle complex code", () => {
    const code = `
// Header comment
const arrow = () => {
  // inline comment
  const x = "string"; /* block */ const y = /regex/;
  return x; // end comment
};
`;
    const result = stripComments(code);
    expect(result).toContain("const arrow = () => {");
    expect(result).toContain('const x = "string";');
    expect(result).toContain("const y = /regex/;");
    expect(result).not.toContain("// Header");
    expect(result).not.toContain("/* block */");
  });

  test("should match fixture file output", () => {
    const input = readFileSync(
      join(__dirname, "../fixtures/comments.ts"),
      "utf-8",
    );
    const expected = readFileSync(
      join(__dirname, "../fixtures/comments-expected.ts"),
      "utf-8",
    );
    const result = stripComments(input);

    if (result !== expected) {
      console.error(
        "\n❌ Fixture file is out of sync!\n" +
          "Run: bun run generate:fixtures\n",
      );
    }

    expect(result).toBe(expected);
  });
});

describe("countNewlines", () => {
  test("should count newlines", () => {
    expect(countNewlines("line1\nline2\nline3")).toBe(2);
  });

  test("should return 0 for no newlines", () => {
    expect(countNewlines("single line")).toBe(0);
  });

  test("should handle empty string", () => {
    expect(countNewlines("")).toBe(0);
  });
});

describe("isWordChar", () => {
  test("should identify lowercase letters", () => {
    expect(isWordChar("a")).toBe(true);
    expect(isWordChar("z")).toBe(true);
  });

  test("should identify uppercase letters", () => {
    expect(isWordChar("A")).toBe(true);
    expect(isWordChar("Z")).toBe(true);
  });

  test("should identify digits", () => {
    expect(isWordChar("0")).toBe(true);
    expect(isWordChar("9")).toBe(true);
  });

  test("should identify underscore and dollar sign", () => {
    expect(isWordChar("_")).toBe(true);
    expect(isWordChar("$")).toBe(true);
  });

  test("should reject non-word characters", () => {
    expect(isWordChar(" ")).toBe(false);
    expect(isWordChar("-")).toBe(false);
    expect(isWordChar(".")).toBe(false);
  });
});

describe("isRegexFlag", () => {
  test("should identify valid regex flags", () => {
    expect(isRegexFlag("g")).toBe(true);
    expect(isRegexFlag("i")).toBe(true);
    expect(isRegexFlag("m")).toBe(true);
    expect(isRegexFlag("s")).toBe(true);
    expect(isRegexFlag("u")).toBe(true);
    expect(isRegexFlag("y")).toBe(true);
  });

  test("should reject invalid flags", () => {
    expect(isRegexFlag("a")).toBe(false);
    expect(isRegexFlag("x")).toBe(false);
    expect(isRegexFlag(" ")).toBe(false);
  });
});

describe("findPrevNonSpace", () => {
  test("should find previous non-space character", () => {
    const code = "hello   ";
    expect(findPrevNonSpace(code, 7)).toBe(4);
  });

  test("should return -1 when all spaces", () => {
    const code = "    ";
    expect(findPrevNonSpace(code, 3)).toBe(-1);
  });

  test("should handle newlines and tabs", () => {
    const code = "hello\n\t ";
    expect(findPrevNonSpace(code, 7)).toBe(4);
  });
});
