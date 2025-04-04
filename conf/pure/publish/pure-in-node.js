const tool = require('../../util/tool.js');

global.JavaApi = {
    require: function(path) {
        var code = JavaApi.read(path);
        try {
            var result = eval( code + 'module.exports;');
            return result;
        } catch (e) {
            console.error('执行JS代码失败:', path, e);
            return null;
        }
    },
    files: function(path) {
        var fs = require('fs');
        var root = tool.getRootPath();
        if(path[0] == '@') {
            path = path.replace('@/', root);
        }
        // 遍历path所有文件
        var files = tool.readFiles(path);        
        // console.log('path', path);
        // console.log('files', files);
        return JSON.stringify(files);
    },
    data: {},
    putData: function(key, data) {
        this.data[key] = data;
    },
    getData: function(key) {
        return this.data[key];
    },
    read: function(path) {
        // console.log('read path', path);
        var fs = require('fs');
        var root = tool.getRootPath();
        if(path[0] == '@') {
            path = path.replace('@', root);
        }
        var data = fs.readFileSync(path, {encoding:'utf8', flag:'r'});
        return data;
    },
    resourceToUrl: function(path) {
        var root = tool.getRootPath();
        path = path.replace(root + 'src', '');
        return path;
    },
};

global._require = JavaApi.require;