import React, { useState } from 'react';

interface BenchmarkResult {
  parser: string;
  method?: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

const es5BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.010,
    "opsPerSec": 104991,
    "relative": 1.0,
    "accuracy": "es5"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.015,
    "opsPerSec": 68770,
    "relative": 0.7,
    "accuracy": "parsed"
  },
  {
    "parser": "cherow",
    "method": "Fast AST",
    "timeMs": 0.016,
    "opsPerSec": 60829,
    "relative": 0.6,
    "accuracy": "parsed"
  },
  {
    "parser": "esprima",
    "method": "Standard AST",
    "timeMs": 0.024,
    "opsPerSec": 42263,
    "relative": 0.4,
    "accuracy": "parsed"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.024,
    "opsPerSec": 40971,
    "relative": 0.4,
    "accuracy": "parsed"
  }
];

const es2015BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.013,
    "opsPerSec": 74883,
    "relative": 1.0,
    "accuracy": "es2015"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.016,
    "opsPerSec": 63671,
    "relative": 0.9,
    "accuracy": "parsed"
  },
  {
    "parser": "cherow",
    "method": "Fast AST",
    "timeMs": 0.016,
    "opsPerSec": 63665,
    "relative": 0.9,
    "accuracy": "parsed"
  },
  {
    "parser": "esprima",
    "method": "Standard AST",
    "timeMs": 0.026,
    "opsPerSec": 37768,
    "relative": 0.5,
    "accuracy": "parse error"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.037,
    "opsPerSec": 26842,
    "relative": 0.4,
    "accuracy": "parse error"
  }
];

const es2020BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.010,
    "opsPerSec": 99853,
    "relative": 1.0,
    "accuracy": "es2020"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.014,
    "opsPerSec": 71870,
    "relative": 0.7,
    "accuracy": "parsed"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.032,
    "opsPerSec": 30898,
    "relative": 0.3,
    "accuracy": "parsed"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.034,
    "opsPerSec": 29512,
    "relative": 0.3,
    "accuracy": "parse error"
  },
  {
    "parser": "espree",
    "method": "ESLint AST",
    "timeMs": 0.032,
    "opsPerSec": 31450,
    "relative": 0.3,
    "accuracy": "parse error"
  }
];

const es2022BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.018,
    "opsPerSec": 55760,
    "relative": 1.0,
    "accuracy": "es2022"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.017,
    "opsPerSec": 60343,
    "relative": 1.1,
    "accuracy": "parsed"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.031,
    "opsPerSec": 32162,
    "relative": 0.6,
    "accuracy": "parse error"
  },
  {
    "parser": "espree",
    "method": "ESLint AST",
    "timeMs": 0.039,
    "opsPerSec": 25361,
    "relative": 0.5,
    "accuracy": "parse error"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.046,
    "opsPerSec": 21553,
    "relative": 0.4,
    "accuracy": "parsed"
  }
];

const es2023BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.020,
    "opsPerSec": 50923,
    "relative": 1.0,
    "accuracy": "es2023"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.013,
    "opsPerSec": 75263,
    "relative": 1.5,
    "accuracy": "parsed"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.035,
    "opsPerSec": 28455,
    "relative": 0.6,
    "accuracy": "parsed"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.031,
    "opsPerSec": 32315,
    "relative": 0.6,
    "accuracy": "parse error"
  },
  {
    "parser": "espree",
    "method": "ESLint AST",
    "timeMs": 0.038,
    "opsPerSec": 26208,
    "relative": 0.5,
    "accuracy": "parse error"
  }
];

const es2024BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.014,
    "opsPerSec": 71428,
    "relative": 1.0,
    "accuracy": "es2024"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.012,
    "opsPerSec": 82333,
    "relative": 1.2,
    "accuracy": "parse error"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.038,
    "opsPerSec": 26316,
    "relative": 0.4,
    "accuracy": "parse error"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.033,
    "opsPerSec": 30303,
    "relative": 0.4,
    "accuracy": "parse error"
  },
  {
    "parser": "espree",
    "method": "ESLint AST",
    "timeMs": 0.041,
    "opsPerSec": 24390,
    "relative": 0.3,
    "accuracy": "parse error"
  }
];

