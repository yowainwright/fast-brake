# fast-brake

Fast ES feature detection with zero runtime dependencies. Analyzes JavaScript code to detect ECMAScript features and verify compatibility with target ES versions.

## Features

- 🚀 **Blazing Fast** - Process 1000 files in <15ms
- 📦 **Zero Runtime Dependencies** - Lightweight and secure
- 🎯 **Two-Phase Detection** - Quick pattern matching with accurate validation
- 📊 **ES5 to ES2022** - Comprehensive feature coverage
- 🔧 **Programmatic API** - Simple, intuitive interface
- ⚡ **Performance First** - Optimized for speed

## Installation

```bash
bun add fast-brake
# or
npm install fast-brake
```

## Usage

```javascript
import { brakefast, detect, check, getMinimumESVersion } from 'fast-brake';

// Throws if code uses features incompatible with ES5
brakefast('const x = () => {}', { target: 'es5' });

// Detect all ES features in code
const features = detect('const x = () => {}');
// [{ name: 'arrow_functions', version: 'es2015', line: 1, column: 11 }]

// Check if code is compatible (returns boolean)
const isCompatible = check('const x = () => {}', { target: 'es5' });
// false

// Get minimum ES version required
const minVersion = getMinimumESVersion('const x = () => {}');
// 'es2015'
```

## API

### `brakefast(code, options)`
Analyzes code and throws if incompatible features are found.

### `detect(code, options?)`
Returns array of detected ES features with location info.

### `check(code, options)`
Returns boolean indicating if code is compatible with target.

### `getMinimumESVersion(code, options?)`
Returns the minimum ES version required to run the code.

### Options

- `target`: Target ES version ('es5', 'es2015', 'es2016', etc.)
- `quick`: Use fast pattern matching only (less accurate)
- `throwOnFirst`: Stop on first incompatible feature

## Performance

Benchmarked against a typical codebase:

- Single file: ~0.013ms
- 1000 files: ~13ms (vs ~100ms for parsers)
- Memory: <4MB heap usage

## License

MIT