# jscomments Plugin

JavaScript comment stripping plugin for fast-brake. Removes comments from code while preserving line numbers for accurate feature detection.

## Features

- Strips single-line comments (`//`)
- Strips multi-line block comments (`/* */`)
- Strips JSDoc comments (`/** */`)
- Preserves line numbers by replacing comments with newlines
- Handles edge cases:
  - Strings containing comment-like content (`"// not a comment"`)
  - Template literals with comment-like content
  - Regular expressions that might look like division operators
  - Escaped characters in strings

## Usage

### As a Preprocessor

```typescript
import { jscommentsPreprocessor } from "fast-brake/plugins/jscomments";
import { Detector } from "fast-brake";

const detector = new Detector();
await detector.initialize();

const code = `
// This is a comment
const x = () => 123; // arrow function
`;

// Manually preprocess
const cleaned = jscommentsPreprocessor(code);
const result = detector.detectFast(cleaned);
```

### With Default Plugins

The jscomments preprocessor is included by default in:
- `esversion` plugin (`defaultPreprocessors`)
- `browserlist` plugin (`defaultPreprocessors`)

```typescript
import { defaultPreprocessors } from "fast-brake/plugins/esversion";

const code = `// comment\nconst x = 1;`;
const cleaned = defaultPreprocessors.reduce((acc, fn) => fn(acc), code);
```

### Direct Function Import

```typescript
import { stripComments } from "fast-brake/plugins/jscomments";

const code = `
// Comment
const x = 1; /* inline */ const y = 2;
`;

const result = stripComments(code);
// Result: "\nconst x = 1;  const y = 2;\n"
```

## API

### `jscommentsPreprocessor(code: string): string`

Main preprocessor function for use with DetectionOptions.

### `stripComments(code: string): string`

Strips all JavaScript comments from code while preserving line numbers.

### Helper Functions

All helper functions are exported for advanced use cases:

- `isWhitespace(ch: string): boolean`
- `findPrevNonSpace(code: string, index: number): number`
- `isWordChar(ch: string): boolean`
- `isReturnKeyword(code: string, index: number): boolean`
- `skipString(code: string, i: number, quote: string): { result: string; index: number }`
- `isRegexFlag(ch: string): boolean`
- `skipRegex(code: string, i: number): { result: string; index: number }`
- `isRegexContext(code: string, i: number): boolean`
- `countNewlines(text: string): number`

## Performance

- Uses string scanning instead of regex for optimal performance
- Processes 1000+ comments in under 100ms
- Zero runtime dependencies
