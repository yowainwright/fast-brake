// ES2022 features
class MyClass {
  // Private fields
  #privateField = "private";
  #privateMethod() {
    return this.#privateField;
  }

  // Public fields
  publicField = "public";

  // Static fields
  static staticField = "static";

  // Static block
  static {
    console.log("Static initialization block");
    this.staticField = "initialized";
  }

  // Private getter/setter
  get #private() {
    return this.#privateField;
  }

  set #private(value) {
    this.#privateField = value;
  }
}

// Array/String.at()
const arr = [1, 2, 3, 4, 5];
const last = arr.at(-1);
const secondLast = arr.at(-2);

const str = "hello";
const lastChar = str.at(-1);

// Object.hasOwn
if (Object.hasOwn(obj, "property")) {
  console.log("Has property");
}

// Error cause
try {
  throw new Error("Something failed", { cause: originalError });
} catch (error) {
  console.log(error.cause);
}

// Top-level await (in modules)
const data = await fetch("/api/data");
const json = await data.json();

// RegExp match indices - using 'd' flag (ES2022)
// Note: Some parsers don't support the 'd' flag yet
// const match = /test(\d+)/d.exec('test123');
// console.log(match.indices);
