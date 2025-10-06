/**
 * The scrubCode removes parts of code, which could lead to false positives (strings and comments).
 */
export const scrubCode = (code: string) => {
  const result: string[] = [];

  // regex for /* // " ' tokens
  const modeRegex = /(?:(?:\/\*)|(?:\/\/)|(?:")|(?:'))/g;

  let position = 0;
  let state: ["code"] | ["string", "'" | '"'] | ["comment", "//" | "/*"] = [
    "code",
  ];

  loop: while (position < code.length) {
    switch (state[0]) {
      case "code": {
        modeRegex.lastIndex = position;
        const nextToken = modeRegex.exec(code);

        if (nextToken === null) break loop;

        result.push(code.slice(position, nextToken.index));

        switch (nextToken[0]) {
          case "/*":
            state = ["comment", "/*"];
            break;
          case "//":
            state = ["comment", "//"];
            break;
          case "'":
            state = ["string", "'"];
            break;
          case '"':
            state = ["string", '"'];
            break;
        }
        position = nextToken.index;

        break;
      }
      case "string": {
        const token = state[1];
        const endIndex = code.indexOf(token, position + 1);

        if (endIndex === -1) {
          throw new Error(`Invalid input at ${position}`);
        }

        result.push(token + " ".repeat(endIndex - position - 1) + token);
        position = endIndex + 1;
        state = ["code"];

        break;
      }
      case "comment": {
        const endToken = state[1] === "/*" ? "*/" : "\n";

        let endIndex = code.indexOf(endToken, position + 2);

        if (endIndex === -1) {
          endIndex = code.length;
        }

        if (endToken === "\n") {
          result.push(
            " ".repeat(endIndex + endToken.length - position - 1) + "\n",
          );
        } else {
          result.push(
            getWhitespace(code.slice(position, endIndex + endToken.length)),
          );
        }

        position = endIndex === -1 ? code.length : endIndex + endToken.length;

        state = ["code"];

        break;
      }
    }
  }

  result.push(code.slice(position));

  return result.join("");
};

const getWhitespace = (comment: string) =>
  comment
    .split("\n")
    .map((ln) => " ".repeat(ln.length))
    .join("\n");
