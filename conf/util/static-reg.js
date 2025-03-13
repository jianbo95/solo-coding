const path = require('path');
const tool = require('./tool');

var getModulePath = function(module) {
    return require.resolve(module + '/package.json')
        .replace('package.json','');
}

var getRootPath = function() {
    return require.resolve('../../package.json')
        .replace('package.json', '')
        .replace(/\\/g, '/');
}

var parseFile = function(path) {
    var pos = path.indexOf('/');
    var module = path.substring(0, pos);
    var file = path.substring(pos + 1);
    var fileName = path.substring(path.lastIndexOf('/') + 1);
    // console.log('pos', pos)
    // console.log('file', file)
    // console.log('module = ' + module);
    var _modulePath = getModulePath(module);
    // console.log('modulePath', _modulePath);
    var fullPath = _modulePath + file;
    fullPath = fullPath.replace(/\\/g, '/');
    // console.log('fullPath', fullPath);
    return {
        fullPath: fullPath,
        dumpPath: module + '/' + fileName,
        fileName: fileName
    }
}
// var info = require.resolve('vue/package.json')
// console.log(info)
// console.log(path('vue'));



var base = 'dist/static/lib/';

module.exports = {
    reg(files) {
        var fromToList = [];
        var rootPath = getRootPath();
        for(var index in files) {
            var file = files[index];
            var fileInfo = parseFile(file);
            var fullPath = fileInfo.fullPath;

            // console.log('from', fullPath);
            // console.log('to', '../dist/static/lib/' + fileInfo.dumpPath);
            var fromTo = {
                from: fullPath,
                to: rootPath + base + fileInfo.dumpPath
            };
            // console.log(fromTo);
            fromToList.push(fromTo);
        }

        var custom = {
            // 复制项目中所用到的公告文件
            from: rootPath + 'static',
            to: rootPath + 'dist/static'
        };

        var ace = {
            from: rootPath + 'statics/ace',
            to: rootPath + 'dist/static'
        };
        
        // 开发模式增加mock数据接口
        const isDevMode = process.env.NODE_ENV !== 'production';
        if(isDevMode) {
            var mock = {
                from: rootPath + 'mock',
                to: rootPath + 'dist/mock'
            }
            fromToList.push(mock);
        }

        fromToList.push(custom);
        fromToList.push(ace);
        tool.log('静态文件引入', fromToList);
        return fromToList;
    }
}

// 引入测试
// const staticConfig = require('../config/static-config.js');
// module.exports.reg(staticConfig.files);