import { test, expect, describe } from "bun:test";
import { locExtension } from "../../../src/extensions/loc";
import extensionsSchema from "../../../src/extensionsSchema.json";

describe("LOC Extension", () => {
  describe("Schema Compliance", () => {
    test("should have all required top-level properties", () => {
      expect(locExtension).toHaveProperty("name");
      expect(locExtension).toHaveProperty("description");
      expect(locExtension).toHaveProperty("spec");
    });

    test("should have correct property types", () => {
      expect(typeof locExtension.name).toBe("string");
      expect(typeof locExtension.description).toBe("string");
      expect(typeof locExtension.spec).toBe("object");
    });

    test("should have non-empty required fields", () => {
      expect(locExtension.name.length).toBeGreaterThan(0);
      expect(locExtension.description.length).toBeGreaterThan(0);
    });

    test("should have spec with required properties", () => {
      expect(locExtension.spec).toHaveProperty("code");
      expect(locExtension.spec).toHaveProperty("result");
      expect(typeof locExtension.spec.code).toBe("string");
      expect(typeof locExtension.spec.result).toBe("object");
    });

    test("should have result with all required DetectMatch properties", () => {
      const { result } = locExtension.spec;

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

    test("should not have extra properties at root level", () => {
      const allowedKeys = ["name", "description", "spec"];
      const actualKeys = Object.keys(locExtension);

      actualKeys.forEach((key) => {
        expect(allowedKeys).toContain(key);
      });
    });
  });

  describe("Extension Specifics", () => {
    test("should have correct name", () => {
      expect(locExtension.name).toBe("loc");
    });

    test("should have descriptive description", () => {
      expect(locExtension.description).toContain("location");
      expect(locExtension.description.length).toBeGreaterThan(20);
    });

    test("should have valid example code", () => {
      const { code } = locExtension.spec;
      expect(code).toBeTruthy();
      expect(code).toContain("=>"); // Should contain arrow function
    });

    test("should have complete loc information in result", () => {
      const { loc } = locExtension.spec.result.spec;

      expect(loc).toBeDefined();
      expect(loc).toHaveProperty("start");
      expect(loc).toHaveProperty("end");
      expect(loc).toHaveProperty("offset");
      expect(loc).toHaveProperty("length");

      // Validate start position
      expect(loc.start).toHaveProperty("line");
      expect(loc.start).toHaveProperty("column");
      expect(typeof loc.start.line).toBe("number");
      expect(typeof loc.start.column).toBe("number");
      expect(loc.start.line).toBeGreaterThan(0);
      expect(loc.start.column).toBeGreaterThanOrEqual(0);

      // Validate end position
      expect(loc.end).toHaveProperty("line");
      expect(loc.end).toHaveProperty("column");
      expect(typeof loc.end.line).toBe("number");
      expect(typeof loc.end.column).toBe("number");
      expect(loc.end.line).toBeGreaterThanOrEqual(loc.start.line);

      // Validate offset and length
      expect(typeof loc.offset).toBe("number");
      expect(typeof loc.length).toBe("number");
      expect(loc.offset).toBeGreaterThanOrEqual(0);
      expect(loc.length).toBeGreaterThan(0);
    });

    test("should have consistent match and location data", () => {
      const { result } = locExtension.spec;

      // Match length should equal loc.length
      expect(result.match.length).toBe(result.spec.loc.length);

      // Index should match offset if provided
      if (result.index !== undefined) {
        expect(result.index).toBe(result.spec.loc.offset);
      }
    });

    test("should have valid arrow function detection", () => {
      const { result } = locExtension.spec;

      expect(result.name).toBe("arrow-function");
      expect(result.match).toBe("() =>");
      expect(result.rule).toContain("arrow");
    });

    test("should have realistic example values", () => {
      const { result, code } = locExtension.spec;

      // Code should contain the match
      expect(code).toContain(result.match);

      // Index should be within code bounds
      if (result.index !== undefined) {
        expect(result.index).toBeLessThan(code.length);
        expect(result.index).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Data Integrity", () => {
    test("should have immutable structure", () => {
      const original = JSON.stringify(locExtension);
      const frozen = Object.freeze(locExtension);

      expect(() => {
        // @ts-ignore - Testing runtime behavior
        frozen.name = "modified";
      }).toThrow();

      expect(JSON.stringify(locExtension)).toBe(original);
    });

    test("should be serializable", () => {
      const serialized = JSON.stringify(locExtension);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(locExtension);
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

      checkUndefined(locExtension);
    });
  });
});
