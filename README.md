# Fast Brake 

**Fast braking match detection!** Fast brake enables a plugins and extension based schema to detect matches using JavaScript very fast. This is useful for detecting ECMAscript api features, Telemetry or other spec pattern matches you'd like to spec with a focus on speed.

## Installation

```bash
bun install fast-brake
```

## Quick Start

```javascript
import { fastBrake, detect, check } from 'fast-brake';

// Basic usage - detect features (returns array of detected features)
const features = await fastBrake('const x = () => {}');
console.log(features);
// [{ name: 'arrow_functions', version: 'es2015' }]

// Using with plugins
import { esAll } from 'fast-brake/src/plugins/esversion';
import { telemetryPlugin } from 'fast-brake/src/plugins/telemetry';

const detector = new Detector();
await detector.initialize([esAll, telemetryPlugin]);
const results = await detector.detect(code);

// Using with extensions for enhanced metadata
import { locExtension } from 'fast-brake/src/extensions/loc';

const enhancedDetector = new Detector({ extensions: [locExtension] });
await enhancedDetector.initialize();
const detailedResults = await enhancedDetector.detect(code);

// Check if code is compatible (returns boolean)
const isCompatible = await check('const x = () => {}', { target: 'es5' });
console.log(isCompatible); // false
```

## Why Fast Brake?

Other tools, like the parsers that inspired this utility provide a full AST to process files. They're incredibe! **Fast Brake** is optimized to a different pattern. To detect or find patterns based on matches very fast. Fast Brake is built with auto ES version detection, automatically determining the minimum required ES version for your code.

This is nice for:
- **Build tools** - Validate code compatibility before bundling
- **Linters** - Check ES version or Telemetry compliance in CI/CD
- **Transpilers** - Determine which features need polyfilling
- **Code analysis** - Understand your codebase's ES requirements

## Features

- **Fast** - Process files faster for match a spec faster than full AST parsing (in JavaScript at lest)
- **Zero Runtime Dependencies** - Lightweight and secure
- **Pattern Matching** - Optimized string, regex-based detection
- **ES5 to ES2025** - Comprehensive feature coverage (40+ features)
- **Programmatic API** - Simple, intuitive interface
- **Performance First** - Optimized for speed
- **Plugin enabled** - Mix and match plugins with a basic api
- **Simple interface** - Clean and straightforward API 

## Why this was made?

Pre-2025, detecting issues that can cause es issues fast in bundles, dependencies is a necessity for CI/CD. In 2025, with Telemetry, Privacy Policies, and AI, it's important to know what you have going on in your files. This is why fast-brake was built!

Initially, I was inspired by [acorn.js](), then [meriyah]() (amazing tools). I submitted a pull request so I could implement plugins using meriyah. [name]() provided inside into another direction which led me to making fast-brake—which is built on a very simple api to enable an architecture based on failing fast.


## Pattern-Based Detection

fast-brake uses **optimized pattern matching** for maximum speed:

- **String matching where possible** - match strings before pattern matching
- **High-performance regex patterns** - patterns for each item, such as an ES feature; with string detection before to detect if the pattern matching is even required
- **Single-pass scanning** - Processes code once for all features
- **Early exit optimization** - Stops on first incompatible feature when configured
- **Minimal overhead** - No AST or tokenization

```javascript
// Detect all ES features in code
const features = detect(code);

// Stop on first incompatible feature (fastest)
fastBrake(code, { target: 'es5', throwOnFirst: true });
```

## API Reference

### `fastBrake(code, options?)`

Analyzes code and returns detected features. This is an async function.

```javascript
import { fastBrake } from 'fast-brake';

const features = await fastBrake('const x = () => {}');
console.log(features);
// [{ name: 'arrow_functions', version: 'es2015' }]

// With custom plugins
const features = await fastBrake(code, { 
  plugins: [myCustomPlugin] 
});
```

**Parameters:**
- `code` (string): Code to analyze
- `options` (optional):
  - `plugins` (Plugin[]): Array of plugins to use for detection
  - `target` (string): Target ES version
  - `throwOnFirst` (boolean): Stop on first incompatible feature

**Returns:** `Promise<DetectedFeature[]>`

### `detect(code, options?)`

Returns an array of detected features. This is an async function.

