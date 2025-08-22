# @fast-brake/generator

Schema generator for Fast Brake - generates ES feature detection schemas from TypeScript definitions.

## Overview

This package generates the schema files used by Fast Brake to detect ECMAScript features. It converts TypeScript definitions into both JSON and JavaScript module formats for runtime use.

## Usage

```bash
# Generate schema files
bun run generate

# Run tests
bun test

# Type check
bun run typecheck

# Lint
bun run lint
```

## Output

The generator creates two schema files in the main package:
- `src/schema.json` - JSON format for easy inspection
- `src/schema.js` - JavaScript module for runtime import

## Development

```bash
# Install dependencies
bun install

# Run in watch mode during development
bun run src/generate-schema.ts
```

## Structure

```
generator/
├── src/
│   └── generate-schema.ts  # Main schema generation script
├── tests/
│   └── generator.test.ts   # Unit tests
├── package.json
└── tsconfig.json
```