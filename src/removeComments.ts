export function removeComments(code: string) {
  const result = [];

  const regex = /(\/\/.+(\n|$))|(\/\*.+\*\/)/g;

  let anchor = 0;

  while (true) {
    const match = regex.exec(code);

    if (!match) {
      break;
    }

    const slice = code.slice(anchor, match.index);

    result.push(slice, getWhitespace(match[0]));

    anchor = match.index + match[0].length;
  }

  result.push(code.slice(anchor));

  return result.join("");
}

const getWhitespace = (comment: string) =>
  comment
    .split("\n")
    .map((ln) => " ".repeat(ln.length))
    .join("\n");
