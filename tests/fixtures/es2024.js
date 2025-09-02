const numbers = [1, 2, 3, 4, 5];

const asyncNumbers = Array.fromAsync(
  (async function* () {
    for (const n of numbers) {
      yield n * 2;
    }
  })(),
);

const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve("done"), 100);

const users = [
  { name: "Alice", age: 25, team: "red" },
  { name: "Bob", age: 30, team: "blue" },
  { name: "Charlie", age: 25, team: "red" },
  { name: "David", age: 30, team: "blue" },
];

const groupedByAge = Object.groupBy(users, (user) => user.age);
console.log(groupedByAge);

const mapData = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 1],
  ["d", 3],
]);

const groupedMap = Map.groupBy(mapData.entries(), ([key, value]) => value);

const pattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/v;
const match = "2024-03-15".match(pattern);
console.log(match.groups);

const text = "Hello 🌍 World";
const regex = /\p{Emoji}/v;
console.log(text.match(regex));
