# @fast-brake/benchmarker

Performance benchmarking suite for Fast Brake - compares Fast Brake's performance against popular JavaScript parsers.

Fast brake should be faster for what it does. All the JavaScript parser it's comparing itself against are way more advance form also every, except for what fast-brake does (fail fast).

## Overview

This package benchmarks Fast Brake's ES feature detection performance against various JavaScript parsers including Babel, Acorn, Esprima, Espree, Meriyah, and Cherow.

## Usage

```bash
# Run full benchmark suite
bun run benchmark

# Generate comparison table
bun run benchmark:table

# Run tests
bun test

# Type check
bun run typecheck

# Lint
bun run lint
```

## Benchmarks

The benchmarker tests parsing performance on various ES feature sets:
- ES5 code
- ES2015 features (arrow functions, classes, template literals)
- ES2020 features (optional chaining, nullish coalescing)
- ES2022 features (private fields, static blocks)

## Output

Generates performance comparison tables showing:
- Parse time for each parser
- Memory usage
- Feature detection accuracy
- Relative performance metrics

## Development

```bash
# Install dependencies
bun install

# Run benchmarks with custom iterations
bun run src/benchmark.ts --iterations 1000

# Generate detailed comparison
bun run src/generate-table.ts
```

## Structure

```
benchmarker/
├── src/
│   ├── benchmark.ts        # Main benchmark runner
│   └── generate-table.ts   # Table generation utility
├── tests/
│   └── benchmarker.test.ts # Unit tests
├── package.json
└── README.md
```

## Parsers Compared

Fast brake compare itself against full parsers that do a lot more. Fast brake only wins for one thing!

- **Fast Brake** - ES feature detection (this project)
- **@babel/parser** - Babel's JavaScript parser
- **Acorn** - Small, fast JavaScript parser
- **Esprima** - ECMAScript parsing infrastructure
- **Espree** - Esprima-compatible parser used by ESLint
- **Meriyah** - Fast JavaScript parser
- **Cherow** - Fast, standards-compliant parser