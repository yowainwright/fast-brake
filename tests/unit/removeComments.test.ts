import { test, expect, describe } from "bun:test";
import { removeComments } from "../../src/removeComments";

describe("removeComments", () => {
  test("it should remove comments", async () => {
    const code = `
// same as const x = 4;
var x = 4;

/* hello */
console.log("hello");

// same as const y = 2;
var y = 2;

// same as x ** y
Math.pow(x, y);

// () => "test"

/* end of file */
`;

    const slices = removeComments(code);

    expect(slices).toEqual(`
                       
var x = 4;

           
console.log("hello");

                       
var y = 2;

                 
Math.pow(x, y);

               

                 
`);
  });

  test("shouldn't move code", () => {
    const code = `
/* *** */ var x = 0;
    `;

    expect(removeComments(code).indexOf("var x")).toBe(code.indexOf("var x"));
  });

  test("it should yield code before and after the commit", async () => {
    const code = `
var beforeComment = true;
// comment
beforeComment = false;`;

    const slices = removeComments(code);

    expect(slices).toEqual(`
var beforeComment = true;
          
beforeComment = false;`);
  });
});
