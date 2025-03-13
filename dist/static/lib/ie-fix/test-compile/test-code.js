console.log('is test js');
// 这里不会用相对路径啊！！！
import test2 from './test2.js';

import test5 from './test5.js';
console.log('test2', test2); // test2 也会变成 test5
console.log('test5', test5);