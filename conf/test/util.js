const fs = require('fs'); 
const tool = require('../util/tool.js');

var root = tool.getRootPath();

var filenames = fs.readdirSync(root + '/src/html');
console.log(filenames);

