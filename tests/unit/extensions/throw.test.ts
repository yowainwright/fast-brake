import { test, expect, describe } from "bun:test";
import { throwExtension } from "../../../src/extensions/throw/index";
import { ExtensionInput } from "../../../src/extensions/throw/types";

describe("Throw Extension", () => {
  describe("processThrowExtension", () => {
    test("should detect basic throw statement", () => {
      const input: ExtensionInput = {
        code: "throw new Error('Something went wrong');",
        result: {
          name: "error-throw",
          match: "throw new Error('Something went wrong')",
          spec: {},
          rule: "throw-pattern",
          index: 0,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.type).toBe("error-throw");
      expect(output.spec.throw.errorType).toBe("Error");
      expect(output.spec.throw.message).toBe("Something went wrong");
      expect(output.spec.throw.isAsync).toBe(false);
      expect(output.spec.throw.isCaught).toBe(false);
    });

    test("should detect custom error types", () => {
      const input: ExtensionInput = {
        code: "throw new ValidationError('Invalid input');",
        result: {
          name: "error-throw",
          match: "throw new ValidationError('Invalid input')",
          spec: {},
          rule: "throw-pattern",
          index: 0,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.errorType).toBe("ValidationError");
      expect(output.spec.throw.message).toBe("Invalid input");
    });

    test("should detect Promise.reject", () => {
      const input: ExtensionInput = {
        code: "return Promise.reject(new Error('Failed'));",
        result: {
          name: "promise-rejection",
          match: "Promise.reject(new Error('Failed'))",
          spec: {},
          rule: "promise-reject-pattern",
          index: 7,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.type).toBe("promise-rejection");
    });

    test("should detect throw in try-catch block", () => {
      const input: ExtensionInput = {
        code: `try {
  doSomething();
  throw new Error('In try block');
} catch (e) {
  console.log(e);
}`,
        result: {
          name: "error-throw",
          match: "throw new Error('In try block')",
          spec: {},
          rule: "throw-pattern",
          index: 23,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.isCaught).toBe(true);
      expect(output.spec.throw.message).toBe("In try block");
    });

    test("should detect rethrow pattern", () => {
      const input: ExtensionInput = {
        code: `try {
  doSomething();
} catch (error) {
  logger.error(error);
  throw error;
}`,
        result: {
          name: "error-rethrow",
          match: "throw error",
          spec: {},
          rule: "rethrow-pattern",
          index: 62,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.type).toBe("error-rethrow");
    });

    test("should detect conditional throw", () => {
      const input: ExtensionInput = {
        code: "if (!user) throw new Error('User not found');",
        result: {
          name: "conditional-throw",
          match: "if (!user) throw new Error('User not found')",
          spec: {},
          rule: "conditional-throw-pattern",
          index: 0,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.type).toBe("conditional-throw");
      expect(output.spec.throw.message).toBe("User not found");
    });

    test("should detect async context", () => {
      const input: ExtensionInput = {
        code: `async function fetchData() {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
}`,
        result: {
          name: "error-throw",
          match: "throw new Error('Failed to fetch')",
          spec: {},
          rule: "throw-pattern",
          index: 82,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.isAsync).toBe(true);
      expect(output.spec.throw.message).toBe("Failed to fetch");
    });

    test("should handle throw without Error constructor", () => {
      const input: ExtensionInput = {
        code: "throw 'String error';",
        result: {
          name: "throw-statement",
          match: "throw 'String error'",
          spec: {},
          rule: "throw-pattern",
          index: 0,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.type).toBe("throw-statement");
      expect(output.spec.throw.errorType).toBeUndefined();
      expect(output.spec.throw.message).toBeUndefined();
    });

    test("should preserve existing spec properties", () => {
      const input: ExtensionInput = {
        code: "throw new Error('Test');",
        result: {
          name: "error-throw",
          match: "throw new Error('Test')",
          spec: {
            customProp: "value",
            nested: { prop: true },
          },
          rule: "throw-pattern",
          index: 0,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.customProp).toBe("value");
      expect(output.spec.nested.prop).toBe(true);
      expect(output.spec.throw).toBeDefined();
    });

    test("should handle template literals in error messages", () => {
      const input: ExtensionInput = {
        code: "throw new Error(`User ${userId} not found`);",
        result: {
          name: "error-throw",
          match: "throw new Error(`User ${userId} not found`)",
          spec: {},
          rule: "throw-pattern",
          index: 0,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.type).toBe("error-throw");
      expect(output.spec.throw.errorType).toBe("Error");
      expect(output.spec.throw.message).toBe("User ${userId} not found");
    });

    test("should detect nested try-catch", () => {
      const input: ExtensionInput = {
        code: `try {
  try {
    riskyOperation();
  } catch (inner) {
    throw new Error('Inner error');
  }
} catch (outer) {
  console.error(outer);
}`,
        result: {
          name: "error-throw",
          match: "throw new Error('Inner error')",
          spec: {},
          rule: "throw-pattern",
          index: 55,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.isCaught).toBe(true);
      expect(output.spec.throw.message).toBe("Inner error");
    });

    test("should handle arrow function async context", () => {
      const input: ExtensionInput = {
        code: `const handler = async () => {
  if (!isValid) {
    throw new Error('Validation failed');
  }
};`,
        result: {
          name: "error-throw",
          match: "throw new Error('Validation failed')",
          spec: {},
          rule: "throw-pattern",
          index: 50,
        },
      };

      const output = throwExtension.process(input);

      expect(output.spec.throw.isAsync).toBe(true);
      expect(output.spec.throw.message).toBe("Validation failed");
    });

    test("should return all required properties", () => {
      const input: ExtensionInput = {
        code: "throw new Error('test');",
        result: {
          name: "test",
          match: "throw new Error('test')",
          spec: {},
          rule: "test-rule",
          index: 0,
        },
      };

      const output = throwExtension.process(input);

      expect(output).toHaveProperty("name");
      expect(output).toHaveProperty("match");
      expect(output).toHaveProperty("spec");
      expect(output).toHaveProperty("rule");
      expect(output.spec).toHaveProperty("throw");
      expect(output.spec.throw).toHaveProperty("type");
      expect(output.spec.throw).toHaveProperty("isAsync");
      expect(output.spec.throw).toHaveProperty("isCaught");
    });
  });

  describe("Extension metadata", () => {
    test("should export correct metadata", () => {
      expect(throwExtension.name).toBe("throw");
      expect(throwExtension.description).toContain("error handling patterns");
      expect(throwExtension.spec).toBeDefined();
      expect(throwExtension.process).toBeDefined();
      expect(typeof throwExtension.process).toBe("function");
    });

    test("should have valid example in spec", () => {
      expect(throwExtension.spec.code).toBe(
        "throw new Error('Invalid operation');",
      );
      expect(throwExtension.spec.result.name).toBe("throw-statement");
      expect(throwExtension.spec.result.spec.throw).toBeDefined();
      expect(throwExtension.spec.result.spec.throw.type).toBe("error-throw");
      expect(throwExtension.spec.result.spec.throw.errorType).toBe("Error");
      expect(throwExtension.spec.result.spec.throw.message).toBe(
        "Invalid operation",
      );
    });
  });
});
