/**
 * Test setup file - runs before all tests
 * Generates fixture files to ensure consistency
 */

import { readFileSync, writeFileSync } from "fs";
import { stripComments } from "../src/plugins/jscomments";

// Generate fixture files
const fixtures = [
  {
    input: "tests/fixtures/comments.ts",
    output: "tests/fixtures/comments-expected.ts",
    generator: stripComments,
  },
];

for (const fixture of fixtures) {
  const input = readFileSync(fixture.input, "utf-8");
  const output = fixture.generator(input);
  writeFileSync(fixture.output, output, "utf-8");
}
