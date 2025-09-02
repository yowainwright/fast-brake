// Test file with ES features in strings/comments that should NOT be detected

var es5Code = "This is ES5 compatible";

// This comment contains => arrow function syntax but shouldn't be detected
var str1 = "This string contains => arrow syntax";
var str2 = "Template literal syntax `${value}` in a string";

/*
 * Multi-line comment with various ES features:
 * const x = 10;
 * let y = 20;
 * async function test() { await promise; }
 * class MyClass {}
 */

var regex = /=>/; // Regex containing arrow syntax
var regex2 = new RegExp("async\\s+function");

var obj = {
  async: "This is just a property name",
  await: "Another property",
  class: function () {
    return "Not a class keyword";
  },
};

// Edge cases
var str3 = "Optional chaining ?. in a string";
var str4 = "Nullish coalescing ?? operator";
var str5 = "BigInt literal 123n";

var templateInString = "String with `backticks` but not a template";
var code =
  'console.log("This looks like code but it is a string with const x = 10")';

// This function is ES5 compatible despite the strings
function checkStrings() {
  var messages = [
    "User typed: const x = =>",
    "Error: Unexpected token '??'",
    "Pattern: /\\basync\\s/",
  ];

  for (var i = 0; i < messages.length; i++) {
    console.log(messages[i]);
  }
}
