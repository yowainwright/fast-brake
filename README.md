# [Brakefast](https://jeffry.in/brakefast/)

![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)
[![npm version](https://badge.fury.io/js/brakefast.svg)](https://badge.fury.io/js/brakefast)
![ci](https://github.com/yowainwright/brakefast/actions/workflows/ci.yml/badge.svg)
[![Github](https://badgen.net/badge/icon/github?icon=github&label&color=grey)](https://github.com/yowainwright/brakefast)
![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2Fyowainwright%2Fbrakefast)

#### Optimize your build performance by analyzing and caching build dependencies! 🚀 ⚡

With the Brakefast CLI, you can analyze your build performance, identify bottlenecks, and implement smart caching strategies to speed up your development workflow. Jump to [setup](#setup) or scroll on!

---

## What _is_ Brakefast?

> Brakefast is a build performance optimization tool!<br>**_It helps developers analyze, understand, and optimize their build processes through intelligent caching and dependency analysis._**

Modern JavaScript projects often have complex build chains with multiple dependencies, bundlers, and compilation steps. Over time, builds can become slower due to dependency bloat, inefficient caching strategies, or unnecessary rebuilding of unchanged modules. This impacts developer productivity and CI/CD pipeline performance.

---

## Why is Brakefast Awesome?

> Is your build taking too long? Are you rebuilding the same dependencies repeatedly? Is there a smarter way?

After working with various build tools and dependency management systems, **_it's easy to lose track of what's actually slowing down your builds!_** This is an inconvenient problem when trying to maintain fast development workflows. This information is not really known—**until now!**

With Brakefast CLI, you can run the `brakefast analyze` command and get insights like this:

```bash
🚀 ⚡ Brakefast: Build Performance Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Build Time: 2.3s (↓ 40% from last run)
🎯 Cache Hit Rate: 85%
📦 Dependencies Analyzed: 47

🔥 Hotspots:
  • webpack compilation: 1.2s
  • TypeScript check: 0.8s  
  • ESLint: 0.3s

💡 Recommendations:
  • Consider incremental TypeScript compilation
  • Enable webpack persistent caching
  • Exclude test files from production builds
```

But there's more!

Brakefast will automatically cache build artifacts and dependencies, and provide intelligent recommendations for optimizing your build configuration.

### ✨ Key Features

**Intelligent Caching**: Automatically detects and caches build artifacts based on dependency changes:

```js
// brakefast.config.js
{
  "cache": {
    "enabled": true,
    "directory": ".brakefast-cache",
    "maxSize": "500MB",
    "ttl": "7d"
  }
}
```

**Performance Analysis**: Get detailed insights into your build performance with timing breakdowns and bottleneck identification.

**Smart Recommendations**: Receive actionable suggestions to improve build times based on your specific project configuration.

There's more to come with Brakefast! By integrating Brakefast into your development workflow, you can significantly improve build performance and developer productivity!

---

## How Brakefast works

> #### Brakefast analyzes and optimizes your builds so you don't have to!

It consists of several analysis engines that examine your build process, dependency graph, and caching strategies to provide intelligent optimization recommendations.

Brakefast monitors your build process and identifies patterns in:
- Dependency resolution times
- Compilation bottlenecks  
- Cache hit/miss ratios
- File change patterns

This means with Brakefast, your main concern is writing great code while the build performance optimization happens automatically.

Broken down, Brakefast optimizes your builds with these simple steps:

1. **Analyze** - Examines your current build process and identifies bottlenecks
2. **Cache** - Implements intelligent caching strategies for dependencies and artifacts
3. **Optimize** - Provides recommendations and automatic optimizations
4. **Monitor** - Continuously tracks build performance improvements

### Key notes

1. Brakefast does **not** replace your existing build tools - it enhances them.
2. Brakefast **does** provide intelligent caching and performance analysis.
3. Brakefast will identify optimization opportunities specific to your project setup.

---

## Setup

> #### Ready to speed up your builds? Let's get started!

Please submit a [pull request](https://github.com/yowainwright/brakefast/pulls) or [issue](https://github.com/yowainwright/brakefast/issues) if you need help!

Here's the super simple setup:

1. Install

```bash
bun add brakefast --save-dev
# brakefast is a development tool for optimizing your build process
```

2. Run analysis

```bash
brakefast analyze
# => Analyze your current build performance
```

3. Enable caching

```bash
brakefast cache --enable
# => Enable intelligent build caching
```

4. (recommended) add Brakefast to your build script

```js
// package.json
{
  "scripts": {
    "build": "brakefast && your-build-command",
    "dev": "brakefast --watch && your-dev-command"  
  }
}
```

---

## Testing

### Unit Tests

```bash
bun test
```

### Build Tests

```bash
bun run build
bun run typecheck
bun run lint
```

In the future, Brakefast will support configuration files and more advanced optimization strategies!

---

## Thanks

Inspired by modern build tools and the need for better build performance optimization in JavaScript projects.

---

Made by [@yowainwright](https://github.com/yowainwright) for faster builds with passion! MIT, 2024
js tokenization for braking faster than you can say say "green eggs and ham"
