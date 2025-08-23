# Fast Brake 💨

**Fast braking js feature detection** Fast brake Analyzes JavaScript code to detect ECMAScript features and verify compatibility with target ES or Browser versions using a two-phase detection system.

## Why Fast Brake?

Traditional JavaScript compatibility tools rely on AST parsers process js file. **Fast Brake** uses pattern matching combined with tokenizer validation to achieve the similar accuracy fast.

Perfect for:
- **Build tools** - Validate code compatibility before bundling
- **Linters** - Check ES version compliance in CI/CD
- **Transpilers** - Determine which features need polyfilling
- **Code analysis** - Understand your codebase's ES requirements

## Features

- **Fast** - Process 1000 files faster than AST parsers)
- **Zero Runtime Dependencies** - Lightweight and secure
- **Two-Phase Detection** - Quick pattern matching + accurate tokenizer validation
- **ES5 to ES2022** - Comprehensive feature coverage (30+ features)
- **Programmatic API** - Simple, intuitive interface
- **Performance First** - Optimized for speed
- **Accurate Detection** - Tokenizer validates features in actual code

## Installation

```bash
npm install fast-brake
```

## Quick Start

```javascript
import { fastBrake, detect, check, getMinimumESVersion } from 'fast-brake';

// Throws if code uses features incompatible with target
fastBrake('const x = () => {}', { target: 'es5' });
// Error: ES feature "arrow_functions" requires es2015 but target is es5

// Detect all ES features in code
const features = detect('const x = () => {}');
console.log(features);
// [{ name: 'arrow_functions', version: 'es2015', line: 1, column: 11 }]

// Check if code is compatible (returns boolean)
const isCompatible = check('const x = () => {}', { target: 'es5' });
console.log(isCompatible); // false

// Get minimum ES version required
const minVersion = getMinimumESVersion('const x = () => {}');
console.log(minVersion); // 'es2015'
```

## Two-Phase Detection System

fast-brake uses a unique **two-phase detection system** that combines speed with accuracy:

### Phase 1: Quick Pattern Matching
- **Lightning fast** regex-based feature detection
- Scans code for ES feature patterns in milliseconds
- Provides initial feature candidates

### Phase 2: Tokenizer Validation
- **Validates features** in actual code contexts
- Validates features using intelligent tokenization
- Adds additional features detected through token analysis (imports, exports, etc.)

```javascript
// Quick mode: Phase 1 only (fastest pattern matching)
const quickFeatures = detect(code, { quick: true });

// Full mode: Phase 1 + Phase 2 (recommended, with tokenizer validation)
const accurateFeatures = detect(code, { quick: false }); // default
```

## Supported ES Features

### ES2015 (ES6) Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Arrow Functions | `=>` | `const fn = () => {}` |
| Template Literals | `` ` `` | `` `Hello ${name}` `` |
| Classes | `class` | `class MyClass {}` |
| Let/Const | `let`/`const` | `const x = 10` |
| Destructuring | `[...]`/`{...}` | `const [a, b] = arr` |
| Spread/Rest | `...` | `[...arr]` |
| For-of Loops | `for...of` | `for (const item of items)` |
| Default Parameters | `param = value` | `function fn(x = 10)` |

### ES2016 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Exponentiation | `**` | `2 ** 3` |

### ES2017 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Async/Await | `async`/`await` | `async function fn() { await promise }` |

### ES2018 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Async Iteration | `for await` | `for await (const item of asyncIterable)` |
| Rest/Spread Properties | `{...obj}` | `const newObj = {...obj}` |

### ES2019 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Array.flat() | `.flat()` | `arr.flat()` |
| Array.flatMap() | `.flatMap()` | `arr.flatMap(fn)` |

### ES2020 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Optional Chaining | `?.` | `obj?.prop?.method?.()` |
| Nullish Coalescing | `??` | `value ?? 'default'` |
| BigInt | `123n` | `const big = 123n` |
| Promise.allSettled | `Promise.allSettled` | `Promise.allSettled(promises)` |
| globalThis | `globalThis` | `globalThis.myVar` |

### ES2021 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Logical Assignment | `\|\|=`, `&&=`, `??=` | `x ??= 'default'` |
| Numeric Separators | `1_000_000` | `const million = 1_000_000` |
| String.replaceAll | `.replaceAll()` | `str.replaceAll('old', 'new')` |
| Promise.any | `Promise.any` | `Promise.any(promises)` |

### ES2022 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Private Fields | `#field` | `class C { #private = 1 }` |
| Static Blocks | `static {}` | `class C { static { /* init */ } }` |
| Array.at() | `.at()` | `arr.at(-1)` |
| Object.hasOwn | `Object.hasOwn` | `Object.hasOwn(obj, 'prop')` |
| Top-level Await | `await` (module) | `const data = await fetch(url)` |

