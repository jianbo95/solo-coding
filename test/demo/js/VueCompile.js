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

const result = vue.compileToString(loginContent);
const code1 = result.render;

// const Uglify = require('../compile/terser.min.js');
const Uglify = require('../../../conf/pure/compile/terser.min.js');

const options = {
    output: {
        semicolons: true // 确保压缩后保留分号
    }
};

console.log(code1);
let output = Uglify.minify(code1, options).code;

console.log(output);