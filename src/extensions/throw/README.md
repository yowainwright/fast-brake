# Throw Extension

A fast-brake extension that analyzes throw statements and error handling patterns in code.

## Overview

The Throw extension processes detected throw statements and error patterns, providing insights into error handling strategies, error types, and exception flow control.

## How to Use

The extension works with fast-brake's detection system to analyze error handling patterns:

```typescript
import { FastBrake } from "fast-brake";
import { throwExtension } from "fast-brake/extensions/throw";

const fastBrake = new FastBrake({
  extensions: [throwExtension],
});

// When fast-brake detects throw patterns, the extension enriches them
const results = await fastBrake.detect(sourceCode);
```

## Features

### Error Analysis

- **Type Detection**: Identifies the type of throw pattern (error-throw, promise-rejection, rethrow, conditional-throw)
- **Error Type**: Extracts the specific Error class being thrown (Error, TypeError, ValidationError, etc.)
- **Message Extraction**: Captures the error message from the throw statement
- **Async Context**: Detects if the throw occurs within an async function
- **Try-Catch Detection**: Identifies if the throw is within a try-catch block

## Input/Output Structure

### Input

```typescript
{
  code: string;        // Full source code
  result: {
    name: string;      // Name of the detected pattern
    match: string;     // The matched throw statement
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
    throw: {
      type: string;           // Type of throw pattern
      errorType?: string;     // Error class name
      message?: string;       // Error message
      isAsync?: boolean;      // In async context
      isCaught?: boolean;     // In try-catch block
    };
    // ... other spec properties preserved
  };
  rule: string;
  index?: number;
}
```

## Examples

### Example 1: API Error Handling

```typescript
import { FastBrake } from "fast-brake";
import { throwExtension } from "fast-brake/extensions/throw";

const fastBrake = new FastBrake({
  extensions: [throwExtension],
});

const apiCode = `
class APIClient {
  async fetchUser(id: string) {
    try {
      const response = await fetch(\`/api/users/\${id}\`);
      
      if (!response.ok) {
        throw new HTTPError(\`Failed to fetch user: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error; // Rethrow HTTP errors
      }
      throw new NetworkError('Network request failed');
    }
  }
}`;

const results = await fastBrake.detect(apiCode);

// Results include detailed throw analysis:
// [
//   {
//     name: "conditional-throw",
//     match: "throw new HTTPError(`Failed to fetch user: ${response.status}`)",
//     spec: {
//       throw: {
//         type: "error-throw",
//         errorType: "HTTPError",
//         message: "Failed to fetch user: ${response.status}",
//         isAsync: true,
//         isCaught: true
//       }
//     },
//     rule: "throw-pattern"
//   },
//   {
//     name: "error-rethrow",
//     match: "throw error",
//     spec: {
//       throw: {
//         type: "error-rethrow",
//         isAsync: true,
//         isCaught: false
//       }
//     },
//     rule: "rethrow-pattern"
//   },
//   {
//     name: "error-throw",
//     match: "throw new NetworkError('Network request failed')",
//     spec: {
//       throw: {
//         type: "error-throw",
//         errorType: "NetworkError",
//         message: "Network request failed",
//         isAsync: true,
//         isCaught: false
//       }
//     },
//     rule: "throw-pattern"
//   }
// ]
```

### Example 2: Validation with Multiple Extensions

```typescript
import { FastBrake } from "fast-brake";
import { throwExtension } from "fast-brake/extensions/throw";
import { locExtension } from "fast-brake/extensions/loc";
import { validationPlugin } from "@fast-brake/validation-plugin";

const fastBrake = new FastBrake({
  extensions: [throwExtension, locExtension],
  plugins: [validationPlugin],
});

const validationCode = `
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    throw new ValidationError('Email is required');
  }
  
  if (!emailRegex.test(email)) {
    throw new ValidationError(\`Invalid email format: \${email}\`);
  }
}

async function createUser(data: UserData) {
  try {
    validateEmail(data.email);
    validatePassword(data.password);
    
    const user = await db.users.create(data);
    return user;
  } catch (error) {
    if (error instanceof ValidationError) {
      return Promise.reject(error);
    }
    throw new Error('Failed to create user');
  }
}`;

const results = await fastBrake.detect(validationCode);

// Combined results from plugins and extensions:
// [
//   {
//     name: "validation-error",
//     match: "throw new ValidationError('Email is required')",
//     spec: {
//       validation: {
//         field: "email",
//         constraint: "required"
//       },
//       throw: {
//         type: "conditional-throw",
//         errorType: "ValidationError",
//         message: "Email is required",
//         isAsync: false,
//         isCaught: false
//       },
//       loc: {
//         start: { line: 5, column: 4 },
//         end: { line: 5, column: 53 },
//         offset: 102,
//         length: 49
//       }
//     },
//     rule: "validation-error-pattern"
//   },
//   {
//     name: "promise-rejection",
//     match: "Promise.reject(error)",
//     spec: {
//       throw: {
//         type: "promise-rejection",
//         isAsync: true,
//         isCaught: false
//       },
//       loc: {
//         start: { line: 22, column: 13 },
//         end: { line: 22, column: 34 },
//         offset: 512,
//         length: 21
//       }
//     },
//     rule: "promise-reject-pattern"
//   }
// ]
```

### Example 3: Express Error Middleware

```typescript
import { FastBrake } from "fast-brake";
import { throwExtension } from "fast-brake/extensions/throw";
import { expressPlugin } from "@fast-brake/express-plugin";

const fastBrake = new FastBrake({
  extensions: [throwExtension],
  plugins: [expressPlugin],
});

const middlewareCode = `
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AuthenticationError) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
      details: err.details
    });
  }
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Internal server error');
  } else {
    throw err; // Rethrow in development
  }
};

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }
    
    const user = await authenticate(email, password);
    res.json({ token: generateToken(user) });
  } catch (error) {
    next(error);
  }
});`;

const results = await fastBrake.detect(middlewareCode);

// Results with Express-specific context and throw analysis:
// [
//   {
//     name: "error-middleware-throw",
//     match: "throw new UnauthorizedError('Invalid credentials')",
//     spec: {
//       middleware: "error-handler",
//       throw: {
//         type: "conditional-throw",
//         errorType: "UnauthorizedError",
//         message: "Invalid credentials",
//         isAsync: false,
//         isCaught: false
//       }
//     },
//     rule: "express-error-pattern"
//   },
//   {
//     name: "error-rethrow",
//     match: "throw err",
//     spec: {
//       context: "development-only",
//       throw: {
//         type: "error-rethrow",
//         isAsync: false,
//         isCaught: false
//       }
//     },
//     rule: "rethrow-pattern"
//   },
//   {
//     name: "request-validation-error",
//     match: "throw new BadRequestError('Email and password are required')",
//     spec: {
//       route: "/login",
//       method: "POST",
//       throw: {
//         type: "conditional-throw",
//         errorType: "BadRequestError",
//         message: "Email and password are required",
//         isAsync: true,
//         isCaught: true
//       }
//     },
//     rule: "express-validation-pattern"
//   }
// ]
```

This throw information enables:

- Error flow analysis and optimization
- Detection of unhandled exceptions
- Identification of error handling patterns
- Static analysis for error recovery strategies
- Documentation of error types and messages
