#!/usr/bin/env bun
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

interface BenchmarkData {
  timestamp: string;
  benchmarks: {
    [testName: string]: BenchmarkResult[];
  };
}

// Generate simple array of benchmark objects
function generateSimpleTable(data: BenchmarkData): BenchmarkResult[] {
  // Use ES2015 (Modern) test as the default showcase
  const modernTest = data.benchmarks['ES2015 (Modern)'] || 
                     data.benchmarks[Object.keys(data.benchmarks)[0]];
  
  if (!modernTest) {
    throw new Error('No benchmark data found');
  }
  
  // Add method descriptions to each result
  return modernTest.map(result => ({
    parser: result.parser,
    method: getMethodDescription(result.parser),
    timeMs: parseFloat(result.timeMs.toFixed(3)),
    opsPerSec: Math.round(result.opsPerSec),
    relative: parseFloat(result.relative.toFixed(1)),
    accuracy: result.accuracy
  }));
}

// Generate markdown table from the simple array
function generateMarkdownTable(results: BenchmarkResult[]): string {
  let md = '## Performance Benchmarks\n\n';
  md += '| Parser | Method | Time (ms) | Ops/sec | Relative |\n';
  md += '|--------|--------|-----------|---------|----------|\n';
  
  results.forEach(r => {
    const relativeStr = r.relative >= 1 ? `**${r.relative}x**` : `${r.relative}x`;
    md += `| ${r.parser} | ${r.method} | ${r.timeMs} | ${r.opsPerSec.toLocaleString()} | ${relativeStr} |\n`;
  });
  
  return md;
}

// Helper to get method descriptions
function getMethodDescription(parser: string): string {
  const descriptions: { [key: string]: string } = {
    'fast-brake (pattern)': 'Pattern matching',
    'fast-brake (full)': 'Full analysis',
    '@babel/parser': 'Full AST',
    'acorn': 'Lightweight AST',
    'esprima': 'Standard AST',
    'espree': 'ESLint AST',
    'meriyah': 'Fast AST',
    'cherow': 'Fast AST'
  };
  
  return descriptions[parser] || 'AST parser';
}

// Main function
async function main() {
  console.log(pc.bold(pc.cyan('📊 Generating Benchmark Tables\n')));
  
  const resultsDir = join(__dirname, 'results');
  if (!existsSync(resultsDir)) {
    mkdirSync(resultsDir, { recursive: true });
  }
  
  // Check if benchmark results exist
  const resultsFile = join(resultsDir, 'benchmark-results.json');
  if (!existsSync(resultsFile)) {
    console.log(pc.red('❌ No benchmark results found!'));
    console.log(pc.yellow('   Run "bun run benchmark" first to generate results.\n'));
    process.exit(1);
  }
  
  // Load benchmark data
  const data: BenchmarkData = JSON.parse(readFileSync(resultsFile, 'utf-8'));
  
  // Generate simple array
  console.log(pc.gray('Generating benchmark table data...'));
  const tableData = generateSimpleTable(data);
  
  // Save as JSON
  writeFileSync(
    join(resultsDir, 'benchmark-table.json'), 
    JSON.stringify(tableData, null, 2)
  );
  console.log(pc.green('✓ JSON table generated'));
  
  // Save as JavaScript module
  const jsModule = `// Auto-generated benchmark data
export const benchmarkData = ${JSON.stringify(tableData, null, 2)};

export default benchmarkData;`;
  
  writeFileSync(join(resultsDir, 'benchmark-table.js'), jsModule);
  console.log(pc.green('✓ JS module generated'));
  
  // Save as TypeScript module
  const tsModule = `// Auto-generated benchmark data
export interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

export const benchmarkData: BenchmarkResult[] = ${JSON.stringify(tableData, null, 2)};

export default benchmarkData;`;
  
  writeFileSync(join(resultsDir, 'benchmark-table.ts'), tsModule);
  console.log(pc.green('✓ TS module generated'));
  
  // Generate markdown
  const markdown = generateMarkdownTable(tableData);
  writeFileSync(join(resultsDir, 'benchmark-table.md'), markdown);
  console.log(pc.green('✓ Markdown table generated'));
  
  console.log(pc.green('\n✅ All tables generated successfully!'));
  console.log(pc.gray('\nFiles created:'));
  console.log(pc.gray('  • results/benchmark-table.json (raw data)'));
  console.log(pc.gray('  • results/benchmark-table.js (JS module)'));
  console.log(pc.gray('  • results/benchmark-table.ts (TS module)'));
  console.log(pc.gray('  • results/benchmark-table.md (Markdown)'));
  
  // Display sample output
  console.log(pc.cyan('\n📋 Sample output:'));
  console.log(tableData.slice(0, 3));
}

main().catch(console.error);