## Performance Comparison

| Parser | Method | Time (ms) | Ops/sec | Relative | Accuracy |
|--------|--------|-----------|---------|----------|----------|
| fast-brake (pattern) | Pattern matching + tokenization | 0.009 | 110842 | 1.0x | es5 |
| cherow | Fast parser | 0.016 | 62570 | 0.6x | parsed |
| meriyah | Fast ES parser | 0.016 | 61811 | 0.6x | parsed |
| esprima | ECMAScript parser | 0.023 | 42832 | 0.4x | parsed |
| fast-brake (all ES) | All ES versions plugin | 0.023 | 42711 | 0.4x | all versions |
| fast-brake (es2015 only) | Single ES2015 plugin | 0.024 | 42271 | 0.4x | es2015 check |
| fast-brake (es5 only) | Single ES5 plugin | 0.025 | 40463 | 0.4x | es5 check |
| acorn | Lightweight parser | 0.029 | 34661 | 0.3x | parsed |
| espree | ESLint parser | 0.034 | 29009 | 0.3x | parsed |
| @babel/parser | Full AST parser | 0.048 | 20776 | 0.2x | parsed |
| fast-brake (all + browser) | All ES + browserlist | 0.051 | 19499 | 0.2x | all + browser |
| fast-brake (full) | Full analysis mode | 0.056 | 17871 | 0.2x | es5 |


*Benchmarked on 8/22/2025*