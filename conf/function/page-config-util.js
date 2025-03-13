module.exports = {

    // 返回数据demo
    // 输入 '/html/index/index.html'
    // 输出 {
    //     name: 'index',
    //     entry: 'src/html/index/index.js',
    //     input: 'src/html/index/index.html',
    //     output: '/index.html', 
    // },
    buildPageConfigByUrl: function(url) {
        // 根据 / 进行字符串拆分  
        var parts = url.split('/');  

        // 确保路径有足够的部分  
        if (parts.length < 4) {  
            throw new Error("Invalid URL format.  " + url);  
        }  

        // 获取文件名（去掉 .html）  
        var name = parts[parts.length - 1].replace('.html', ''); // 文件名  
        var folder = parts.slice(1, parts.length - 1).join('/'); // 所有部分合并为路径  

        // 使用字符串拼接生成路径  
        var entry = 'src/' + folder + '/' + name + '.js';  // 入口文件路径  
        var input = 'src/' + folder + '/' + name + '.html'; // 输入 HTML 文件路径  
        var output = '/' + name + '.html'; // 输出路径  

        // 返回配置对象  
        return {  
            name: name,  
            entry: entry,  
            input: input,  
            output: output,  
        };  
    },
    
    buildRequireConfig: function(pageConfig) {

        var item = pageConfig;
        var jsEntry = item.entry;
        var output = item.output; // /compile/import.html
        if(output == null) {
            // output 路径默认根据input生成，为 / 加上文件名，文件名从 item.input 中提取
            var fileName = item.input.split('/').pop().replace('.html', '');
            output = '/' + fileName + '.html';
            item.output = output;
        }
        var level = this.pathLevel(output);
        if(jsEntry == null) {
            var htmlUrl = item.input;
            jsEntry = htmlUrl.substring(0, htmlUrl.lastIndexOf('/')) + '/' + item.name + '.js';
        }
        if(item.entry == null) {
            item.entry = jsEntry;
        }
        var pathRoot = this.pathRoot(level);
        jsEntry = jsEntry.replace('src/', '');
        item.requestJs = '/' +jsEntry;
        jsEntry = pathRoot + jsEntry;
        item.root = pathRoot;
        item.requireEntry = jsEntry;

        return item;
    },

    buildRequireConfigMap: function(pageConfigMap) {
        var map = {};
        for(var path in pageConfigMap) {
            var pageConfig = pageConfigMap[path];
            map[path] = this.buildRequireConfig(pageConfig);
        }
        return map;
    },
    // 路径级别
    pathLevel: function(url) {
        if(url == null) {
            return 1;
        }
        // 判断url有多少级，返回数字，/import.html 表示一级，/compile/import.html 表示二级路径
        return url.split('/').length - 1;
    },
    // 根据路径引入地址，返回相对根路径
    pathRootByUrl: function(url) {
        if(url == null) {
            return './';
        }
        var level = this.pathLevel(url);
        return this.pathRoot(level);
    },

    // 根据路径级别，返回根路径
    pathRoot: function(level) {
        if(level == '1') {
            return './';
        }
        var result = '';
        for(var i = 1; i < level; i++) {
            result += '../';
        }
        return result;
    }
};