```javascript
import { detect } from 'fast-brake';

const features = await detect(`
  const arrow = () => {};
  const template = \`Hello \${name}\`;
`);

console.log(features);
// [{ name: 'arrow_functions', version: 'es2015' }]

// With plugins
const features = await detect(code, {
  plugins: [esAll, telemetryPlugin]
});
```

**Parameters:**
- `code` (string): Code to analyze
- `options` (optional):
  - `plugins` (Plugin[]): Array of plugins to use for detection

**Returns:** `Promise<DetectedFeature[]>`
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

Returns a boolean indicating if code is compatible with the target version. This is an async function.

```javascript
import { check } from 'fast-brake';

const isES5Compatible = await check('var x = 10;', { target: 'es5' });
console.log(isES5Compatible); // true

const hasES6Features = await check('const x = () => {};', { target: 'es5' });
console.log(hasES6Features); // false

// With custom plugins
const isCompatible = await check(code, { 
  target: 'es5',
  plugins: [myPlugin]
});
```

**Parameters:**
- `code` (string): Code to analyze
- `options` (DetectionOptions):
  - `target` (string): Target ES version
  - `plugins?` (Plugin[]): Array of plugins to use
  - `throwOnFirst?` (boolean): Stop on first incompatible feature
  - `ignorePatterns?` (string[]): Patterns to ignore
  - `preprocessors?` (Array<(code: string) => string>): Code preprocessors

**Returns:** `Promise<boolean>`

### Additional Exports

Fast Brake also exports these classes and utilities:

```javascript
import { Detector, Scanner, FastBrakeCache } from 'fast-brake';

// Create a detector instance with custom plugins
const detector = new Detector();
await detector.initialize([myPlugin1, myPlugin2]);

// Scanner for file system operations
const scanner = new Scanner();

// Cache for performance optimization
const cache = new FastBrakeCache();
```

## Plugin System

Fast Brake uses a plugin-based architecture for feature detection. Plugins define patterns and rules for detecting specific JavaScript features or telemetry.

### Plugin Schema

Each plugin follows the types defined in the [Plugin Schema](https://github.com/yowainwright/fast-brake/blob/main/src/types/plugin.ts):

```typescript
interface Plugin {
  name: string;        // Unique plugin identifier
  description: string; // Plugin description
  spec: PluginSpec;    // Plugin specification
}

interface PluginSpec {
  orderedRules: string[];                    // Ordered list of rules (e.g., ES versions)
  matches: Record<string, PluginMatch>;      // Detection patterns mapped by feature name
}

interface PluginMatch {
  rule: string;                 // Rule this match belongs to (e.g., "es2015")
  strings?: string[];           // Fast string patterns to check first
  patterns?: PluginPattern[];   // Regex patterns for detailed matching
}

interface PluginPattern {
  pattern: string;      // Regex pattern string
  identifier?: string;  // Optional identifier for the pattern
}
```

### Using Plugins

Plugins can be passed to any of the main functions:

```javascript
import { fastBrake, detect, check } from 'fast-brake';
import { es2020 } from 'fast-brake/src/plugins/esversion';
import { telemetryPlugin } from 'fast-brake/src/plugins/telemetry';

// Pass single plugin
const features = await fastBrake(code, { plugins: [es2020] });

// Pass multiple plugins
const results = await detect(code, { 
  plugins: [es2020, telemetryPlugin] 
});

// Use with check function
const isCompatible = await check(code, { 
  target: 'es2020',
  plugins: [es2020, telemetryPlugin] 
});
```

### Creating Custom Plugins

```javascript
const myPlugin = {
  name: "my-custom-plugin",
  description: "Detects custom patterns",
  spec: {
    orderedRules: ["rule1", "rule2"],
    matches: {
      "feature_name": {
        rule: "rule1",
        strings: ["console.log"],
        patterns: [
          { pattern: "console\\.(log|warn|error)", identifier: "console_methods" }
        ]
      }
    }
  }
};
```

## Built-in Plugins

Fast Brake includes several built-in plugins for different detection needs:

### 1. ES Version Plugin
Detects ECMAScript features from ES5 through ES2025.

```javascript
import { es5, es2015, es2020, esAll } from 'fast-brake/src/plugins/esversion';

// Use specific version checks
const plugin = es2015; // Checks for features newer than ES2015

