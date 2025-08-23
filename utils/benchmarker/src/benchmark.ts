#!/usr/bin/env bun
import { detect, getMinimumESVersion, detectWithPlugins } from 'fast-brake';
import * as babel from '@babel/parser';
import * as acorn from 'acorn';
import * as esprima from 'esprima';
import * as espree from 'espree';
import { parse as meriyahParse } from 'meriyah';
import { parse as cherowParse } from 'cherow';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Table from 'cli-table3';
import pc from 'picocolors';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relativeSpeed: number;
  accuracy?: string;
  memoryMB?: number;
}

interface TestCase {
  name: string;
  code: string;
  size: number;
  expectedFeatures?: string[];
  expectedVersion?: string;
}

function loadTestCases(): TestCase[] {
  const fixturesDir = join(__dirname, '../../../tests/fixtures');
  const cases: TestCase[] = [
    {
      name: 'ES5 (Legacy)',
      code: readFileSync(join(fixturesDir, 'es5.js'), 'utf-8'),
      size: 0,
      expectedVersion: 'es5'
    },
    {
      name: 'ES2015 (Modern)',
      code: readFileSync(join(fixturesDir, 'es2015.js'), 'utf-8'),
      size: 0,
      expectedVersion: 'es2015'
    },
    {
      name: 'ES2020 (Recent)',
      code: readFileSync(join(fixturesDir, 'es2020.js'), 'utf-8'),
      size: 0,
      expectedVersion: 'es2020'
    },
    {
      name: 'ES2022 (Latest)',
      code: readFileSync(join(fixturesDir, 'es2022.js'), 'utf-8'),
      size: 0,
      expectedVersion: 'es2022'
    }
  ];

  const largeCode = cases[1].code.repeat(100); // 100x ES2015 code
  cases.push({
    name: 'Large File (100x)',
    code: largeCode,
    size: largeCode.length,
    expectedVersion: 'es2015'
  });

  cases.forEach(c => {
    if (c.size === 0) c.size = Buffer.byteLength(c.code, 'utf-8');
  });

  return cases;
}

const parsers = {
  'fast-brake (pattern)': {
    parse: (code: string) => detect(code, { quick: true }),
    description: 'Pattern matching + tokenization',
    validate: (code: string) => {
      const features = detect(code);
      const version = getMinimumESVersion(code);
      return { features: features.length, version };
    }
  },
  'fast-brake (full)': {
    parse: (code: string) => detect(code, { quick: false }),
    description: 'Full analysis mode',
    validate: (code: string) => {
      const features = detect(code, { quick: false });
      const version = getMinimumESVersion(code, { quick: false });
      return { features: features.length, version };
    }
  },
  'fast-brake (es5 only)': {
    parse: (code: string) => detectWithPlugins(code, ['es5']),
    description: 'Single ES5 plugin',
    validate: (code: string) => {
      const features = detectWithPlugins(code, ['es5']);
      return { features: features.length, version: 'es5 check' };
    }
  },
  'fast-brake (es2015 only)': {
    parse: (code: string) => detectWithPlugins(code, ['es2015']),
    description: 'Single ES2015 plugin',
    validate: (code: string) => {
      const features = detectWithPlugins(code, ['es2015']);
      return { features: features.length, version: 'es2015 check' };
    }
  },
  'fast-brake (all ES)': {
    parse: (code: string) => detectWithPlugins(code, ['all']),
    description: 'All ES versions plugin',
    validate: (code: string) => {
      const features = detectWithPlugins(code, ['all']);
      return { features: features.length, version: 'all versions' };
    }
  },
  'fast-brake (all + browser)': {
    parse: (code: string) => detectWithPlugins(code, ['all', 'browser:defaults']),
    description: 'All ES + browserlist',
    validate: (code: string) => {
      const features = detectWithPlugins(code, ['all', 'browser:defaults']);
      return { features: features.length, version: 'all + browser' };
    }
  },
  '@babel/parser': {
    parse: (code: string) => babel.parse(code, { 
      sourceType: 'module',
      plugins: ['jsx', 'typescript'] 
    }),
    description: 'Full AST parser',
    validate: (code: string) => {
      try {
        const ast = babel.parse(code, { sourceType: 'module' });
        return { nodes: ast.program.body.length };
      } catch (e) {
        return { error: true };
      }
    }
  },
  'acorn': {
    parse: (code: string) => acorn.parse(code, { 
      ecmaVersion: 'latest' as any,
      sourceType: 'module'
    }),
    description: 'Lightweight parser',
    validate: (code: string) => {
      try {
        const ast = acorn.parse(code, { ecmaVersion: 'latest' as any });
        return { nodes: ast.body.length };
      } catch (e) {
        return { error: true };
      }
    }
  },
  'esprima': {
    parse: (code: string) => esprima.parseScript(code),
    description: 'ECMAScript parser',
    validate: (code: string) => {
      try {
        const ast = esprima.parseScript(code);
        return { nodes: ast.body.length };
      } catch (e) {
        return { error: true };
      }
    }
  },
  'espree': {
    parse: (code: string) => espree.parse(code, { 
      ecmaVersion: 'latest',
      sourceType: 'module'
    }),
    description: 'ESLint parser',
    validate: (code: string) => {
      try {
        const ast = espree.parse(code, { ecmaVersion: 'latest' });
        return { nodes: ast.body.length };
      } catch (e) {
        return { error: true };
      }
    }
  },
  'meriyah': {
    parse: (code: string) => meriyahParse(code, { 
      module: true,
      next: true
    }),
    description: 'Fast ES parser',
    validate: (code: string) => {
      try {
        const ast = meriyahParse(code, { module: true });
        return { nodes: ast.body.length };
      } catch (e) {
        return { error: true };
      }
    }
  },
  'cherow': {
    parse: (code: string) => cherowParse(code, { 
      module: true,
      next: true
    }),
    description: 'Fast parser',
    validate: (code: string) => {
      try {
        const ast = cherowParse(code, { module: true });
        return { nodes: ast.body.length };
      } catch (e) {
        return { error: true };
      }
    }
  }
};

