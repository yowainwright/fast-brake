// ES2020 features
const obj = {
  prop: "value",
  nested: {
    deep: {
      value: 42,
    },
  },
};

// Optional chaining
const value = obj?.nested?.deep?.value;
const method = obj.method?.();
const array = obj?.[0];

// Nullish coalescing
const defaultValue = value ?? "default";
const combined = obj?.prop ?? "fallback";

// BigInt
const bigNumber = 123n;
const bigCalculation = bigNumber * 456n;

// Dynamic import
const module = await import("./module.js");

// Promise.allSettled
const results = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject("error"),
  Promise.resolve(3),
]);

// globalThis
globalThis.myGlobal = "value";

// String.matchAll
const matches = "test1test2".matchAll(/test(\d)/g);

// for-in mechanics
for (const match of matches) {
  console.log(match);
}
