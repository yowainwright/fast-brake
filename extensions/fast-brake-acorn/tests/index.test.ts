import { test, expect, describe } from "bun:test";
import { acornExtension, createAcornExtension } from "../src/index";
import type { ExtensionInput } from "fast-brake";

describe("acornExtension", () => {
  test("should have correct name and description", () => {
    expect(acornExtension.name).toBe("fast-brake-acorn");
    expect(acornExtension.description).toBe(
      "AST validation extension using acorn parser",
    );
  });

  test("should validate valid JavaScript code", () => {
    const input: ExtensionInput = {
      code: "const fn = () => { return 42; };",
      result: {
        name: "arrow_functions",
        match: "=>",
        spec: {},
        rule: "es2015",
        index: 10,
      },
    };

    const output = acornExtension.process(input);

    expect(output.name).toBe("arrow_functions");
    expect(output.spec.astValidated).toBe(true);
  });

  test("should invalidate syntactically incorrect code", () => {
    const input: ExtensionInput = {
      code: "const fn = () => {",
      result: {
        name: "arrow_functions",
        match: "=>",
        spec: {},
        rule: "es2015",
        index: 10,
      },
    };

    const output = acornExtension.process(input);

    expect(output.spec.astValidated).toBe(false);
  });

  test("should preserve original result properties", () => {
    const input: ExtensionInput = {
      code: "const x = 1;",
      result: {
        name: "const_declaration",
        match: "const",
        spec: { custom: "value" },
        rule: "es2015",
        index: 0,
      },
    };

    const output = acornExtension.process(input);

    expect(output.name).toBe("const_declaration");
    expect(output.match).toBe("const");
    expect(output.rule).toBe("es2015");
    expect(output.index).toBe(0);
    expect(output.spec.custom).toBe("value");
  });

  test("should handle code without index", () => {
    const input: ExtensionInput = {
      code: "let x = 1;",
      result: {
        name: "let_declaration",
        match: "let",
        spec: {},
        rule: "es2015",
      },
    };

    const output = acornExtension.process(input);

    expect(output.spec.astValidated).toBe(true);
  });
});

describe("createAcornExtension", () => {
  test("should create extension with default options", () => {
    const extension = createAcornExtension();

    expect(extension.name).toBe("fast-brake-acorn");
    expect(extension.description).toBe(
      "AST validation extension using acorn parser",
    );
  });

  test("should validate ES module syntax with module sourceType", () => {
    const extension = createAcornExtension({ sourceType: "module" });

    const input: ExtensionInput = {
      code: "import { foo } from 'bar'; export const x = foo;",
      result: {
        name: "import_declaration",
        match: "import",
        spec: {},
        rule: "es2015",
        index: 0,
      },
    };

    const output = extension.process(input);

    expect(output.spec.astValidated).toBe(true);
  });

  test("should reject ES module syntax with script sourceType", () => {
    const extension = createAcornExtension({ sourceType: "script" });

    const input: ExtensionInput = {
      code: "import { foo } from 'bar';",
      result: {
        name: "import_declaration",
        match: "import",
        spec: {},
        rule: "es2015",
        index: 0,
      },
    };

    const output = extension.process(input);

    expect(output.spec.astValidated).toBe(false);
  });

  test("should accept custom ecmaVersion", () => {
    const extension = createAcornExtension({ ecmaVersion: 2020 });

    const input: ExtensionInput = {
      code: "const x = obj?.prop ?? 'default';",
      result: {
        name: "optional_chaining",
        match: "?.",
        spec: {},
        rule: "es2020",
        index: 12,
      },
    };

    const output = extension.process(input);

    expect(output.spec.astValidated).toBe(true);
  });

  test("should reject newer syntax with older ecmaVersion", () => {
    const extension = createAcornExtension({ ecmaVersion: 2015 });

    const input: ExtensionInput = {
      code: "const x = obj?.prop;",
      result: {
        name: "optional_chaining",
        match: "?.",
        spec: {},
        rule: "es2020",
        index: 12,
      },
    };

    const output = extension.process(input);

    expect(output.spec.astValidated).toBe(false);
  });
});

describe("edge cases", () => {
  test("should handle empty code", () => {
    const input: ExtensionInput = {
      code: "",
      result: {
        name: "empty",
        match: "",
        spec: {},
        rule: "es5",
      },
    };

    const output = acornExtension.process(input);

    expect(output.spec.astValidated).toBe(true);
  });

  test("should handle complex valid code", () => {
    const code = `
      class MyClass extends Base {
        #privateField = 42;

        async getData() {
          const result = await fetch('/api');
          return result?.data ?? [];
        }
      }
    `;

    const input: ExtensionInput = {
      code,
      result: {
        name: "class_declaration",
        match: "class",
        spec: {},
        rule: "es2015",
        index: 7,
      },
    };

    const output = acornExtension.process(input);

    expect(output.spec.astValidated).toBe(true);
  });

  test("should handle template literals", () => {
    const input: ExtensionInput = {
      code: "const greeting = `Hello, ${name}!`;",
      result: {
        name: "template_literals",
        match: "`",
        spec: {},
        rule: "es2015",
        index: 17,
      },
    };

    const output = acornExtension.process(input);

    expect(output.spec.astValidated).toBe(true);
  });

  test("should handle destructuring", () => {
    const input: ExtensionInput = {
      code: "const { a, b: renamed, ...rest } = obj;",
      result: {
        name: "destructuring",
        match: "{",
        spec: {},
        rule: "es2015",
        index: 6,
      },
    };

    const output = acornExtension.process(input);

    expect(output.spec.astValidated).toBe(true);
  });
});