function runBenchmark(
  name: string, 
  parser: any, 
  testCase: TestCase, 
  iterations: number = 1000
): BenchmarkResult {
  const startMem = process.memoryUsage().heapUsed;
  
  for (let i = 0; i < 10; i++) {
    try {
      parser.parse(testCase.code);
    } catch (e) {
    }
  }

  let successful = 0;
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    try {
      parser.parse(testCase.code);
      successful++;
    } catch (e) {
    }
  }
  
  const end = performance.now();
  const endMem = process.memoryUsage().heapUsed;
  
  const timeMs = (end - start) / iterations;
  const opsPerSec = 1000 / timeMs;
  const memoryMB = (endMem - startMem) / 1024 / 1024;
  
  let accuracy = '';
  if (parser.validate) {
    const result = parser.validate(testCase.code);
    if (name.includes('fast-brake')) {
      accuracy = result.version || 'unknown';
    } else {
      accuracy = result.error ? 'parse error' : 'parsed';
    }
  }
  
  return {
    parser: name,
    method: parser.description,
    timeMs,
    opsPerSec,
    relativeSpeed: 1, // Will be calculated later
    accuracy,
    memoryMB: Math.max(0, memoryMB) // Avoid negative values
  };
}

function generateMarkdownTable(results: BenchmarkResult[]): string {
  let md = '| Parser | Method | Time (ms) | Ops/sec | Relative | Accuracy |\n';
  md += '|--------|--------|-----------|---------|----------|----------|\n';
  
  results.forEach(r => {
    md += `| ${r.parser} | ${r.method} | ${r.timeMs.toFixed(3)} | ${r.opsPerSec.toFixed(0)} | ${r.relativeSpeed.toFixed(1)}x | ${r.accuracy} |\n`;
  });
  
  return md;
}

function generateJSON(allResults: Map<string, BenchmarkResult[]>): string {
  const output: any = {
    timestamp: new Date().toISOString(),
    benchmarks: {}
  };
  
  allResults.forEach((results, testName) => {
    output.benchmarks[testName] = results.map(r => ({
      parser: r.parser,
      timeMs: parseFloat(r.timeMs.toFixed(3)),
      opsPerSec: Math.round(r.opsPerSec),
      relative: parseFloat(r.relativeSpeed.toFixed(1)),
      accuracy: r.accuracy
    }));
  });
  
  return JSON.stringify(output, null, 2);
}

