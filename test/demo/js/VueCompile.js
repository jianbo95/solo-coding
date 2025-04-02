var vue =  require('../../../static/lib/vue/vue.js')
// var happyDom = require('./happy-dom2.js');
var linkDom = require('./worker.min.js');
var parseHTML = linkDom.parseHTML;
const { window, document } = parseHTML('<div></div>');
global.document = document;

// 读取 ./login.vue 的内容
// vue.compileToString('<div>HelloWorld</div>');


// 读取 ./login.vue 的内容
const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'login.vue');
const loginContent = fs.readFileSync(loginPath, 'utf-8');

const compiled = vue.compileToString(loginContent);
// var result2 = vue.stringToFunction(result)();
// const code1 = result.render;
var createFunction = vue.stringToFunction;
 // 在 Vue 的编译过程中，模板（template）会被编译成字符串形式的渲染函数代码。为了让这些代码能够在运行时被执行，需要将它们转换为 JavaScript 函数。这段代码就是完成这个转换过程的关键部分。
 var res = {};
 var fnGenErrors = [];
 res.render = createFunction(compiled.render, fnGenErrors);
 res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
   return createFunction(code, fnGenErrors)
 });

console.log(res);
// 可以用 compiled-home.vue 替代 home.vue ，理论上减少了编译，性能会有所提升