## API Reference

### `fastBrake(code, options)`

Analyzes code and **throws an error** if incompatible features are found.

```javascript
import { fastBrake } from 'fast-brake';

try {
  fastBrake('const x = () => {}', { target: 'es5' });
} catch (error) {
  console.log(error.message);
  // "ES feature "arrow_functions" requires es2015 but target is es5 at line 1:11"
  console.log(error.feature); // { name: 'arrow_functions', version: 'es2015', ... }
  console.log(error.target);  // 'es5'
}
```

**Parameters:**
- `code` (string): JavaScript code to analyze
- `options` (object):
  - `target` (string): Target ES version ('es5', 'es2015', 'es2016', etc.)
  - `quick?` (boolean): Use quick mode only (default: false)
  - `throwOnFirst?` (boolean): Stop on first incompatible feature (default: false)

### `detect(code, options?)`

Returns an **array of detected ES features** with location information.

```javascript
import { detect } from 'fast-brake';

const features = detect(`
  const arrow = () => {};
  const template = \`Hello \${name}\`;
`);

console.log(features);
// [
//   { name: 'arrow_functions', version: 'es2015', line: 2, column: 17 },
//   { name: 'template_literals', version: 'es2015', line: 3, column: 19 },
//   { name: 'let_const', version: 'es2015', line: 2, column: 3 }
// ]
```

**Parameters:**
- `code` (string): JavaScript code to analyze
- `options?` (object):
  - `target?` (string): Target ES version (default: 'esnext')
  - `quick?` (boolean): Use quick mode only (default: false)
  - `throwOnFirst?` (boolean): Stop on first feature (default: false)

**Returns:** `DetectedFeature[]`
```typescript
interface DetectedFeature {
  name: string;        // Feature name (e.g., 'arrow_functions')
  version: string;     // Required ES version (e.g., 'es2015')
  line?: number;       // Line number where feature was found
  column?: number;     // Column number where feature was found
  snippet?: string;    // Code snippet containing the feature
}
```

### `check(code, options)`

Returns a **boolean** indicating if code is compatible with the target ES version.

```javascript
import { check } from 'fast-brake';

const isES5Compatible = check('var x = 10;', { target: 'es5' });
console.log(isES5Compatible); // true

const hasES6Features = check('const x = () => {};', { target: 'es5' });
console.log(hasES6Features); // false
```

**Parameters:**
- `code` (string): JavaScript code to analyze
- `options` (object):
  - `target` (string): Target ES version
  - `quick?` (boolean): Use quick mode only (default: false)
  - `throwOnFirst?` (boolean): Stop on first incompatible feature (default: false)

**Returns:** `boolean`

### `getMinimumESVersion(code, options?)`

Returns the **minimum ES version** required to run the code.

```javascript
import { getMinimumESVersion } from 'fast-brake';

const version1 = getMinimumESVersion('var x = 10;');
console.log(version1); // 'es5'

const version2 = getMinimumESVersion('const x = () => {};');
console.log(version2); // 'es2015'

