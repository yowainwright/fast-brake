#!/usr/bin/env node
const numbers = [1, 2, 3, 4, 5];

const lastEven = numbers.findLast((n) => n % 2 === 0);
console.log(lastEven);

const lastEvenIndex = numbers.findLastIndex((n) => n % 2 === 0);
console.log(lastEvenIndex);

const reversed = numbers.toReversed();
console.log(reversed);

const sorted = [5, 3, 1, 4, 2].toSorted();
console.log(sorted);

const spliced = numbers.toSpliced(2, 1, 99);
console.log(spliced);

const updated = numbers.with(2, 100);
console.log(updated);

const items = ["apple", "banana", "cherry"];
items.toReversed().forEach((item) => {
  console.log(item);
});

const scores = [89, 45, 67, 23, 90];
const highScores = scores.toSorted((a, b) => b - a);
console.log(highScores);
