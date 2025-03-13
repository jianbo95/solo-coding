const fs = require('fs');
const path = require('path');

var file = require.resolve('./change.js');
console.log(file);

// fs.watch(file, (event) => {
//     // console.log('change', event);
//     var context = fs.readFileSync(file);
//     console.log('save', eval(context) + '');
// });

const m = new module.constructor()
var context = fs.readFileSync(file) + ''; 
console.log('context', context )
var change = m._compile(context, './change.js') 
console.log('change', m.exports);