const version3 = getMinimumESVersion('const x = obj?.prop ?? "default";');
console.log(version3); // 'es2020'
```

**Parameters:**
- `code` (string): JavaScript code to analyze
- `options?` (object):
  - `quick?` (boolean): Use quick mode only (default: false)

**Returns:** `string` - ES version ('es5', 'es2015', 'es2016', etc.)

## Performance Benchmarks

### Plugin Configuration Performance  
Tested on MacBook Pro M4 (8.9KB test file):

| Configuration | Ops/sec | vs Single ES5 | Use Case |
|--------------|---------|---------------|----------|
| **Telemetry Only** | 4,951 | 2.03x | Analytics/tracking detection |
| **Single ES2015** | 2,459 | 1.01x | Known ES2015 target |
| **Single ES2020** | 2,452 | 1.01x | Known ES2020 target |
| **Single ES5** | 2,439 | 1.00x (baseline) | Known ES5 target |
| **Legacy Browsers** | 2,416 | 0.99x | Older browser support |
| **Modern Browsers** | 2,371 | 0.97x | Last 2 versions |
| **ES Detect** | 2,353 | 0.96x | Auto-detect min version |
| **All ES Versions** | 2,343 | 0.96x | Comprehensive checking |
| **All + Telemetry** | 1,653 | 0.68x | ES + tracking detection |
| **All + Browsers** | 1,504 | 0.62x | Full compatibility |
| **Kitchen Sink** | 1,080 | 0.44x | Everything enabled |

### Parser Comparison - ES5 File (455B)
Tested on MacBook Pro M4:

| Parser | Ops/sec | Time (ms) | Relative | Status |
|--------|---------|-----------|----------|--------|
| **fast-brake (pattern)** | 110,842 | 0.009 | 1.0x | ✅ es5 |
| **Meriyah** | 68,213 | 0.015 | 0.6x | ✅ parsed |
| **Cherow** | 56,497 | 0.018 | 0.5x | ✅ parsed |
| **Esprima** | 42,735 | 0.023 | 0.4x | ✅ parsed |
| **fast-brake (es2015)** | 42,644 | 0.023 | 0.4x | ✅ es2015 check |
| **fast-brake (all ES)** | 42,500 | 0.024 | 0.4x | ✅ all versions |
| **fast-brake (es5)** | 39,130 | 0.026 | 0.4x | ✅ es5 check |
| **Acorn** | 38,627 | 0.026 | 0.3x | ✅ parsed |
| **Espree** | 28,513 | 0.035 | 0.3x | ✅ parsed |
| **Babel** | 21,701 | 0.046 | 0.2x | ✅ parsed |
| **fast-brake (all+browser)** | 19,782 | 0.051 | 0.2x | ✅ all+browser |
| **fast-brake (full)** | 17,170 | 0.058 | 0.2x | ✅ es5 |

### Parser Comparison - ES2015 File (711B)
Tested on MacBook Pro M4:

| Parser | Ops/sec | Time (ms) | Relative | Status |
|--------|---------|-----------|----------|--------|
| **fast-brake (pattern)** | 72,812 | 0.014 | 1.0x | ✅ es2015 |
| **Meriyah** | 62,628 | 0.016 | 0.9x | ✅ parsed |
| **Cherow** | 58,772 | 0.017 | 0.8x | ✅ parsed |
| **Esprima** | 36,789 | 0.027 | 0.5x | ❌ parse error |
| **Acorn** | 25,866 | 0.039 | 0.4x | ❌ parse error |
| **fast-brake (all ES)** | 24,678 | 0.041 | 0.3x | ✅ all versions |
| **fast-brake (es2015)** | 24,265 | 0.041 | 0.3x | ✅ es2015 check |
| **fast-brake (es5)** | 23,041 | 0.043 | 0.3x | ✅ es5 check |
| **Babel** | 19,152 | 0.052 | 0.3x | ✅ parsed |
| **Espree** | 17,036 | 0.059 | 0.2x | ❌ parse error |
| **fast-brake (full)** | 11,606 | 0.086 | 0.2x | ✅ es2015 |
| **fast-brake (all+browser)** | 10,797 | 0.093 | 0.1x | ✅ all+browser |

*Benchmarked on 2025-08-23*

### When to use Quick vs Full mode

**Quick Mode** (`{ quick: true }`):
- **Up to 7x faster** than full mode
- Perfect for **build tools** and **hot reloading**
- **Pattern-based detection** without tokenizer validation
- Use when **speed is critical**

**Full Mode** (default):
- **High accuracy** with tokenizer validation
- **Still faster** than AST parsers
- **Recommended** for most use cases
- Use for **linting**, **CI/CD**, and **production builds**

## Browser Support

ES version compatibility with major browsers:

| ES Version | Chrome | Firefox | Safari | Node.js |
|------------|--------|---------|--------|---------|
| ES5 | 5+ | 4+ | 5+ | 0.10+ |
| ES2015 | 51+ | 54+ | 10+ | 6+ |
| ES2016 | 52+ | 55+ | 10.1+ | 7+ |
| ES2017 | 58+ | 53+ | 11+ | 8+ |
| ES2018 | 64+ | 58+ | 12+ | 10+ |
| ES2019 | 73+ | 62+ | 12.1+ | 12+ |
| ES2020 | 80+ | 74+ | 13.1+ | 14+ |
| ES2021 | 85+ | 79+ | 14.1+ | 15+ |
| ES2022 | 94+ | 93+ | 15.4+ | 16+ |

## Use Cases

### Build Tool Integration
```javascript
import { check } from 'fast-brake';

