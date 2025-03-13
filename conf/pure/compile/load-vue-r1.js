module.exports = {
    compile: function(code, pageConfig) {
        var lines = code.split('\n');
        for (var i = 0; i < lines.length; i++) {
            lines[i] = this.loadLine(lines[i], pageConfig);
        }
        code = lines.join('\n');
        return code;
    },
    loadLine: function(originLine, pageConfig) {
        var line = originLine.trim();

        if(line.startsWith('//')) {
            return originLine;
        }

        if(line.indexOf('import') !== -1 && line.indexOf('from') !== -1) {
            return this.loadImport(line, pageConfig);
        }
        return line;
    },
    loadImport: function (line, pageConfig) {
        console.log('pageConfig.requestJs ' + pageConfig.requestJs);
        // 获取旧的 HTML 路径和新的 HTML 路径  
        var oldHtml = pageConfig.requestJs; // 例如: /html/compile/import/import.js  
        var newHtml = pageConfig.output; // 例如: /compile/import.html  
    
        // 去掉末尾的分号（如果存在）  
        line = line.trim().replace(/;$/, '');
    
        // 使用正则表达式提取模块的名称和路径  
        var match = line.match(/import\s+(\w+|\{[\w\s,]+\})\s+from\s+['"]([^'"]+)['"]/);
    
        if (match) {
            var moduleName = match[1]; // 模块名称  
            var modulePath = match[2]; // 模块路径  
    
            // 路径迁移逻辑  
            console.log('modulePath' + modulePath);
            console.log('oldHtml'+ oldHtml);
            console.log('newHtml'+ newHtml);
            var adjustedPath = this.calculateRelativePath(modulePath, oldHtml, newHtml);
    
            // 检查调整后的路径是否以 '.vue' 结尾  
            if (this.endsWithPolyfill(adjustedPath, '.vue')) {
                return 'const ' + moduleName + ' = loader(\'' + adjustedPath + '\');';
            } else {
                return 'import ' + moduleName + ' from \'' + adjustedPath + '\';';
            }
        }
    
        return line;
    },
    
    calculateRelativePath: function (modulePath, oldHtml, newHtml) {
        // 解析旧HTML的目录部分
        var oldHtmlParts = oldHtml.split('/').filter(function(p) { return p !== ''; });
        if (oldHtmlParts.length > 0) {
            var lastOldPart = oldHtmlParts[oldHtmlParts.length - 1];
            if (lastOldPart.indexOf('.') !== -1) { // 移除文件名
                oldHtmlParts.pop();
            }
        }
    
        // 将模块路径解析为绝对路径（基于旧HTML目录）
        var moduleParts = modulePath.split('/').filter(function(p) { return p !== ''; });
        var resolvedModuleParts = oldHtmlParts.slice();
        for (var i = 0; i < moduleParts.length; i++) {
            var part = moduleParts[i];
            if (part === '.') {
                continue;
            } else if (part === '..') {
                if (resolvedModuleParts.length > 0) {
                    resolvedModuleParts.pop();
                }
            } else {
                resolvedModuleParts.push(part);
            }
        }
    
        // 解析新HTML的目录部分
        var newHtmlParts = newHtml.split('/').filter(function(p) { return p !== ''; });
        if (newHtmlParts.length > 0) {
            var lastNewPart = newHtmlParts[newHtmlParts.length - 1];
            if (lastNewPart.indexOf('.') !== -1) { // 移除文件名
                newHtmlParts.pop();
            }
        }
    
        // 计算共同前缀
        var commonLength = 0;
        while (commonLength < newHtmlParts.length &&
               commonLength < resolvedModuleParts.length &&
               newHtmlParts[commonLength] === resolvedModuleParts[commonLength]) {
            commonLength++;
        }
    
        // 计算回退层级和目标路径部分
        var upLevels = newHtmlParts.length - commonLength;
        var downParts = resolvedModuleParts.slice(commonLength);
    
        // 构建相对路径
        var relativeParts = [];
        for (var j = 0; j < upLevels; j++) {
            relativeParts.push('..');
        }
        relativeParts = relativeParts.concat(downParts);
    
        var relativePath = relativeParts.join('/');
    
        // 确保相对路径正确添加./前缀
        if (relativePath && !relativePath.startsWith('.') && !relativePath.startsWith('/') &&
            !relativePath.startsWith('http:') && !relativePath.startsWith('https:')) {
            relativePath = './' + relativePath;
        }
    
        return relativePath;
    },
    
    endsWithPolyfill: function(str, search) {
        var thisLen = str.length;
        return str.substring(thisLen - search.length, thisLen) === search;
    }
};


const loadVue = module.exports;

var pageConfig = {
    requestJs: '/html/compile/import/import.js', // 原始引入路径是这个
    output: '/compile/import.html',
};
var result1 = loadVue.loadImport("import { Vue } from '../../../app/NodeModule.js';", pageConfig);
// 预期输出路径是 import { Vue } from '../app/NodeModule.js';
// 实际结果正常

pageConfig = {
    requestJs: '/html/compile/import/import.js',
    output: '/compile/import.html',
};
var result2 = loadVue.loadImport("import Router from './router/import-router.js'';", pageConfig);
// 预期输出路径是 import Router from '../html/compile/import/router/import-router.js'
// 实际结果正常

pageConfig = {
    requestJs: '/main.js', // 原始引入路径是这个，可以看成是 main.html
    output: '/index.html', // 修改引入路径是这个
};
var result3 = loadVue.loadImport("import store from './app/data/Store.js'", pageConfig);
// 预期结果是 import store from './app/data/Store.js'
// 实际结果是 import store from 'app/data/Store.js' 
// 请修复代码

