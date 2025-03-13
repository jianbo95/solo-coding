const fs = require('fs');
const path = require('path');

var fileName = '../config/proxy-config.js';
var file = require.resolve(fileName);
var code = fs.readFileSync(file) + '';
const m = new module.constructor();

var getConfig = function() {
    var code2 = fs.readFileSync(file) + '';
    m._compile(code2, fileName) 
    var config = m.exports;
    return JSON.stringify(config);
}

var oldConfig = getConfig();

var watch = function(_call) {
    fs.watch(file, (e) => {
        var code2 = fs.readFileSync(file) + '';
        if(code != code2) {
            m._compile(code2, fileName) 
            var config = m.exports;
            // console.log('配置改变', config);
            var newConfig = JSON.stringify(config);
            if(newConfig != oldConfig) {
                // console.log('newConfig', newConfig);
                // console.log('oldConfig', oldConfig);
                _call(config);
            }
            oldConfig = newConfig;
        }
    });
};

module.exports = {
    watch(_call) {
        watch(_call);
    }
};
