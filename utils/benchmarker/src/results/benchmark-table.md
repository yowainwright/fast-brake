## Performance Comparison

| Parser                   | Method                    | Time (ms) | Ops/sec | Relative | Accuracy      |
| ------------------------ | ------------------------- | --------- | ------- | -------- | ------------- |
| fast-brake (browserlist) | Browserlist defaults      | 0.012     | 82914   | 1.4x     | browser check |
| fast-brake (es2015 only) | Single ES2015 plugin      | 0.014     | 71211   | 1.2x     | es2015 check  |
| fast-brake (detect)      | Detect minimum ES version | 0.014     | 69463   | 1.2x     | none          |
| meriyah                  | Fast ES parser            | 0.015     | 65792   | 1.1x     | parsed        |
| fast-brake               | Pattern matching          | 0.017     | 58301   | 1.0x     | none          |
| cherow                   | Fast parser               | 0.018     | 54614   | 0.9x     | parsed        |
| fast-brake (es5 only)    | Single ES5 plugin         | 0.022     | 46378   | 0.8x     | es5 check     |
| esprima                  | ECMAScript parser         | 0.024     | 41908   | 0.7x     | parsed        |
| acorn                    | Lightweight parser        | 0.026     | 37764   | 0.6x     | parsed        |
| espree                   | ESLint parser             | 0.034     | 29577   | 0.5x     | parsed        |
| @babel/parser            | Full AST parser           | 0.048     | 20939   | 0.4x     | parsed        |

_Benchmarked on 9/1/2025_
