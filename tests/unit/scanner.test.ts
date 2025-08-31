import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Scanner } from "../../src/scanner";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("Scanner", () => {
  const testDir = join(tmpdir(), "fast-brake-scanner-test");
  let scanner: Scanner;

  beforeEach(() => {
    scanner = new Scanner();

    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });

    mkdirSync(join(testDir, "src"));
    mkdirSync(join(testDir, "node_modules"));
    mkdirSync(join(testDir, "dist"));

    writeFileSync(join(testDir, "index.js"), 'console.log("root")');
    writeFileSync(join(testDir, "src", "app.js"), "const app = {}");
    writeFileSync(join(testDir, "src", "app.ts"), "const app: any = {}");
    writeFileSync(join(testDir, "src", "styles.css"), "body { margin: 0 }");
    writeFileSync(
      join(testDir, "node_modules", "lib.js"),
      "module.exports = {}",
    );
    writeFileSync(join(testDir, "dist", "bundle.js"), "var bundle = {}");
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("scan", () => {
    it("should find JavaScript and TypeScript files by default", () => {
      const results = scanner.scan(testDir);
      const paths = results.map((r) => r.path);

      expect(paths).toContain(join(testDir, "index.js"));
      expect(paths).toContain(join(testDir, "src", "app.js"));
      expect(paths).toContain(join(testDir, "src", "app.ts"));
    });

    it("should ignore node_modules by default", () => {
      const results = scanner.scan(testDir);
      const paths = results.map((r) => r.path);

      expect(paths).not.toContain(join(testDir, "node_modules", "lib.js"));
    });

    it("should ignore dist by default", () => {
      const results = scanner.scan(testDir);
      const paths = results.map((r) => r.path);

      expect(paths).not.toContain(join(testDir, "dist", "bundle.js"));
    });

    it("should filter by custom extensions", () => {
      const results = scanner.scan(testDir, { extensions: [".css"] });
      const paths = results.map((r) => r.path);

      expect(paths).toContain(join(testDir, "src", "styles.css"));
      expect(paths).not.toContain(join(testDir, "src", "app.js"));
    });

    it("should respect maxDepth", () => {
      mkdirSync(join(testDir, "src", "deep", "nested", "folder"), {
        recursive: true,
      });
      writeFileSync(
        join(testDir, "src", "deep", "nested", "folder", "deep.js"),
        "const deep = {}",
      );

      const shallow = scanner.scan(testDir, { maxDepth: 2 });
      const deep = scanner.scan(testDir, { maxDepth: 10 });

      const shallowPaths = shallow.map((r) => r.path);
      const deepPaths = deep.map((r) => r.path);

      expect(shallowPaths).not.toContain(
        join(testDir, "src", "deep", "nested", "folder", "deep.js"),
      );
      expect(deepPaths).toContain(
        join(testDir, "src", "deep", "nested", "folder", "deep.js"),
      );
    });

    it("should handle non-existent paths", () => {
      const results = scanner.scan("/non/existent/path");
      expect(results).toEqual([]);
    });

    it("should include extension in results", () => {
      const results = scanner.scan(testDir);
      const jsFile = results.find((r) => r.path.endsWith("app.js"));

      expect(jsFile?.extension).toBe(".js");
      expect(jsFile?.type).toBe("file");
    });

    it("should respect limit option", () => {
      const results = scanner.scan(testDir, { limit: 2 });
      expect(results.length).toBe(2);
    });
  });

  describe("findFirst", () => {
    it("should return first matching file", () => {
      const result = scanner.findFirst(testDir);

      expect(result).toBeDefined();
      expect(result?.type).toBe("file");
    });

    it("should return undefined for non-existent path", () => {
      const result = scanner.findFirst("/non/existent/path");
      expect(result).toBeUndefined();
    });

    it("should stop after finding first match", () => {
      mkdirSync(join(testDir, "many"));
      for (let i = 0; i < 100; i++) {
        writeFileSync(join(testDir, "many", `file${i}.js`), `const f${i} = {}`);
      }

      const result = scanner.findFirst(testDir);

      expect(result).toBeDefined();
      expect(result?.type).toBe("file");
    });
  });

  describe("custom ignore patterns", () => {
    it("should accept custom ignore patterns", () => {
      const results = scanner.scan(testDir, {
        ignorePatterns: ["src"],
      });
      const paths = results.map((r) => r.path);

      expect(paths).toContain(join(testDir, "index.js"));
      expect(paths).not.toContain(join(testDir, "src", "app.js"));
    });

    it("should handle glob patterns", () => {
      writeFileSync(join(testDir, "test.spec.js"), "test()");
      writeFileSync(join(testDir, "file.test.js"), "test()");

      const results = scanner.scan(testDir, {
        ignorePatterns: ["*.test.js", "*.spec.js"],
      });
      const paths = results.map((r) => r.path);

      expect(paths).not.toContain(join(testDir, "test.spec.js"));
      expect(paths).not.toContain(join(testDir, "file.test.js"));
      expect(paths).toContain(join(testDir, "index.js"));
    });
  });
});