// Or use the complete plugin
const allFeatures = esAll; // Detects all ES features
```

### 2. Telemetry Plugin 
Identifies analytics and tracking code patterns.

```javascript
import { telemetryPlugin, strictTelemetryPlugin } from 'fast-brake/src/plugins/telemetry';

// Standard telemetry detection
const plugin = telemetryPlugin;

// Strict mode treats all telemetry as errors
const strict = strictTelemetryPlugin;
```

### 3. Browserlist Plugin
Checks compatibility with specific browser versions.

```javascript
import browserlistPlugin from 'fast-brake/src/plugins/browserlist';

// Use the browserlist plugin
const plugin = browserlistPlugin;
```

### 4. Detect Plugin
Auto-detects the minimum required ES version.

```javascript
import detectPlugin from 'fast-brake/src/plugins/detect';

// Automatically determine minimum ES version
const plugin = detectPlugin;
```

## Extensions

Fast Brake supports extensions that provide metadata and examples for enhanced detection capabilities.

### Extension Schema

Each extension follows the types defined in the [Extension Schema](https://github.com/yowainwright/fast-brake/blob/main/src/types/extension.ts):

```typescript
interface Extension {
  name: string;        // Extension name
  description: string; // Extension description  
  spec: {             // Extension specification
    code: string;     // Example code
    result: {         // Example result
      name: string;
      match: string;
      spec: object;   // Additional metadata
      rule: string;
      index?: number;
    }
  }
}
```

### Using Extensions

Extensions can be passed to enhance detection with additional metadata:

```javascript
import { Detector } from 'fast-brake';
import { locExtension } from 'fast-brake/src/extensions/loc';
import { throwExtension } from 'fast-brake/src/extensions/throw';

// Use single extension
const detector = new Detector({ extensions: [locExtension] });
await detector.initialize();
const results = await detector.detect(code);

// Use multiple extensions
const enhancedDetector = new Detector({ 
  extensions: [locExtension, throwExtension] 
});
await enhancedDetector.initialize();
const detailedResults = await enhancedDetector.detect(code);
```

### Built-in Extensions

#### 1. throw Extension
Provides metadata for error throwing patterns:

```javascript
import { throwExtension } from 'fast-brake/src/extensions/throw';

console.log(throwExtension);
// {
//   name: "throw",
//   description: "Throws an error when specific patterns...",
//   spec: {
//     code: "throw new Error('Invalid operation');",
//     result: {
//       name: "throw-statement",
//       match: "throw new Error",
//       spec: { type: "error-throw", errorType: "Error", message: "Invalid operation" },
//       rule: "throw-statement-pattern",
//       index: 0
//     }
//   }
// }
```

#### 2. loc Extension  
Provides metadata for location enrichment:

```javascript
import { locExtension } from 'fast-brake/src/extensions/loc';

console.log(locExtension);
// {
//   name: "loc",
//   description: "Enriches detected features with location information...",
//   spec: {
//     code: "const arrow = () => { return 42; }",
//     result: {
//       name: "arrow-function",
//       match: "() =>",
//       spec: {
//         loc: {
//           start: { line: 1, column: 14 },
//           end: { line: 1, column: 19 },
//           offset: 14,
//           length: 5
//         }
//       },
//       rule: "arrow-function-pattern",
//       index: 14
//     }
//   }
// }
```

### ES Version Features

#### EsVersion (default plugin)

#### ES2015 (ES6) Features
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

#### ES2016 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Exponentiation | `**` | `2 ** 3` |

#### ES2017 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Async/Await | `async`/`await` | `async function fn() { await promise }` |

#### ES2018 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Async Iteration | `for await` | `for await (const item of asyncIterable)` |
| Rest/Spread Properties | `{...obj}` | `const newObj = {...obj}` |

#### ES2019 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Array.flat() | `.flat()` | `arr.flat()` |
| Array.flatMap() | `.flatMap()` | `arr.flatMap(fn)` |

#### ES2020 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Optional Chaining | `?.` | `obj?.prop?.method?.()` |
| Nullish Coalescing | `??` | `value ?? 'default'` |
| BigInt | `123n` | `const big = 123n` |
| Promise.allSettled | `Promise.allSettled` | `Promise.allSettled(promises)` |
| globalThis | `globalThis` | `globalThis.myVar` |

#### ES2021 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Logical Assignment | `\|\|=`, `&&=`, `??=` | `x ??= 'default'` |
| Numeric Separators | `1_000_000` | `const million = 1_000_000` |
| String.replaceAll | `.replaceAll()` | `str.replaceAll('old', 'new')` |
| Promise.any | `Promise.any` | `Promise.any(promises)` |

#### ES2022 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Private Fields | `#field` | `class C { #private = 1 }` |
| Static Blocks | `static {}` | `class C { static { /* init */ } }` |
| Array.at() | `.at()` | `arr.at(-1)` |
| Object.hasOwn | `Object.hasOwn` | `Object.hasOwn(obj, 'prop')` |
| Top-level Await | `await` (module) | `const data = await fetch(url)` |