const es2025BenchmarkData: BenchmarkResult[] = [
  {
    "parser": "fast-brake (pattern)",
    "method": "Pattern matching",
    "timeMs": 0.021,
    "opsPerSec": 47619,
    "relative": 1.0,
    "accuracy": "es2025"
  },
  {
    "parser": "meriyah",
    "method": "Fast AST",
    "timeMs": 0.014,
    "opsPerSec": 73669,
    "relative": 1.5,
    "accuracy": "parse error"
  },
  {
    "parser": "@babel/parser",
    "method": "Full AST",
    "timeMs": 0.041,
    "opsPerSec": 24156,
    "relative": 0.5,
    "accuracy": "parse error"
  },
  {
    "parser": "acorn",
    "method": "Lightweight AST",
    "timeMs": 0.035,
    "opsPerSec": 28571,
    "relative": 0.6,
    "accuracy": "parse error"
  },
  {
    "parser": "espree",
    "method": "ESLint AST",
    "timeMs": 0.043,
    "opsPerSec": 23256,
    "relative": 0.5,
    "accuracy": "parse error"
  }
];

export function BenchmarkTable() {
  const [selectedVersion, setSelectedVersion] = useState<'es5' | 'es2015' | 'es2020' | 'es2022' | 'es2023' | 'es2024' | 'es2025'>('es2015');
  
  const benchmarkData = {
    es5: es5BenchmarkData,
    es2015: es2015BenchmarkData,
    es2020: es2020BenchmarkData,
    es2022: es2022BenchmarkData,
    es2023: es2023BenchmarkData,
    es2024: es2024BenchmarkData,
    es2025: es2025BenchmarkData
  };
  
  const versionLabels = {
    es5: 'ES5 (Legacy)',
    es2015: 'ES2015 (ES6)',
    es2020: 'ES2020',
    es2022: 'ES2022',
    es2023: 'ES2023',
    es2024: 'ES2024',
    es2025: 'ES2025+'
  };
  
  const getSpeedBadgeStyle = (relative: number) => {
    const color = 
      relative >= 0.9 ? '#10b981' : // green
      relative >= 0.5 ? '#eab308' : // yellow
      relative >= 0.3 ? '#f97316' : // orange
      '#ef4444'; // red
    
    return {
      background: 'transparent',
      border: '1px solid',
      borderColor: color,
      color: color,
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block'
    };
  };
  
  const currentData = benchmarkData[selectedVersion];
  
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(benchmarkData) as Array<keyof typeof benchmarkData>).map((version) => (
          <button
            key={version}
            onClick={() => setSelectedVersion(version)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedVersion === version
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {versionLabels[version]}
          </button>
        ))}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3">Parser</th>
              <th className="px-6 py-3">Method</th>
              <th className="px-6 py-3">Time (ms)</th>
              <th className="px-6 py-3">Ops/sec</th>
              <th className="px-6 py-3">Speed</th>
            </tr>
          </thead>
          <tbody>
            {currentData.slice(0, 5).map((result, idx) => (
              <tr key={idx} className="border-b dark:border-gray-700">
                <td className="px-6 py-4 font-medium">
                  {result.parser.includes('fast-brake') && (
                    <span className="text-blue-600 dark:text-blue-400">
                      {result.parser}
                    </span>
                  )}
                  {!result.parser.includes('fast-brake') && result.parser}
                </td>
                <td className="px-6 py-4">{result.method}</td>
                <td className="px-6 py-4">{result.timeMs.toFixed(3)}</td>
                <td className="px-6 py-4">{result.opsPerSec.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span 
                    style={{
                      background: 'transparent',
                      border: `1px solid ${
                        result.relative >= 0.9 ? '#10b981' :
                        result.relative >= 0.5 ? '#eab308' :
                        result.relative >= 0.3 ? '#f97316' :
                        '#ef4444'
                      }`,
                      color: result.relative >= 0.9 ? '#10b981' :
                             result.relative >= 0.5 ? '#eab308' :
                             result.relative >= 0.3 ? '#f97316' :
                             '#ef4444',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}
                  >
                    {result.relative.toFixed(1)}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          *Benchmarked on 2025-08-22 with {versionLabels[selectedVersion]} test files on Apple M4
        </p>
      </div>
    </div>
  );
}

export default BenchmarkTable;
