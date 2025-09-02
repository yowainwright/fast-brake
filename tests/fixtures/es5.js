// ES5 compatible code
function oldSchool() {
  var x = 10;
  var y = 20;
  return x + y;
}

var obj = {
  method: function () {
    return "hello";
  },
};

for (var i = 0; i < 10; i++) {
  console.log(i);
}

if (true) {
  var scoped = "not really";
}

function Constructor() {
  this.prop = "value";
}

Constructor.prototype.method = function () {
  return this.prop;
};

var arr = [1, 2, 3];
for (var j = 0; j < arr.length; j++) {
  console.log(arr[j]);
}