async function main() {
  console.log(pc.bold(pc.cyan('\n🚀 Fast-Brake Benchmark Suite\n')));
  console.log(pc.gray('Comparing fast-brake against popular JavaScript parsers\n'));
  
  const testCases = loadTestCases();
  const allResults = new Map<string, BenchmarkResult[]>();
  
  for (const testCase of testCases) {
    console.log(pc.yellow(`\n📊 Testing: ${testCase.name} (${testCase.size} bytes)`));
    console.log(pc.gray('─'.repeat(60)));
    
    const results: BenchmarkResult[] = [];
    
    for (const [name, parser] of Object.entries(parsers)) {
      process.stdout.write(pc.gray(`  Running ${name}...`));
      
      try {
        const result = runBenchmark(name, parser, testCase);
        results.push(result);
        console.log(pc.green(' ✓'));
      } catch (e) {
        console.log(pc.red(' ✗ Failed'));
      }
    }
    
    const baseline = results.find(r => r.parser === 'fast-brake (pattern)')?.timeMs || 1;
    results.forEach(r => {
      r.relativeSpeed = baseline / r.timeMs;
    });
    
    results.sort((a, b) => b.opsPerSec - a.opsPerSec);
    
    const table = new Table({
      head: ['Parser', 'Time (ms)', 'Ops/sec', 'Relative', 'Accuracy'],
      style: { head: ['cyan'] }
    });
    
    results.forEach(r => {
      const speedIndicator = r.relativeSpeed >= 1 
        ? pc.green(`${r.relativeSpeed.toFixed(1)}x`)
        : pc.red(`${r.relativeSpeed.toFixed(1)}x`);
      
      table.push([
        r.parser,
        r.timeMs.toFixed(3),
        r.opsPerSec.toFixed(0),
        speedIndicator,
        r.accuracy || '-'
      ]);
    });
    
    console.log(table.toString());
    
    allResults.set(testCase.name, results);
  }
  
  console.log(pc.bold(pc.cyan('\n📈 Summary\n')));
  
  const fastBrakePatternAvg = Array.from(allResults.values())
    .map(results => results.find(r => r.parser === 'fast-brake (pattern)')?.opsPerSec || 0)
    .reduce((a, b) => a + b, 0) / allResults.size;
  
  const babelAvg = Array.from(allResults.values())
    .map(results => results.find(r => r.parser === '@babel/parser')?.opsPerSec || 0)
    .reduce((a, b) => a + b, 0) / allResults.size;
  
  console.log(pc.green(`✓ fast-brake (pattern): ${fastBrakePatternAvg.toFixed(0)} ops/sec average`));
  console.log(pc.yellow(`✓ @babel/parser: ${babelAvg.toFixed(0)} ops/sec average`));
  console.log(pc.bold(`✓ Speed advantage: ${(fastBrakePatternAvg / babelAvg).toFixed(1)}x faster\n`));
  
  console.log(pc.bold(pc.cyan('⚖️  Trade-offs\n')));
  console.log(pc.gray('fast-brake achieves its speed through:'));
  console.log(pc.gray('  • Pattern matching instead of full AST parsing'));
  console.log(pc.gray('  • Targeted feature detection vs complete syntax analysis'));
  console.log(pc.gray('  • Optimized tokenization for specific ES features'));
  console.log(pc.gray('  • Zero runtime dependencies\n'));
  
  console.log(pc.gray('This makes it ideal for:'));
  console.log(pc.gray('  ✓ Build-time compatibility checks'));
  console.log(pc.gray('  ✓ CI/CD validation'));
  console.log(pc.gray('  ✓ Quick ES version detection'));
  console.log(pc.gray('  ✓ Large codebases where speed matters\n'));
  
  console.log(pc.gray('Full parsers are better for:'));
  console.log(pc.gray('  • Code transformation'));
  console.log(pc.gray('  • Detailed syntax analysis'));
  console.log(pc.gray('  • Linting and formatting'));
  console.log(pc.gray('  • AST manipulation\n'));
  
  const resultsDir = join(__dirname, 'results');
  await Bun.write(
    join(resultsDir, 'benchmark-results.json'),
    generateJSON(allResults)
  );
  
  const firstTest = allResults.values().next().value;
  if (firstTest) {
    const markdown = generateMarkdownTable(firstTest);
    await Bun.write(
      join(resultsDir, 'benchmark-table.md'),
      `## Performance Comparison\n\n${markdown}\n\n*Benchmarked on ${new Date().toLocaleDateString()}*`
    );
  }
  
  console.log(pc.green('✓ Results saved to utils/benchmarker/results/\n'));
}

main().catch(console.error);