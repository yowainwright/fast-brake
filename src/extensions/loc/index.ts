import { Position, LOCInfo, ExtensionInput, ExtensionOutput } from "./types";

function getLineColumn(code: string, offset: number): Position {
  const lines = code.substring(0, offset).split("\n");
  const line = lines.length;
  const column = lines[lines.length - 1].length;

  return { line, column };
}

function processLOCExtension(input: ExtensionInput): ExtensionOutput {
  const { code, result } = input;
  const { match, index = 0 } = result;

  const startPos = getLineColumn(code, index);

  const endIndex = index + match.length;
  const endPos = getLineColumn(code, endIndex);

  const locInfo: LOCInfo = {
    start: startPos,
    end: endPos,
    offset: index,
    length: match.length,
  };

  return {
    ...result,
    spec: {
      ...result.spec,
      loc: locInfo,
    },
  };
}

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
  process: processLOCExtension,
};
