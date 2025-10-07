import { test, expect, describe } from "bun:test";
import {
  jscommentsPreprocessor,
  stripComments,
} from "../../../src/plugins/jscomments";
import { defaultPreprocessors as esversionPreprocessors } from "../../../src/plugins/esversion";
import { defaultPreprocessors as browserlistPreprocessors } from "../../../src/plugins/browserlist";

describe("jscomments plugin", () => {
  test("should export jscommentsPreprocessor", () => {
    expect(jscommentsPreprocessor).toBeDefined();
    expect(typeof jscommentsPreprocessor).toBe("function");
  });

  test("jscommentsPreprocessor should strip comments", () => {
    const code = `
// This is a comment
const x = 1; /* block comment */
const y = 2;
`;
    const result = jscommentsPreprocessor(code);
    expect(result).not.toContain("This is a comment");
    expect(result).not.toContain("block comment");
    expect(result).toContain("const x = 1;");
    expect(result).toContain("const y = 2;");
  });

  test("jscommentsPreprocessor should equal stripComments", () => {
    const code = `
// Comment
const x = 1;
`;
    expect(jscommentsPreprocessor(code)).toBe(stripComments(code));
  });

  test("should be included in esversion default preprocessors", () => {
    expect(esversionPreprocessors).toBeDefined();
    expect(Array.isArray(esversionPreprocessors)).toBe(true);
    expect(esversionPreprocessors).toContain(jscommentsPreprocessor);
  });

  test("should be included in browserlist default preprocessors", () => {
    expect(browserlistPreprocessors).toBeDefined();
    expect(Array.isArray(browserlistPreprocessors)).toBe(true);
    expect(browserlistPreprocessors).toContain(jscommentsPreprocessor);
  });

  test("preprocessor chain should work correctly", () => {
    const code = `
// Arrow function in comment
const fn = () => 123; // actual arrow function
`;

    const result = esversionPreprocessors.reduce((acc, preprocessor) => {
      return preprocessor(acc);
    }, code);

    expect(result).toContain("const fn = () => 123;");
    expect(result).not.toContain("Arrow function in comment");
    expect(result).not.toContain("actual arrow function");
  });
});
