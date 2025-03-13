console.log('is test js');
// 这里不会用相对路径啊！！！
var test2 = require('./test2.js');

var test5 = require('./test5.js');
console.log('test2', test2); // test2 也会变成 test5
console.log('test5', test5);