const fs = require('fs'); 
const path = require('path');

module.exports = {
    // 替代全部
    replaceAll: function (data, str, target) {
        var exp = new RegExp(str, "gm")
        data = data.replace(exp, target);
        return data;
    },
    
    replaceEscapedChars: function(str, search, replacement) {
        // 对输入的搜索和替换字符串中的转义字符进行处理
        search = search.replace(/\\n/g, '\\n').replace(/\\r/g, '\\r').replace(/\\t/g, '\\t');
        replacement = replacement.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
    
        // 使用正则表达式和全局标志来替换所有匹配项
        var regex = new RegExp(search.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), 'g');
        return str.replace(regex, replacement);
    },
    getType: function(obj) {
        return Object.prototype.toString.call(obj);
    },
    isArray: function(obj) {
        return this.getType(obj) == '[object Array]' ;
    },
    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    merge: function(... arrs) {
        var arr3 = [];
        for(var j in arrs) {
            var arr = arrs[j];
            for(var i in arr) {
                arr3.push(arr[i]);
            }
        }
        return arr3;
    },
    log: function(title, config) {
        console.log('------- ' + title + ' config start ------');
        console.log(config);
        console.log('------- ' + title + ' config end ------');
    },
    rootType: null,
    setRootType: function(type) {
        this.rootType = type;
    },
    getRootPath: function() {
        var path = '../../package.json';
        if(this.rootType == 'vite') {
            path = './package.json';
        }
        return require.resolve(path)
            .replace('package.json', '')
            .replace(/\\/g, '/');
    },
    removeDir(dirPath) {
        // 判断路径是否存在
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            files.forEach((file) => {
                const curPath = dirPath + '/' + file;
                // 判断是否是目录，是则递归删除子目录
                if (fs.statSync(curPath).isDirectory()) {
                    this.removeDir(curPath);
                } else {
                    // 是文件则直接删除
                    fs.unlinkSync(curPath);
                }
            });
            // 删除空目录
            fs.rmdirSync(dirPath);
        }
    },
    writeFile(path, data) {
        var dir = path.substring(0, path.lastIndexOf('/'));
        this.mkdirpSync(dir);
        fs.writeFileSync(path, data, {encoding:'utf8', flag: 'w'});
    },
    writeFileBuffer(path, data) {
        var dir = path.substring(0, path.lastIndexOf('/'));
        this.mkdirpSync(dir);
        fs.writeFileSync(path, data, {flag: 'w'});
    },
    mkdirpSync(dirname) {
        if (fs.existsSync(dirname)) {
          return true;
        }
        if (this.mkdirpSync(path.dirname(dirname))) {
          fs.mkdirSync(dirname);
          return true;
        }
        return false;
    },
    readFileBuffer(src) {
        const data = fs.readFileSync(src); 
        return data;
    },
    readFile(src) {
        const data = fs.readFileSync(src, {encoding:'utf8', flag:'r'}); 
        return data;
    },
    readFiles (path, arr) {
        if(arr == null) {
            arr = [];
        }
        var filenames = fs.readdirSync(path);
        for(var i in filenames) {
            var filename = filenames[i];
    
            var file;
            if(path.lastIndexOf('/') == path.length - 1) {
                file = path + filename;
            } else {
                file = path + '/' + filename;
            }
            var stats = fs.statSync(file);
            if (stats.isFile()) {
                arr.push(file);
            } else {
                var files = this.readFiles(file);
                for(var j in files) {
                    arr.push(files[j]);
                }
            }
        }
        return arr;
    },
    sleep(second) {
        const { execSync } = require('child_process');
        execSync(`sleep ` + second);
    }
};