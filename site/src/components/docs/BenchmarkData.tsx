import React from 'react';

interface BenchmarkResult {
  parser: string;
  method?: string;
  timeMs: number;
  opsPerSec: number;
  relative: number;
  accuracy?: string;
}

interface PluginResult {
  plugin: string;
  timeMs: number;
  opsPerSec: number;
  relativeToES5: number;
  featuresDetected: number;
  memoryMB: number;
}

const pluginComparisonData: PluginResult[] = [
  {
    plugin: "Telemetry Detection",
    timeMs: 0.202,
    opsPerSec: 4951,
    relativeToES5: 2.03,
    featuresDetected: 2,
    memoryMB: 0
  },
  {
    plugin: "Single ES5",
    timeMs: 0.41,
    opsPerSec: 2439,
    relativeToES5: 1,
    featuresDetected: 244,
    memoryMB: 2.92
  },
  {
    plugin: "All ES Versions",
    timeMs: 0.427,
    opsPerSec: 2343,
    relativeToES5: 0.96,
    featuresDetected: 244,
    memoryMB: 2.35
  },
  {
    plugin: "All + Browsers",
    timeMs: 0.665,
    opsPerSec: 1504,
    relativeToES5: 0.62,
    featuresDetected: 244,
    memoryMB: 3.48
  },
  {
    plugin: "Kitchen Sink",
    timeMs: 0.926,
    opsPerSec: 1080,
    relativeToES5: 0.44,
    featuresDetected: 246,
    memoryMB: 3.76
  }
];

const es5BenchmarkData: BenchmarkResult[] = [
  {
    parser: "fast-brake (pattern)",
    timeMs: 0.009,
    opsPerSec: 110842,
    relative: 1,
    accuracy: "es5"
  },
  {
    parser: "meriyah",
    timeMs: 0.016,
    opsPerSec: 61811,
    relative: 0.6,
    accuracy: "parsed"
  },
  {
    parser: "cherow",
    timeMs: 0.016,
    opsPerSec: 62570,
    relative: 0.6,
    accuracy: "parsed"
  },
  {
    parser: "esprima",
    timeMs: 0.023,
    opsPerSec: 42832,
    relative: 0.4,
    accuracy: "parsed"
  },
  {
    parser: "acorn",
    timeMs: 0.029,
    opsPerSec: 34661,
    relative: 0.3,
    accuracy: "parsed"
  },
  {
    parser: "@babel/parser",
    timeMs: 0.048,
    opsPerSec: 20776,
    relative: 0.2,
    accuracy: "parsed"
  },
  {
    parser: "fast-brake (full)",
    timeMs: 0.056,
    opsPerSec: 17871,
    relative: 0.2,
    accuracy: "es5"
  }
];

const es2015BenchmarkData: BenchmarkResult[] = [
  {
    parser: "fast-brake (pattern)",
    timeMs: 0.014,
    opsPerSec: 72812,
    relative: 1,
    accuracy: "es2015"
  },
  {
    parser: "meriyah",
    timeMs: 0.016,
    opsPerSec: 61003,
    relative: 0.8,
    accuracy: "parsed"
  },
  {
    parser: "cherow",
    timeMs: 0.018,
    opsPerSec: 54067,
    relative: 0.7,
    accuracy: "parsed"
  },
  {
    parser: "esprima",
    timeMs: 0.026,
    opsPerSec: 38320,
    relative: 0.5,
    accuracy: "parse error"
  },
  {
    parser: "@babel/parser",
    timeMs: 0.052,
    opsPerSec: 19152,
    relative: 0.3,
    accuracy: "parsed"
  },
  {
    parser: "fast-brake (full)",
    timeMs: 0.086,
    opsPerSec: 11606,
    relative: 0.2,
    accuracy: "es2015"
  }
];

function BenchmarkTable({ data, title }: { data: BenchmarkResult[], title: string }) {
  return (
    <div className="not-prose mb-8">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            <th className="text-left py-2">Parser</th>
            <th className="text-left py-2">Time (ms)</th>
            <th className="text-left py-2">Ops/sec</th>
            <th className="text-left py-2">Speed</th>
          </tr>
        </thead>
        <tbody>
          {data.map((result, idx) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2">
                <span className={result.parser.includes('fast-brake') ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}>
                  {result.parser}
                </span>
              </td>
              <td className="py-2">{result.timeMs.toFixed(3)}</td>
              <td className="py-2">{result.opsPerSec.toLocaleString()}</td>
              <td className="py-2">
                <span className={result.relative >= 1 ? 'font-semibold text-green-600 dark:text-green-400' : 'text-gray-500'}>
                  {result.relative.toFixed(1)}x
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PluginComparisonTable({ data }: { data: PluginResult[] }) {
  return (
    <div className="not-prose mb-8">
      <h3 className="text-lg font-semibold mb-4">Plugin Configuration Performance</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            <th className="text-left py-2">Plugin</th>
            <th className="text-left py-2">Time (ms)</th>
            <th className="text-left py-2">Ops/sec</th>
            <th className="text-left py-2">vs ES5</th>
            <th className="text-left py-2">Features</th>
          </tr>
        </thead>
        <tbody>
          {data.map((result, idx) => (
            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2">
                <span className={result.plugin.includes('Telemetry') ? 'font-semibold text-green-600 dark:text-green-400' : 
                               result.plugin.includes('Kitchen') ? 'text-orange-600 dark:text-orange-400' : ''}>
                  {result.plugin}
                </span>
              </td>
              <td className="py-2">{result.timeMs.toFixed(3)}</td>
              <td className="py-2">{result.opsPerSec.toLocaleString()}</td>
              <td className="py-2">
                <span className={result.relativeToES5 >= 1 ? 'font-semibold text-green-600 dark:text-green-400' : 'text-gray-500'}>
                  {result.relativeToES5.toFixed(2)}x
                </span>
              </td>
              <td className="py-2">{result.featuresDetected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BenchmarkData() {
  return (
    <div>
      <PluginComparisonTable data={pluginComparisonData} />
      <BenchmarkTable data={es5BenchmarkData} title="Parser Comparison - ES5 File" />
      <BenchmarkTable data={es2015BenchmarkData} title="Parser Comparison - ES2015 File" />
    </div>
  );
}

export default BenchmarkData;
