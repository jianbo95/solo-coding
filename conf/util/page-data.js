const tool = require("../util/tool");
const fs = require('fs'); 
const config = require('../config/page-config');

var map = {};
for(var i in config) {
    map[config[i].name] = config[i];
}

var root = tool.getRootPath();
var filenames = fs.readdirSync(root + '/src/html');
for(var i in filenames) {
    var name = filenames[i];
    
    // 仅vite模式启动存在 nav.html 页面
    if(tool.rootType != 'vite') {
        if(name == 'nav' ||
            name == 'doc') {
            continue;
        }
    }

    var base = 'src/html/' + name + '/';
    var maybeExist = base + name + '.html';
    // console.log('maybeExist ' + maybeExist);
    if(fs.existsSync(maybeExist) == true) {
        
        if(map[name] == null) {
            config.push({
                name: name,
                input: maybeExist
            })
        }
    }

    var secondFilenames = fs.readdirSync(root + '/' +base);
    // console.log('secondFilenames', secondFilenames);
    for(var j in secondFilenames) {
        var secondName = secondFilenames[j];
        var secondBase = 'src/html/' + name + '/' + secondName + '/';
        var secondMaybeExist = secondBase + secondName + '.html';
        if(fs.existsSync(secondMaybeExist) == true) {
            // console.log(secondMaybeExist);
            if(map[name] == null) {
                config.push({
                    name: secondName,
                    input: secondMaybeExist
                })
            }
        }
    }
}

tool.log('page', config);

module.exports = config;
