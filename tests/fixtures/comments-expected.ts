const x = 1;

const y = 2;

function greet(name: string): string {
  return `Hello ${name}`;
}

function add(a: number, b: number): number {
  return a + b;
}

function process(items: string[]): string[] {
  return items.map((x) => x.toUpperCase());
}

const z = 3;

const str1 = "// not a comment";
const str2 = "/* also not a comment */";
const str3 = `// template literal comment`;

const urlValidator = /^https?:\/\//;

const regex1 = /test\/pattern/gi;
const regex2 = /\/\*/;

const division = a / b;
const divAssign = (a /= b);

function fetch(config: { url: string }): string {
  return config.url;
}

const obj = {
  key: "value",
  prop: 42,
};

const arrow = () => {
  return 1;
};
