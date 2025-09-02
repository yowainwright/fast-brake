# LOC (Lines of Code) Extension

A fast-brake extension that enriches detected code patterns with precise location information.

## Overview

The LOC extension processes matched code patterns and provides detailed location information for accurate code navigation and analysis.

## How to Use

The extension works with fast-brake's detection system to enrich matched patterns with location data:

```typescript
import { FastBrake } from "fast-brake";
import { locExtension } from "fast-brake/extensions/loc";

const fastBrake = new FastBrake({
  extensions: [locExtension],
});

// When fast-brake detects patterns, the loc extension enriches them
const results = await fastBrake.detect(sourceCode);
```

## Features

### Location Information

- **Start Position**: Line and column where the match begins
- **End Position**: Line and column where the match ends
- **Offset**: Character position from the start of the code
- **Length**: Total character length of the match

## Input/Output Structure

### Input

```typescript
{
  code: string;        // Full source code
  result: {
    name: string;      // Name of the detected pattern
    match: string;     // The matched text
    spec: any;         // Additional specifications
    rule: string;      // Rule that triggered the match
    index?: number;    // Starting position of match
  }
}
```

### Output

```typescript
{
  name: string;
  match: string;
  spec: {
    loc: {
      start: { line: number; column: number };
      end: { line: number; column: number };
      offset: number;
      length: number;
    };
    // ... other spec properties preserved
  };
  rule: string;
  index?: number;
}
```

## Examples

### Example 1: Basic Usage with Fast-Brake

```typescript
import { FastBrake } from "fast-brake";
import { locExtension } from "fast-brake/extensions/loc";

const fastBrake = new FastBrake({
  extensions: [locExtension],
});

const sourceCode = `
class UserService {
  async getUser(id: string) {
    const user = await db.users.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}`;

// Fast-brake detects patterns and loc extension enriches them
const results = await fastBrake.detect(sourceCode);

// Example result with location information:
// {
//   name: "async-method",
//   match: "async getUser",
//   spec: {
//     loc: {
//       start: { line: 3, column: 2 },
//       end: { line: 3, column: 15 },
//       offset: 23,
//       length: 13
//     }
//   },
//   rule: "async-method-pattern"
// }
```

### Example 2: With Multiple Plugins and Extensions

```typescript
import { FastBrake } from "fast-brake";
import { locExtension } from "fast-brake/extensions/loc";
import { throwExtension } from "fast-brake/extensions/throw";
import { securityPlugin } from "@fast-brake/security-plugin";
import { performancePlugin } from "@fast-brake/performance-plugin";

const fastBrake = new FastBrake({
  extensions: [locExtension, throwExtension],
  plugins: [securityPlugin, performancePlugin],
});

const sourceCode = `
import { exec } from 'child_process';

function processUserInput(userInput: string) {
  // Security risk: command injection
  exec('echo ' + userInput, (error, stdout) => {
    if (error) {
      throw new Error('Command failed: ' + error.message);
    }
    console.log(stdout);
  });
  
  // Performance issue: synchronous file read
  const data = fs.readFileSync('./large-file.json');
  return JSON.parse(data);
}`;

const results = await fastBrake.detect(sourceCode);

// Results include both plugin detections and extension enrichments:
// [
//   {
//     name: "command-injection-risk",
//     match: "exec('echo ' + userInput",
//     spec: {
//       severity: "high",
//       vulnerability: "CWE-78",
//       loc: {
//         start: { line: 5, column: 2 },
//         end: { line: 5, column: 27 },
//         offset: 89,
//         length: 25
//       }
//     },
//     rule: "security-command-injection",
//     plugin: "security"
//   },
//   {
//     name: "throw-statement",
//     match: "throw new Error('Command failed: ' + error.message)",
//     spec: {
//       type: "error-throw",
//       errorType: "Error",
//       loc: {
//         start: { line: 7, column: 6 },
//         end: { line: 7, column: 59 },
//         offset: 156,
//         length: 53
//       }
//     },
//     rule: "throw-statement-pattern",
//     extension: "throw"
//   },
//   {
//     name: "sync-file-operation",
//     match: "fs.readFileSync('./large-file.json')",
//     spec: {
//       impact: "blocking",
//       alternative: "fs.readFile",
//       loc: {
//         start: { line: 13, column: 15 },
//         end: { line: 13, column: 52 },
//         offset: 312,
//         length: 37
//       }
//     },
//     rule: "performance-sync-operation",
//     plugin: "performance"
//   }
// ]
```

### Example 3: React Component Analysis

```typescript
import { FastBrake } from "fast-brake";
import { locExtension } from "fast-brake/extensions/loc";
import { reactPlugin } from "@fast-brake/react-plugin";

const fastBrake = new FastBrake({
  extensions: [locExtension],
  plugins: [reactPlugin],
});

const componentCode = `
import React, { useState, useEffect } from 'react';

export const TodoList = ({ userId }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTodos(userId).then(data => {
      setTodos(data);
      setLoading(false);
    });
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
};`;

const results = await fastBrake.detect(componentCode);

// Results with precise location for each React pattern:
// [
//   {
//     name: "react-hook",
//     match: "useState([])",
//     spec: {
//       hookType: "state",
//       initialValue: "array",
//       loc: {
//         start: { line: 4, column: 25 },
//         end: { line: 4, column: 37 },
//         offset: 115,
//         length: 12
//       }
//     },
//     rule: "react-hooks-pattern",
//     plugin: "react"
//   },
//   {
//     name: "react-hook",
//     match: "useEffect",
//     spec: {
//       hookType: "effect",
//       dependencies: ["userId"],
//       loc: {
//         start: { line: 7, column: 2 },
//         end: { line: 7, column: 11 },
//         offset: 181,
//         length: 9
//       }
//     },
//     rule: "react-hooks-pattern",
//     plugin: "react"
//   }
// ]
```

This location information enables:

- Precise error reporting with exact line/column positions
- IDE integration for jump-to-definition features
- Accurate code highlighting in analysis tools
- Source map generation for transformed code
