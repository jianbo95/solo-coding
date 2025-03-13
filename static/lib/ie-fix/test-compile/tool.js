const fs = require('fs'); 
const path = require('path');

module.exports = {
    readFile(src) {
        var src = path.join(__dirname, src);
        const data = fs.readFileSync(src, {encoding:'utf8', flag:'r'}); 
        return data;
    }
}