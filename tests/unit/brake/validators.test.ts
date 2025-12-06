import { test, expect, describe } from "bun:test";
import {
  excludeValidator,
  contextValidator,
  commentValidator,
  stringValidator,
  resolveValidator,
  getContext,
  isInsideComment,
  isInsideString,
  BUILT_IN_VALIDATORS,
} from "../../../src/brake/validators";
import type {
  ValidatorContext,
  BrakeValidator,
} from "../../../src/brake/types";

describe("excludeValidator", () => {
  test("should return true when no excludes provided", () => {
    const ctx: ValidatorContext = { context: "const x = 1;" };
    const result = excludeValidator.validate(ctx);
    expect(result).toBe(true);
  });

  test("should return true when excludes is empty array", () => {
    const ctx: ValidatorContext = { context: "const x = 1;", excludes: [] };
    const result = excludeValidator.validate(ctx);
    expect(result).toBe(true);
  });

  test("should return true when context does not contain any exclude", () => {
    const ctx: ValidatorContext = {
      context: "const x = 1;",
      excludes: ["function", "var"],
    };
    const result = excludeValidator.validate(ctx);
    expect(result).toBe(true);
  });

  test("should return false when context contains an exclude", () => {
    const ctx: ValidatorContext = {
      context: "const x = 1;",
      excludes: ["const", "var"],
    };
    const result = excludeValidator.validate(ctx);
    expect(result).toBe(false);
  });

  test("should have correct name", () => {
    expect(excludeValidator.name).toBe("exclude");
  });
});

describe("contextValidator", () => {
  test("should return true when no match provided", () => {
    const ctx: ValidatorContext = { context: "const x = 1;" };
    const result = contextValidator.validate(ctx);
    expect(result).toBe(true);
  });

  test("should return true when context contains the match", () => {
    const ctx: ValidatorContext = {
      context: "const fn = () => {};",
      match: { name: "arrow_functions", match: "=>", spec: "", rule: "es2015" },
    };
    const result = contextValidator.validate(ctx);
    expect(result).toBe(true);
  });

  test("should return false when context does not contain the match", () => {
    const ctx: ValidatorContext = {
      context: "const x = 1;",
      match: { name: "arrow_functions", match: "=>", spec: "", rule: "es2015" },
    };
    const result = contextValidator.validate(ctx);
    expect(result).toBe(false);
  });

  test("should have correct name", () => {
    expect(contextValidator.name).toBe("context");
  });
});

describe("BUILT_IN_VALIDATORS", () => {
  test("should contain exclude validator", () => {
    expect(BUILT_IN_VALIDATORS.exclude).toBe(excludeValidator);
  });

  test("should contain context validator", () => {
    expect(BUILT_IN_VALIDATORS.context).toBe(contextValidator);
  });

  test("should contain comment validator", () => {
    expect(BUILT_IN_VALIDATORS.comment).toBe(commentValidator);
  });

  test("should contain string validator", () => {
    expect(BUILT_IN_VALIDATORS.string).toBe(stringValidator);
  });
});

describe("isInsideComment", () => {
  test("should return false for code outside comments", () => {
    const code = "const x = 1;";
    const result = isInsideComment(code, 6);
    expect(result).toBe(false);
  });

  test("should return true for code inside line comment", () => {
    const code = "// const x = 1;";
    const result = isInsideComment(code, 6);
    expect(result).toBe(true);
  });

  test("should return true for code inside block comment", () => {
    const code = "/* const x = 1; */";
    const result = isInsideComment(code, 6);
    expect(result).toBe(true);
  });

  test("should return false after block comment closes", () => {
    const code = "/* comment */ const x = 1;";
    const result = isInsideComment(code, 20);
    expect(result).toBe(false);
  });

  test("should handle multiline block comments", () => {
    const code = "/*\n * comment\n */ const x = 1;";
    const insideComment = isInsideComment(code, 10);
    const outsideComment = isInsideComment(code, 25);
    expect(insideComment).toBe(true);
    expect(outsideComment).toBe(false);
  });

  test("should return false for // inside string", () => {
    const code = 'const url = "http://example.com";';
    const result = isInsideComment(code, 20);
    expect(result).toBe(false);
  });
});

describe("isInsideString", () => {
  test("should return false for code outside strings", () => {
    const code = "const x = 1;";
    const result = isInsideString(code, 6);
    expect(result).toBe(false);
  });

  test("should return true for code inside double quotes", () => {
    const code = 'const x = "hello";';
    const result = isInsideString(code, 13);
    expect(result).toBe(true);
  });

  test("should return true for code inside single quotes", () => {
    const code = "const x = 'hello';";
    const result = isInsideString(code, 13);
    expect(result).toBe(true);
  });

  test("should return true for code inside template literal", () => {
    const code = "const x = `hello`;";
    const result = isInsideString(code, 13);
    expect(result).toBe(true);
  });

  test("should return false after string closes", () => {
    const code = 'const x = "hi"; const y = 1;';
    const result = isInsideString(code, 22);
    expect(result).toBe(false);
  });

  test("should handle escaped quotes", () => {
    const code = 'const x = "say \\"hello\\"";';
    const insideString = isInsideString(code, 18);
    expect(insideString).toBe(true);
  });

  test("should handle mixed quote types", () => {
    const code = `const x = "it's fine";`;
    const result = isInsideString(code, 15);
    expect(result).toBe(true);
  });
});

describe("resolveValidator", () => {
  test("should resolve 'exclude' string to excludeValidator", () => {
    const validator = resolveValidator("exclude");
    expect(validator).toBe(excludeValidator);
  });

  test("should resolve 'context' string to contextValidator", () => {
    const validator = resolveValidator("context");
    expect(validator).toBe(contextValidator);
  });

  test("should throw for unknown validator name", () => {
    expect(() => resolveValidator("unknown" as "exclude")).toThrow(
      "Unknown validator: unknown",
    );
  });

  test("should return custom validator as-is", () => {
    const customValidator: BrakeValidator = {
      name: "custom",
      validate: () => true,
    };
    const resolved = resolveValidator(customValidator);
    expect(resolved).toBe(customValidator);
  });
});

describe("getContext", () => {
  const code = "line1\nline2 has match here\nline3";

  test("should return full code when chars is 'full'", () => {
    const result = getContext(code, 10, "full");
    expect(result).toBe(code);
  });

  test("should return line when chars is 'line'", () => {
    const result = getContext(code, 10, "line");
    expect(result).toBe("line2 has match here");
  });

  test("should return line at start of file", () => {
    const result = getContext(code, 2, "line");
    expect(result).toBe("line1");
  });

  test("should return line at end of file", () => {
    const result = getContext(code, 28, "line");
    expect(result).toBe("line3");
  });

  test("should return substring with numeric chars", () => {
    const result = getContext(code, 10, 5);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result).toContain("line2");
  });

  test("should clamp to start of string", () => {
    const result = getContext(code, 2, 10);
    expect(result.startsWith("line1")).toBe(true);
  });

  test("should clamp to end of string", () => {
    const result = getContext(code, 28, 10);
    expect(result.endsWith("line3")).toBe(true);
  });

  test("should handle zero chars", () => {
    const result = getContext(code, 10, 0);
    expect(result).toBe("");
  });
});
