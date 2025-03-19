const tool = require('../../util/tool.js');

// var output = '****var _default = exports = {***';
// output = tool.replaceAll(output, 'var _default = exports = {', 'exports = {');
// console.log('output', output);

// output = '****exports.default =  0;****';
// output = tool.replaceAll(output, 'exports.default =  0;', '');
// console.log('output', output);
var path = tool.getRootPath();
var output = tool.readFile(path + '/conf/pure/publish/easy-router.js');

if(output.indexOf('exports.default =  0;') != -1) {
    console.log('exist Fuck');
}