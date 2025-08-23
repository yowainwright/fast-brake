import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { cn } from '../../lib/utils';

interface BenchmarkResult {
  parser: string;
  method: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

const benchmarkData: BenchmarkResult[] = [
  {
    "parser": "cherow",
    "method": "Fast AST",
    "timeMs": 0.016,
    "opsPerSec": 62821,
    "relative": 1,
    "accuracy": "parsed"
  },
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.017,
    "opsPerSec": 60008,
    "relative": 1,
    "accuracy": "es2015"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.017,
    "opsPerSec": 57816,
    "relative": 1,
    "accuracy": "parsed"
  },
  {
    "parser": "esprima",
    "method": "Standard AST",
    "timeMs": 0.025,
    "opsPerSec": 40234,
    "relative": 0.7,
    "accuracy": "parse error"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.04,
    "opsPerSec": 25163,
    "relative": 0.4,
    "accuracy": "parse error"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.052,
    "opsPerSec": 19365,
    "relative": 0.3,
    "accuracy": "parsed"
  },
  {
    "parser": "espree",
    "method": "ESLint AST",
    "timeMs": 0.054,
    "opsPerSec": 18350,
    "relative": 0.3,
    "accuracy": "parse error"
  },
  {
    "parser": "fast-brake (full)",
    "method": "Full analysis",
    "timeMs": 0.077,
    "opsPerSec": 12922,
    "relative": 0.2,
    "accuracy": "es2015"
  }
];

export function BenchmarkDataTable() {
  const getSpeedColor = (relative: number) => {
    if (relative >= 0.8) return 'text-green-500';
    if (relative >= 0.5) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getSpeedBadge = (relative: number) => {
    if (relative >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (relative >= 0.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  return (
    <div className="xl:flex gap-8 lg:gap-12">
      <div className="flex-1">
        <Table>
          <TableCaption>
            *Benchmarked on 8/22/2025 with ES2015 test files. All tests run on identical hardware with warm cache.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Parser</TableHead>
              <TableHead className="font-semibold">Method</TableHead>
              <TableHead className="font-semibold text-right">Time (ms)</TableHead>
              <TableHead className="font-semibold text-right">Ops/sec</TableHead>
              <TableHead className="font-semibold text-center">Speed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benchmarkData.map((result, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">
                  <span className={cn(
                    result.parser.includes('fast-brake') && 'text-orange-600 dark:text-orange-400 font-semibold'
                  )}>
                    {result.parser}
                  </span>
                </TableCell>
                <TableCell className="text-base-content/80">{result.method}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {result.timeMs.toFixed(3)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {result.opsPerSec.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    getSpeedBadge(result.relative)
                  )}>
                    {result.relative >= 1 ? `${result.relative.toFixed(1)}x` : `${result.relative.toFixed(1)}x`}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="xl:max-w-md mt-8 xl:mt-0">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4 font-outfit">
              Built for <span className="bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, rgba(255, 69, 0, 1) 2%, rgba(255, 140, 0, 1) 55%, rgba(255, 165, 0, 1) 100%)', WebkitBackgroundClip: 'text'}}>
                Real-World Speed
              </span>
            </h3>
            <p className="text-base text-base-content/80 leading-relaxed">
              Fast Brake uses intelligent pattern matching to detect ES features across 11 different JavaScript versions
              (ES5-ES2025). Unlike simple parsers that only validate syntax, Fast Brake identifies which specific 
              ES version your code requires, making it perfect for compatibility checking.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Version-Aware Detection</h4>
                <p className="text-sm text-base-content/70">
                  Tests 150+ ES features across ES5, ES2015-ES2025 versions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Zero Dependencies</h4>
                <p className="text-sm text-base-content/70">
                  Lightweight and fast with no runtime dependencies to slow you down
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Production Ready</h4>
                <p className="text-sm text-base-content/70">
                  Tested across diverse codebases in CI/CD pipelines and build tools
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-base-content/60">
              Perfect for build tools, bundlers, and CI/CD pipelines where speed matters. 
              Use traditional AST parsers for code transformation and detailed analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BenchmarkDataTable;