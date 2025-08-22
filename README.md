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
- **False Positive Protection** - Tokenizer eliminates string/comment false positives

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
- **Eliminates false positives** from strings, comments, and regex
- Validates features using intelligent tokenization
- Adds additional features detected through token analysis (imports, exports, etc.)

```javascript
// Quick mode: Phase 1 only (fastest, may have false positives)
const quickFeatures = detect(code, { quick: true });

// Full mode: Phase 1 + Phase 2 (recommended, eliminates false positives)
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

Tested on a MacBook Pro M1 with typical JavaScript files:

| Metric | fast-brake (Quick) | fast-brake (Full) | Traditional AST Parser |
|--------|-------------------|-------------------|----------------------|
| Single file (1KB) | **0.013ms** | 0.055ms | ~2ms |
| 1000 files | **13ms** | 55ms | ~100ms |
| Memory usage | **4MB** | 4MB | ~15MB |
| Accuracy | 95% | **99.9%** | 99.9% |

### When to use Quick vs Full mode

**Quick Mode** (`{ quick: true }`):
- **7x faster** than full mode
- Perfect for **build tools** and **hot reloading**
- May have **false positives** from strings/comments
- Use when **speed is critical** and occasional false positives are acceptable

**Full Mode** (default):
- **99.9% accuracy** - eliminates false positives
- **Still 2x faster** than AST parsers
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