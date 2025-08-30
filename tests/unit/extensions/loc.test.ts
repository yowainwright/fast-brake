import { test, expect, describe } from "bun:test";
import {
  enrichWithLoc,
  enrichFeaturesWithLoc,
  findFeatureWithLoc,
  type LocEnrichedFeature,
} from "../../../src/extensions/loc";
import type { DetectedFeature } from "../../../src/types";
import { detect } from "../../../src/detector";

describe("LOC Extension", () => {
  describe("enrichWithLoc", () => {
    test("should add location data to detected feature", () => {
      const code = "const fn = () => {}";
      const feature: DetectedFeature = {
        name: "arrow_functions",
        version: "es2015",
      };

      const enriched = enrichWithLoc(code, feature);

      expect(enriched).toBeDefined();
      expect(enriched?.loc).toBeDefined();
      // The arrow function "=>" starts at index 14 (0-based), which is column 15 (1-based)
      expect(enriched?.loc?.start).toEqual({ line: 1, column: 15 });
      // "=>" is 2 characters long, so it ends at column 16
      expect(enriched?.loc?.end).toEqual({ line: 1, column: 17 });
      expect(enriched?.loc?.offset).toBe(14);
      expect(enriched?.loc?.length).toBe(2);
      expect(enriched?.snippet).toBe("=>");
    });

    test("should handle multiline features", () => {
      const code = `const str = \`
        multiline
        template
      \`;`;
      
      const feature: DetectedFeature = {
        name: "template_literals",
        version: "es2015",
        line: 1,
        column: 13,
        snippet: "`",
      };

      const enriched = enrichWithLoc(code, feature);

      expect(enriched?.loc?.start.line).toBe(1);
      expect(enriched?.loc?.end.line).toBe(1);
    });

    test("should return null for unknown feature", () => {
      const code = "const fn = () => {}";
      const feature: DetectedFeature = {
        name: "unknown_feature",
        version: "es2015",
      };

      const enriched = enrichWithLoc(code, feature);
      expect(enriched).toBeNull();
    });
  });

  describe("enrichFeaturesWithLoc", () => {
    test("should enrich multiple features", () => {
      const code = "const fn = () => { return obj?.prop ?? 'default'; }";
      const features = detect(code, { target: "esnext" });

      const enriched = enrichFeaturesWithLoc(code, features);

      expect(enriched.length).toBeGreaterThan(0);
      enriched.forEach(feature => {
        expect(feature.loc).toBeDefined();
      });
    });

    test("should filter out features that cannot be enriched", () => {
      const features: DetectedFeature[] = [
        { name: "arrow_functions", version: "es2015", line: 1, column: 15, snippet: "const fn = () => {}" },
        { name: "unknown_feature", version: "es2015" }
      ];

      const enriched = enrichFeaturesWithLoc("const fn = () => {}", features);

      expect(enriched.length).toBe(1);
      expect(enriched[0].name).toBe("arrow_functions");
    });
  });

  describe("findFeatureWithLoc", () => {
    test("should find feature by name", () => {
      const code = "obj?.prop";
      
      const feature = findFeatureWithLoc(code, "optional_chaining");

      expect(feature).toBeDefined();
      expect(feature?.name).toBe("optional_chaining");
      expect(feature?.loc).toBeDefined();
      expect(feature?.line).toBe(1);
    });

    test("should find feature at specific line", () => {
      const code = `const a = () => {};
const b = () => {};`;
      
      const feature = findFeatureWithLoc(code, "arrow_functions", 2);

      expect(feature).toBeDefined();
      expect(feature?.line).toBe(2);
      expect(feature?.snippet).toContain("const b = () => {}");
    });

    test("should return null for non-existent feature", () => {
      const code = "const x = 1;";
      
      const feature = findFeatureWithLoc(code, "arrow_functions");

      expect(feature).toBeNull();
    });
  });
});