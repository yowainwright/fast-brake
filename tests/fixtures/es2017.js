// ES2017 features
async function asyncFunction() {
  const result = await fetch("/api/data");
  return await result.json();
}

const asyncArrow = async () => await Promise.resolve();

class AsyncClass {
  async method() {
    await Promise.resolve();
  }
}

async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}

// Object static methods
const entries = Object.entries(obj);
const values = Object.values(obj);
const descriptors = Object.getOwnPropertyDescriptors(obj);

// String padding
const padded = str.padStart(10, "0");
const paddedEnd = str.padEnd(10, " ");

// Trailing commas in function parameters
function trailingComma(param1, param2, param3) {
  return param1 + param2 + param3;
}