// Validate code before bundling
if (!check(sourceCode, { target: 'es2015' })) {
  console.warn('Code requires transpilation for ES2015 compatibility');
}
```

### Linting Integration
```javascript
import { detect } from 'fast-brake';

// Check for features not allowed in your project
const features = detect(code);
const modernFeatures = features.filter(f => 
  ['es2020', 'es2021', 'es2022'].includes(f.version)
);

if (modernFeatures.length > 0) {
  console.error('Modern ES features detected:', modernFeatures);
}
```

### CI/CD Pipeline
```javascript
import { fastBrake } from 'fast-brake';
import { readFileSync } from 'fs';

// Validate all source files
const files = ['src/index.js', 'src/utils.js'];
for (const file of files) {
  const code = readFileSync(file, 'utf-8');
  try {
    fastBrake(code, { target: 'es2018' });
    console.log(`${file} is ES2018 compatible`);
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    process.exit(1);
  }
}
```

### Dynamic Feature Detection
```javascript
import { getMinimumESVersion } from 'fast-brake';

// Determine polyfill requirements
const userCode = getUserSubmittedCode();
const requiredVersion = getMinimumESVersion(userCode);

if (requiredVersion === 'es5') {
  // No polyfills needed
} else if (requiredVersion === 'es2015') {
  loadES2015Polyfills();
} else {
  loadModernPolyfills();
}
```

## TypeScript Support

fast-brake includes full TypeScript definitions:

```typescript
import { 
  fastBrake, 
  detect, 
  check, 
  getMinimumESVersion,
  DetectedFeature,
  DetectionOptions 
} from 'fast-brake';

const options: DetectionOptions = {
  target: 'es2015',
  quick: false,
  throwOnFirst: true
};

const features: DetectedFeature[] = detect(code, options);
```

## Development

### Remote Caching (Vercel)

Speed up builds with Vercel remote caching:

```bash
# Create .env.local with your Vercel token
echo "TURBO_TOKEN=your-vercel-token" > .env.local
echo "TURBO_TEAM=your-team-id" >> .env.local

# Get token from: https://vercel.com/account/tokens
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Jeff Wainwright](https://jeffry.in)