#### ES2023 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Array.findLast() | `.findLast()` | `arr.findLast(x => x > 10)` |
| Array.findLastIndex() | `.findLastIndex()` | `arr.findLastIndex(x => x > 10)` |
| Array.toReversed() | `.toReversed()` | `arr.toReversed()` |
| Array.toSorted() | `.toSorted()` | `arr.toSorted()` |
| Array.toSpliced() | `.toSpliced()` | `arr.toSpliced(1, 2, 'new')` |
| Array.with() | `.with()` | `arr.with(0, 'new')` |
| Hashbang | `#!` | `#!/usr/bin/env node` |

#### ES2024 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| RegExp v flag | `/pattern/v` | `/[\p{Letter}]/v` |
| Array.fromAsync() | `Array.fromAsync` | `Array.fromAsync(asyncIterable)` |
| Promise.withResolvers | `Promise.withResolvers` | `const { promise, resolve, reject } = Promise.withResolvers()` |
| Object.groupBy() | `Object.groupBy` | `Object.groupBy(items, item => item.category)` |
| Map.groupBy() | `Map.groupBy` | `Map.groupBy(items, item => item.category)` |

#### ES2025 Features
| Feature | Pattern | Example |
|---------|---------|---------|
| Temporal API | `Temporal.` | `Temporal.Now.plainDateISO()` |
| RegExp duplicate named groups | `(?<name>)` | `/(?<year>\d{4})-(?<year>\d{2})/` |
| Set methods | `.intersection()` | `setA.intersection(setB)` |
| | `.union()` | `setA.union(setB)` |
| | `.difference()` | `setA.difference(setB)` |
| | `.symmetricDifference()` | `setA.symmetricDifference(setB)` |
| | `.isSubsetOf()` | `setA.isSubsetOf(setB)` |
| | `.isSupersetOf()` | `setA.isSupersetOf(setB)` |
| | `.isDisjointFrom()` | `setA.isDisjointFrom(setB)` |


## Performance Benchmarks

<!-- BENCHMARK_START -->

### ES5 (Legacy)

File size: 0.4 KB

| Parser | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|-----------|---------|----------|----------|
| fast-brake (detect) | 0.009 | 112,857 | 1.0x | none |
| fast-brake (browserlist) | 0.009 | 111,714 | 1.0x | browser check |
| fast-brake | 0.009 | 105,621 | 0.9x | none |
| fast-brake (es2015 only) | 0.010 | 102,473 | 0.9x | es2015 check |
| fast-brake (es5 only) | 0.017 | 60,269 | 0.5x | es5 check |
| meriyah | 0.020 | 51,259 | 0.5x | parsed |
| cherow | 0.021 | 47,241 | 0.4x | parsed |
| esprima | 0.028 | 36,123 | 0.3x | parsed |
| acorn | 0.036 | 27,923 | 0.2x | parsed |
| espree | 0.038 | 25,999 | 0.2x | parsed |
| @babel/parser | 0.059 | 17,053 | 0.2x | parsed |

### ES2015 (Modern)

File size: 0.7 KB

| Parser | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|-----------|---------|----------|----------|
| fast-brake | 0.002 | 570,953 | 1.0x | none |
| fast-brake (detect) | 0.005 | 195,864 | 0.3x | none |
| fast-brake (es5 only) | 0.009 | 109,395 | 0.2x | es5 check |
| fast-brake (browserlist) | 0.015 | 68,932 | 0.1x | browser check |
| fast-brake (es2015 only) | 0.018 | 55,821 | 0.1x | es2015 check |
| cherow | 0.019 | 53,623 | 0.1x | parsed |
| meriyah | 0.019 | 53,169 | 0.1x | parsed |
| acorn | 0.046 | 21,804 | 0.0x | parsed |
| espree | 0.055 | 18,047 | 0.0x | parsed |
| @babel/parser | 0.059 | 16,994 | 0.0x | parsed |
| esprima | - | - | - | parse error |

