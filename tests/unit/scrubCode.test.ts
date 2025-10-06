import { describe, expect, test } from "bun:test";
import { scrubCode } from "../../src/scrubCode";

describe("scrubCode", () => {
  test("it should remove comments and strings", () => {
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

    expect(scrubCode(code)).toEqual(`
                       
var x = 4;

           
console.log("     ");

                       
var y = 2;

                 
Math.pow(x, y);

               

                 
`);
  });

  test("shouldn't move code", () => {
    const code = `
/* *** */ var x = 0;
    `;

    expect(scrubCode(code).indexOf("var x")).toBe(code.indexOf("var x"));
  });

  test("it should emit code before and after the commit", async () => {
    const code = `
var beforeComment = true;
// comment
beforeComment = false;`;

    expect(scrubCode(code)).toEqual(`
var beforeComment = true;
          
beforeComment = false;`);
  });

  test("it should preserve newlines in multiline comments", () => {
    const code = `
/* Line1
Line2
Line3
*/
`;

    expect(scrubCode(code)).toEqual(`
        
     
     
  
`);
  });

  test("trailing comment", () => {
    const code = `var x = 5;
// comment`;

    expect(scrubCode(code)).toEqual(`var x = 5;
          
`);
  });
});
