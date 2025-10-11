# E2E Tests for Open Source Projects

This directory contains end-to-end tests that validate fast-brake against real-world open source JavaScript/TypeScript packages via unpkg CDN.

## Tested Packages

- **lodash** - Popular utility library (JavaScript, ES5-compatible)
- **lodash-es** - ES module version of lodash (modern ES features)
- **ramda** - Functional programming library (JavaScript)
- **core-js** - Modular standard library (ES5, ES6, and full builds)
- **tslib** - TypeScript runtime library (ES5 and ES6 builds)

## Running E2E Tests

```bash
# Run e2e tests
bun run test:e2e
```

Tests fetch packages directly from unpkg, so no local setup or cloning is required.

## What These Tests Validate

1. **Feature Detection** - Ensures fast-brake correctly detects ES features in production code
2. **Performance** - Validates detection speed on real packages (sub-200ms for most, sub-500ms for large packages)
3. **Comment Stripping** - Verifies that `stripComments()` doesn't break detection
4. **ES Version Comparison** - Tests packages with multiple ES builds (ES5 vs ES6)
5. **Large Package Handling** - Validates performance on large packages like core-js

## Why unpkg?

Using unpkg provides several benefits:
- No need to clone repositories
- Tests against actual published packages
- Faster test execution
- No local disk usage
- Easy to test specific versions

## Adding New Packages

To add a new package for testing, update the `PACKAGES` object in `open-source.test.ts`:

```typescript
const PACKAGES = {
  "package-name": {
    name: "package-name",
    versions: {
      es5: "https://unpkg.com/package-name@1.0.0/lib/index.js",
      es6: "https://unpkg.com/package-name@1.0.0/es/index.js",
    },
  },
};
```

Look for packages that distribute multiple ES version builds for best test coverage.