### ES2022 (Latest)

File size: 1.2 KB

| Parser | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|-----------|---------|----------|----------|
| fast-brake | 0.002 | 613,701 | 1.0x | none |
| fast-brake (detect) | 0.004 | 240,161 | 0.4x | none |
| fast-brake (es2015 only) | 0.007 | 142,753 | 0.2x | es2015 check |
| fast-brake (browserlist) | 0.009 | 117,364 | 0.2x | browser check |
| fast-brake (es5 only) | 0.009 | 114,583 | 0.2x | es5 check |
| meriyah | 0.018 | 54,394 | 0.1x | parsed |
| acorn | 0.037 | 26,683 | 0.0x | parsed |
| espree | 0.040 | 24,848 | 0.0x | parsed |
| @babel/parser | 0.045 | 22,219 | 0.0x | parsed |
| esprima | - | - | - | parse error |
| cherow | - | - | - | parse error |

### Large File (100x)

File size: 69.4 KB

| Parser | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|-----------|---------|----------|----------|
| fast-brake | 0.001 | 694,867 | 1.0x | none |
| fast-brake (detect) | 0.005 | 201,508 | 0.3x | none |
| fast-brake (es5 only) | 0.009 | 115,028 | 0.2x | es5 check |
| fast-brake (browserlist) | 0.646 | 1,548 | 0.0x | browser check |
| fast-brake (es2015 only) | 0.978 | 1,023 | 0.0x | es2015 check |
| cherow | 0.982 | 1,019 | 0.0x | parsed |
| meriyah | 1.039 | 962 | 0.0x | parsed |
| @babel/parser | - | - | - | parse error |
| acorn | - | - | - | parse error |
| esprima | - | - | - | parse error |
| espree | - | - | - | parse error |


<!-- BENCHMARK_END -->

### Performance Highlights

Based on the latest benchmarks:

- **~600,000 operations per second** for standard ES2015/ES2022 code
- **33x faster** than @babel/parser for ES feature detection
- **12x faster** than meriyah (the fastest full parser)
- **Optimized for real-world use** - even faster on large files (665k ops/sec)
- **Native performance** - leverages V8/JSC optimized string operations
- **Zero overhead** - no AST generation or unnecessary allocations

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

Fast-brake supports detection of all ES versions from ES5 through ES2025+:

| ES Version | Chrome | Firefox | Safari | Node.js | Key Features |
|------------|--------|---------|--------|---------|--------------|
| ES5 (2009) | 5+ | 4+ | 5+ | 0.10+ | Strict mode, JSON, Array methods |
| ES2015/ES6 | 51+ | 54+ | 10+ | 6+ | Arrow functions, Classes, Template literals |
| ES2016 | 52+ | 55+ | 10.1+ | 7+ | Exponentiation, Array.includes |
| ES2017 | 58+ | 53+ | 11+ | 8+ | Async/await, Object.entries |
| ES2018 | 64+ | 58+ | 12+ | 10+ | Rest/spread, Async iteration |
| ES2019 | 73+ | 62+ | 12.1+ | 12+ | Array.flat, Object.fromEntries |
| ES2020 | 80+ | 74+ | 13.1+ | 14+ | Optional chaining, Nullish coalescing |
| ES2021 | 85+ | 79+ | 14.1+ | 15+ | Logical assignment, String.replaceAll |
| ES2022 | 94+ | 93+ | 15.4+ | 16+ | Top-level await, Class fields |
| ES2023 | 110+ | 104+ | 16.4+ | 19+ | Array methods (toReversed, toSorted, with) |
| ES2024 | 120+ | 119+ | 17.2+ | 21+ | Promise.withResolvers, Object.groupBy |
| ES2025 | 125+ | 125+ | 18+ | 22+ | Set methods, Temporal API |

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

MIT © [@yowainwright](https://github.com/yowainwright), [Jeff Wainwright](https://jeffry.in)