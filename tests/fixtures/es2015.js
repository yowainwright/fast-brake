// ES2015 features
const arrow = () => console.log("arrow function");

class MyClass extends BaseClass {
  constructor(name) {
    super();
    this.name = name;
  }

  method() {
    return `Hello ${this.name}`;
  }
}

let x = 10;
const y = 20;

const template = `Template literal with ${x}`;

const [a, b, ...rest] = [1, 2, 3, 4, 5];
const {
  prop,
  nested: { value },
} = obj;

function defaultParams(x = 10, y = 20) {
  return x + y;
}

for (const item of items) {
  console.log(item);
}

const spread = [...arr1, ...arr2];

function* generator() {
  yield 1;
  yield 2;
}

const symbol = Symbol("key");
const map = new Map();
const set = new Set();

import { something } from "./module";
export default MyClass;
