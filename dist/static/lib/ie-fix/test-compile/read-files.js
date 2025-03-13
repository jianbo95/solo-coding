const fs = require('fs'); 
const path = require('path');

var src = path.join(__dirname, '../../');

console.log(src);

var readFiles = function(path, arr) {
    if(arr == null) {
        arr = [];
    }
    var filenames = fs.readdirSync(path);
    for(var i in filenames) {
        var filename = filenames[i];

        var file;
        if(path.lastIndexOf('\\') == path.length - 1) {
            file = path + filename;
        } else {
            file = path + '\\' + filename;
        }
        var stats = fs.statSync(file);
        if (stats.isFile()) {
            arr.push(file);
        } else {
            var files = readFiles(file);
            for(var j in files) {
                arr.push(files[j]);
            }
        }
    }
    return arr;
};

console.log(readFiles(src));
