import { test, expect, describe } from "bun:test";
import { locExtension } from "../../../src/extensions/loc/index";
import { ExtensionInput } from "../../../src/extensions/loc/types";

describe("LOC Extension", () => {
  describe("processLOCExtension", () => {
    test("should calculate correct line and column positions", () => {
      const input: ExtensionInput = {
        code: "function test() {\n  return 42;\n}",
        result: {
          name: "return-statement",
          match: "return 42",
          spec: {},
          rule: "return-pattern",
          index: 20,
        },
      };

      const output = locExtension.process(input);

      expect(output.spec.loc.start.line).toBe(2);
      expect(output.spec.loc.start.column).toBe(2);
      expect(output.spec.loc.end.line).toBe(2);
      expect(output.spec.loc.end.column).toBe(11);
      expect(output.spec.loc.offset).toBe(20);
      expect(output.spec.loc.length).toBe(9);
    });

    test("should handle single line code", () => {
      const input: ExtensionInput = {
        code: "const arrow = () => { return 42; }",
        result: {
          name: "arrow-function",
          match: "() =>",
          spec: {},
          rule: "arrow-function-pattern",
          index: 14,
        },
      };

      const output = locExtension.process(input);

      expect(output.spec.loc.start.line).toBe(1);
      expect(output.spec.loc.start.column).toBe(14);
      expect(output.spec.loc.end.line).toBe(1);
      expect(output.spec.loc.end.column).toBe(19);
    });

    test("should handle empty match at position 0", () => {
      const input: ExtensionInput = {
        code: "const test = 123;",
        result: {
          name: "const-declaration",
          match: "const",
          spec: {},
          rule: "const-pattern",
        },
      };

      const output = locExtension.process(input);

      expect(output.spec.loc.offset).toBe(0);
      expect(output.spec.loc.start.line).toBe(1);
      expect(output.spec.loc.start.column).toBe(0);
    });

    test("should preserve existing spec properties", () => {
      const input: ExtensionInput = {
        code: "function test() {}",
        result: {
          name: "function",
          match: "function test",
          spec: {
            customProp: "value",
            nested: { prop: true },
          },
          rule: "function-pattern",
          index: 0,
        },
      };

      const output = locExtension.process(input);

      expect(output.spec.customProp).toBe("value");
      expect(output.spec.nested.prop).toBe(true);
      expect(output.spec.loc).toBeDefined();
    });

    test("should handle multiline matches", () => {
      const input: ExtensionInput = {
        code: "line1\nline2\nline3\nline4",
        result: {
          name: "multiline",
          match: "line2\nline3",
          spec: {},
          rule: "multiline-pattern",
          index: 6,
        },
      };

      const output = locExtension.process(input);

      expect(output.spec.loc.start.line).toBe(2);
      expect(output.spec.loc.start.column).toBe(0);
      expect(output.spec.loc.end.line).toBe(3);
      expect(output.spec.loc.end.column).toBe(5);
      expect(output.spec.loc.length).toBe(11);
    });

    test("should return all required properties", () => {
      const input: ExtensionInput = {
        code: "test code",
        result: {
          name: "test",
          match: "test",
          spec: {},
          rule: "test-rule",
          index: 0,
        },
      };

      const output = locExtension.process(input);

      expect(output).toHaveProperty("name");
      expect(output).toHaveProperty("match");
      expect(output).toHaveProperty("spec");
      expect(output).toHaveProperty("rule");
      expect(output.spec).toHaveProperty("loc");
    });
  });

  describe("Extension metadata", () => {
    test("should export correct metadata", () => {
      expect(locExtension.name).toBe("loc");
      expect(locExtension.description).toContain("location information");
      expect(locExtension.spec).toBeDefined();
      expect(locExtension.process).toBeDefined();
      expect(typeof locExtension.process).toBe("function");
    });

    test("should have valid example in spec", () => {
      expect(locExtension.spec.code).toBe("const arrow = () => { return 42; }");
      expect(locExtension.spec.result.name).toBe("arrow-function");
      expect(locExtension.spec.result.match).toBe("() =>");
      expect(locExtension.spec.result.spec.loc).toBeDefined();
    });
  });
});
