import { test, expect, describe } from "bun:test";
import { stripComments } from "../../src/plugins/jscomments";
import { Detector } from "../../src/detector";

describe("E2E: Comment Stripping", () => {
  test("hashbang - should be preserved (not a JS comment)", () => {
    const code = `#!/usr/bin/env node
const x = 1;`;

    const result = stripComments(code);

    expect(result).toContain("const x = 1;");
    expect(result).toContain("#!/usr/bin/env node");
  });

  test("JSDoc comments - comprehensive documentation", () => {
    const code = `
/**
 * Calculate the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 * @example
 * add(1, 2); // returns 3
 * @example
 * const result = add(5, 10);
 * console.log(result); // 15
 */
function add(a, b) {
  return a + b;
}
`;

    const result = stripComments(code);

    expect(result).toContain("function add(a, b)");
    expect(result).toContain("return a + b;");
    expect(result).not.toContain("@param");
    expect(result).not.toContain("@returns");
    expect(result).not.toContain("@example");
  });

  test("nested comments in JSDoc examples", () => {
    const code = `
/**
 * @example
 * // This is a single line comment in JSDoc
 * const x = 1;
 */
const foo = 42;
`;

    const result = stripComments(code);

    expect(result).toContain("const foo = 42;");
    expect(result).not.toContain("This is a single line comment");
  });

  test("comments with ES6+ code examples", () => {
    const code = `
/**
 * Arrow function example
 * @example
 * const fn = () => console.log('test');
 * const arr = [1, 2, 3];
 * const doubled = arr.map(x => x * 2);
 */
const arrow = () => 123;
`;

    const result = stripComments(code);

    expect(result).toContain("const arrow = () => 123;");
    expect(result).not.toContain("Arrow function example");
    expect(result).not.toContain("const fn = () =>");
  });

  test("mixed comment types in single file", () => {
    const code = `
// Single line comment
const x = 1;

/* Block comment */
const y = 2;

/**
 * JSDoc comment
 * @param {string} name
 */
function greet(name) {
  // Inline comment
  return \`Hello \${name}\`; // End of line comment
}

/* Multi
   line
   block */
const z = 3;
`;

    const result = stripComments(code);

    expect(result).toContain("const x = 1;");
    expect(result).toContain("const y = 2;");
    expect(result).toContain("function greet(name)");
    expect(result).toContain("return `Hello ${name}`;");
    expect(result).toContain("const z = 3;");
    expect(result).not.toContain("Single line comment");
    expect(result).not.toContain("Block comment");
    expect(result).not.toContain("JSDoc comment");
    expect(result).not.toContain("Inline comment");
    expect(result).not.toContain("End of line comment");
  });

  test("comments with URLs and special characters", () => {
    const code = `
// See: https://example.com/docs
// TODO: Fix this @urgent #123
// Email: test@example.com
const url = "https://api.example.com"; // API endpoint
`;

    const result = stripComments(code);

    expect(result).toContain('const url = "https://api.example.com";');
    expect(result).not.toContain("See: https://example.com/docs");
    expect(result).not.toContain("TODO:");
    expect(result).not.toContain("Email:");
    expect(result).not.toContain("API endpoint");
  });

  test("comments with code snippets", () => {
    const code = `
/*
 Old implementation:
 function oldWay() {
   const x = 1;
   const y = 2;
   return x + y;
 }
*/
function newWay() {
  return 3;
}
`;

    const result = stripComments(code);

    expect(result).toContain("function newWay()");
    expect(result).toContain("return 3;");
    expect(result).not.toContain("Old implementation");
    expect(result).not.toContain("function oldWay");
  });

  test("comments with regex patterns", () => {
    const code = `
// Pattern: /^[a-z]+$/i
// Match: /\\d{3}-\\d{4}/
const pattern = /test/gi;
`;

    const result = stripComments(code);

    expect(result).toContain("const pattern = /test/gi;");
    expect(result).not.toContain("Pattern:");
    expect(result).not.toContain("Match:");
  });

  test("comments with template literals", () => {
    const code = `
// Template: \`Hello \${name}\`
const greeting = \`Hello \${"World"}\`;
`;

    const result = stripComments(code);

    expect(result).toContain('const greeting = `Hello ${"World"}`;');
    expect(result).not.toContain("Template:");
  });

  test("commented out ES2015+ features", () => {
    const code = `
/*
const arrow = () => {};
const [a, b] = [1, 2];
const obj = { ...spread };
class MyClass extends Base {}
async function test() {
  await something();
}
*/
const actual = 42;
`;

    const result = stripComments(code);

    expect(result).toContain("const actual = 42;");
    expect(result).not.toContain("const arrow");
    expect(result).not.toContain("class MyClass");
    expect(result).not.toContain("async function");
  });

  test("detection should work the same with and without comments", async () => {
    const codeWithComments = `
// This uses arrow functions
const fn = () => 123;

/*
 Block comment with old code:
 var x = function() { return 1; };
*/
const modern = \`template\`;
`;

    const codeWithoutComments = `
const fn = () => 123;
const modern = \`template\`;
`;

    const detector = new Detector();
    await detector.initialize();

    const strippedCode = stripComments(codeWithComments);
    const resultWithComments = detector.detectFast(codeWithComments);
    const resultStripped = detector.detectFast(strippedCode);
    const resultClean = detector.detectFast(codeWithoutComments);

    expect(resultWithComments.hasMatch).toBe(true);
    expect(resultStripped.hasMatch).toBe(true);
    expect(resultClean.hasMatch).toBe(true);
    expect(resultStripped.hasMatch).toBe(resultClean.hasMatch);
  });

  test("line numbers preserved after stripping", () => {
    const code = `const a = 1;
// Comment line 2
const b = 2;
/* Comment
   line 4
   line 5 */
const c = 3;`;

    const result = stripComments(code);
    const lines = result.split("\n");

    expect(lines[0]).toContain("const a = 1;");
    expect(lines[2]).toContain("const b = 2;");
    expect(lines[6]).toContain("const c = 3;");
  });

  test("empty and whitespace-only comments", () => {
    const code = `
//
const x = 1;
/**/
const y = 2;
/*

 */
const z = 3;
`;

    const result = stripComments(code);

    expect(result).toContain("const x = 1;");
    expect(result).toContain("const y = 2;");
    expect(result).toContain("const z = 3;");
  });

  test("consecutive comments", () => {
    const code = `
// Comment 1
// Comment 2
// Comment 3
const x = 1;

/* Block 1 */
/* Block 2 */
const y = 2;
`;

    const result = stripComments(code);

    expect(result).toContain("const x = 1;");
    expect(result).toContain("const y = 2;");
    expect(result).not.toContain("Comment 1");
    expect(result).not.toContain("Block 1");
  });

  test("comment-like strings should be preserved", () => {
    const code = `
const url = "http://example.com";
const comment = "// This is not a comment";
const block = "/* Also not a comment */";
const regex = /\\/\\//;
const template = \`// \${value}\`;
`;

    const result = stripComments(code);

    expect(result).toContain('"http://example.com"');
    expect(result).toContain('"// This is not a comment"');
    expect(result).toContain('"/* Also not a comment */"');
    expect(result).toContain("/\\/\\//");
    expect(result).toContain("`// ${value}`");
  });

  test("JSDoc with multiple @example blocks", () => {
    const code = `
/**
 * Utility function
 *
 * @example
 * basic();
 *
 * @example
 * advanced({ opt: true });
 *
 * @example
 * const result = chained()
 *   .method1()
 *   .method2();
 */
function util() {
  return 42;
}
`;

    const result = stripComments(code);

    expect(result).toContain("function util()");
    expect(result).toContain("return 42;");
    expect(result).not.toContain("@example");
    expect(result).not.toContain("basic()");
    expect(result).not.toContain("advanced");
  });

  test("real-world example - React component with comments", () => {
    const code = `
/**
 * Button component
 * @param {Object} props
 * @param {string} props.label - Button text
 * @param {Function} props.onClick - Click handler
 * @example
 * <Button label="Click me" onClick={() => alert('Clicked')} />
 */
const Button = ({ label, onClick }) => {
  // Handle click event
  const handleClick = (e) => {
    e.preventDefault(); // Prevent default behavior
    onClick?.(e); // Optional chaining
  };

  /*
   Render button with custom styles
   TODO: Add theming support
  */
  return (
    <button onClick={handleClick}>
      {label} {/* Display label */}
    </button>
  );
};
`;

    const result = stripComments(code);

    expect(result).toContain("const Button = ({ label, onClick }) =>");
    expect(result).toContain("const handleClick = (e) =>");
    expect(result).toContain("e.preventDefault();");
    expect(result).toContain("onClick?.(e);");
    expect(result).toContain("<button onClick={handleClick}>");
    expect(result).not.toContain("Button component");
    expect(result).not.toContain("@param");
    expect(result).not.toContain("Handle click event");
    expect(result).not.toContain("TODO:");
  });

  test("performance - large file with many comments", () => {
    const lines = [];
    for (let i = 0; i < 1000; i++) {
      lines.push(`// Comment ${i}`);
      lines.push(`const var${i} = ${i};`);
      lines.push(`/* Block comment ${i} */`);
    }
    const code = lines.join("\n");

    const start = performance.now();
    const result = stripComments(code);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result).toContain("const var0 = 0;");
    expect(result).toContain("const var999 = 999;");
    expect(result).not.toContain("Comment 0");
    expect(result).not.toContain("Block comment 999");
  });
});
