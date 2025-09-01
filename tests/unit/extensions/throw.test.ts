import { describe, expect, it, test } from "bun:test";
import { throwExtension } from "../../../src/extensions/throw";
import extensionsSchema from "../../../src/extensionsSchema.json";

describe("throw extension", () => {
  describe("Schema Compliance", () => {
    it("should have all required top-level properties", () => {
      expect(throwExtension).toHaveProperty("name");
      expect(throwExtension).toHaveProperty("description");
      expect(throwExtension).toHaveProperty("spec");
    });

    it("should have correct property types", () => {
      expect(typeof throwExtension.name).toBe("string");
      expect(typeof throwExtension.description).toBe("string");
      expect(typeof throwExtension.spec).toBe("object");
    });

    it("should have non-empty required fields", () => {
      expect(throwExtension.name.length).toBeGreaterThan(0);
      expect(throwExtension.description.length).toBeGreaterThan(0);
    });

    it("should have spec with required properties", () => {
      expect(throwExtension.spec).toHaveProperty("code");
      expect(throwExtension.spec).toHaveProperty("result");
      expect(typeof throwExtension.spec.code).toBe("string");
      expect(typeof throwExtension.spec.result).toBe("object");
    });

    it("should have result with all required DetectMatch properties", () => {
      const { result } = throwExtension.spec;

      // Required properties from schema
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("match");
      expect(result).toHaveProperty("spec");
      expect(result).toHaveProperty("rule");

      // Check types
      expect(typeof result.name).toBe("string");
      expect(typeof result.match).toBe("string");
      expect(typeof result.spec).toBe("object");
      expect(typeof result.rule).toBe("string");

      // Optional index property
      if (result.index !== undefined) {
        expect(typeof result.index).toBe("number");
      }
    });

    it("should not have extra properties at root level", () => {
      const allowedKeys = ["name", "description", "spec"];
      const actualKeys = Object.keys(throwExtension);

      actualKeys.forEach((key) => {
        expect(allowedKeys).toContain(key);
      });
    });
  });

  describe("Extension Specifics", () => {
    it("should have correct name", () => {
      expect(throwExtension.name).toBe("throw");
    });

    it("should have descriptive description", () => {
      expect(throwExtension.description).toContain("error");
      expect(throwExtension.description.length).toBeGreaterThan(20);
    });

    it("should have valid example code", () => {
      const { code } = throwExtension.spec;
      expect(code).toBeTruthy();
      expect(code).toContain("throw"); // Should contain throw statement
      expect(code).toContain("Error"); // Should contain Error
    });

    it("should have complete throw information in result", () => {
      const { spec } = throwExtension.spec.result;

      expect(spec).toBeDefined();
      expect(spec).toHaveProperty("type");
      expect(spec).toHaveProperty("errorType");
      expect(spec).toHaveProperty("message");

      expect(typeof spec.type).toBe("string");
      expect(typeof spec.errorType).toBe("string");
      expect(typeof spec.message).toBe("string");
    });

    it("should have valid throw statement detection", () => {
      const { result } = throwExtension.spec;

      expect(result.name).toBe("throw-statement");
      expect(result.match).toBe("throw new Error");
      expect(result.rule).toContain("throw");
    });

    it("should have consistent error information", () => {
      const { result, code } = throwExtension.spec;

      // Code should contain the match
      expect(code).toContain(result.match);

      // Error type should match
      expect(result.spec.errorType).toBe("Error");

      // Message should be in the code
      expect(code).toContain(result.spec.message);
    });

    it("should have index at start for throw statement", () => {
      const { result } = throwExtension.spec;

      // Throw statement typically starts at beginning
      expect(result.index).toBe(0);
    });
  });

  describe("Data Integrity", () => {
    test("should have immutable structure", () => {
      const original = JSON.stringify(throwExtension);
      const frozen = Object.freeze(throwExtension);

      expect(() => {
        // @ts-ignore - Testing runtime behavior
        frozen.name = "modified";
      }).toThrow();

      expect(JSON.stringify(throwExtension)).toBe(original);
    });

    test("should be serializable", () => {
      const serialized = JSON.stringify(throwExtension);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(throwExtension);
    });

    test("should not contain undefined values", () => {
      const checkUndefined = (obj: any, path = ""): void => {
        Object.entries(obj).forEach(([key, value]) => {
          expect(value).not.toBeUndefined();
          if (value && typeof value === "object") {
            checkUndefined(value, `${path}.${key}`);
          }
        });
      };

      checkUndefined(throwExtension);
    });

    test("should have valid example that parses correctly", () => {
      const { code } = throwExtension.spec;

      // Should be valid JavaScript
      expect(() => {
        new Function(code);
      }).not.toThrow();
    });
  });

  describe("Error Detection Pattern", () => {
    it("should identify error type correctly", () => {
      const { result } = throwExtension.spec;

      expect(result.spec.type).toBe("error-throw");
      expect(result.spec.errorType).toBe("Error");
    });

    it("should capture error message", () => {
      const { result } = throwExtension.spec;

      expect(result.spec.message).toBe("Invalid operation");
      expect(result.spec.message.length).toBeGreaterThan(0);
    });

    it("should have appropriate pattern matching", () => {
      const { result, code } = throwExtension.spec;

      // The match should be a substring of the code
      expect(code.indexOf(result.match)).toBeGreaterThanOrEqual(0);

      // The pattern should be specific to throw statements
      expect(result.rule).toContain("pattern");
    });

    it("should have realistic index value", () => {
      const { result, code } = throwExtension.spec;

      // Index should be within bounds
      expect(result.index).toBeGreaterThanOrEqual(0);
      expect(result.index).toBeLessThan(code.length);

      // For a throw at the start, index should be 0
      if (code.trim().startsWith("throw")) {
        expect(result.index).toBe(0);
      }
    });
  });
});
