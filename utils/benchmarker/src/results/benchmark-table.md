## Performance Benchmarks

| Parser | Method | Time (ms) | Ops/sec | Relative |
|--------|--------|-----------|---------|----------|
| fast-brake | AST parser | 0.002 | 552,385 | **1x** |
| fast-brake (detect) | AST parser | 0.007 | 139,003 | 0.3x |
| fast-brake (es5 only) | AST parser | 0.016 | 64,194 | 0.1x |
| fast-brake (browserlist) | AST parser | 0.016 | 63,239 | 0.1x |
| cherow | Fast AST | 0.019 | 53,499 | 0.1x |
| fast-brake (es2015 only) | AST parser | 0.021 | 48,691 | 0.1x |
| meriyah | Fast AST | 0.021 | 47,350 | 0.1x |
| esprima | Standard AST | 0.026 | 37,952 | 0.1x |
| acorn | Lightweight AST | 0.054 | 18,598 | 0x |
| @babel/parser | Full AST | 0.059 | 16,919 | 0x |
| espree | ESLint AST | 0.064 | 15,720 | 0x |
