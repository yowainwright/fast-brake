export const locExtension = {
  name: "loc",
  description:
    "Enriches detected features with location information including line, column, offset, and length",
  spec: {
    code: "const arrow = () => { return 42; }",
    result: {
      name: "arrow-function",
      match: "() =>",
      spec: {
        loc: {
          start: { line: 1, column: 14 },
          end: { line: 1, column: 19 },
          offset: 14,
          length: 5,
        },
      },
      rule: "arrow-function-pattern",
      index: 14,
    },
  },
};
