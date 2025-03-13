var Babel = require('../babel.min.js');
// console.log(babel);

var tool = require('./tool.js');
// console.log(tool);

var code = tool.readFile('./test-code.js');
// console.log(code);

var babel = function(content) {
    var output = Babel.transform(content, { presets: ['es2015'] }).code;
    return output;
};

var newCode = babel(code);
console.log(newCode);

