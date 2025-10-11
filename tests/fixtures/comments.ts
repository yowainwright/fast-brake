// Single line comment at top
const x = 1;

/* Block comment */
const y = 2;

/**
 * JSDoc comment
 * with multiple lines
 * @param {string} name - The name parameter
 * @returns {string} Greeting message
 */
function greet(name: string): string {
  // Inline comment
  return `Hello ${name}`; // End of line comment
}

/**
 * JSDoc with code example
 * @example
 * const result = add(1, 2);
 * // returns 3
 * const x = multiply(2, 3);
 */
function add(a: number, b: number): number {
  return a + b;
}

/**
 * @typedef {Object} User
 * @property {string} name - User name
 * @property {number} age - User age
 * @example
 * const user = {
 *   name: "John",
 *   age: 30
 * };
 */

/**
 * Complex JSDoc with multiple code blocks
 * @param {Array<string>} items
 * @example
 * // Basic usage
 * process(['a', 'b']);
 *
 * @example
 * // Advanced usage with arrow functions
 * const fn = () => process(['x', 'y']);
 * const regex = /test/gi;
 */
function process(items: string[]): string[] {
  return items.map((x) => x.toUpperCase());
}

/* Multi
   line
   block
   comment */
const z = 3;

const str1 = "// not a comment";
const str2 = "/* also not a comment */";
const str3 = `// template literal comment`;

/**
 * JSDoc with regex in example
 * @example
 * const pattern = /^https?:\/\//;
 * const url = "http://example.com";
 */
const urlValidator = /^https?:\/\//;

const regex1 = /test\/pattern/gi;
const regex2 = /\/\*/;

const division = a / b;
const divAssign = (a /= b);

// Comment with special chars: @#$%^&*()
/* Comment with code: const x = 1; */

/**
 * @param {Object} config
 * @param {string} config.url - API endpoint
 * @example
 * fetch({
 *   url: "https://api.example.com" // API URL
 * });
 */
function fetch(config: { url: string }): string {
  return config.url;
}

const obj = {
  // Property comment
  key: "value", // Trailing comment
  /* Block before property */ prop: 42,
};

const arrow = () => {
  // Arrow function comment
  return 1; // Return comment
};

// EOF comment
