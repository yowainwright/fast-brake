const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

const intersection = setA.intersection(setB);
console.log(intersection);

const union = setA.union(setB);
console.log(union);

const difference = setA.difference(setB);
console.log(difference);

const symmetricDifference = setA.symmetricDifference(setB);
console.log(symmetricDifference);

const isSubset = setA.isSubsetOf(new Set([1, 2, 3, 4, 5, 6]));
console.log(isSubset);

const isSuperSet = setA.isSupersetOf(new Set([2, 3]));
console.log(isSuperSet);

const isDisjoint = setA.isDisjointFrom(new Set([7, 8, 9]));
console.log(isDisjoint);

const pattern = /(?<year>\d{4})-(?<month>\d{2})-(?<year>\d{2})/;
const match = '2025-03-15'.match(pattern);
console.log(match.groups);

const now = Temporal.Now.plainDateTimeISO();
console.log(now.toString());

const date = Temporal.PlainDate.from('2025-03-15');
const nextWeek = date.add({ weeks: 1 });
console.log(nextWeek.toString());