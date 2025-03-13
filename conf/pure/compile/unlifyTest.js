var Uglify = require('./terser.min.js');

var code = "function add(first, second) { return first + second; }";

var result = Uglify.minify(code);
console.log(result);