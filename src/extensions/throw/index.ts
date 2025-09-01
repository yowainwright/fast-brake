export const throwExtension = {
  name: "throw",
  description:
    "Throws an error when specific patterns or conditions are detected in the code",
  spec: {
    code: "throw new Error('Invalid operation');",
    result: {
      name: "throw-statement",
      match: "throw new Error",
      spec: {
        type: "error-throw",
        errorType: "Error",
        message: "Invalid operation",
      },
      rule: "throw-statement-pattern",
      index: 0,
    },
  },
};
