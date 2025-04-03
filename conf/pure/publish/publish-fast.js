// require('./pre.js');
const fs = require('fs'); 
const tool = require('../../util/tool.js');
const Babel = require('../compile/babel.min.js');
const Uglify = require('../compile/terser.min.js');
const ejs = require('../compile/ejs.js');
const projectConfig = require('../../config/project-config.js');
const pageConfig = require('../../config/page-config.js');
const pageConfigUtil = require('../../../conf/function/page-config-util.js');
const apiConfig = require('../../../conf/pure/conf/api-config.js');
require('./pure-in-node.js');
const pageData = require("../../util/page-data.js");
const pageUtil = require('../../util/page-util');
const getTimeVersion = require('./getVersion/getTimeVersion.js');

// console.log('apiConfig', apiConfig);
// compileHtml html/test/test.html
// var configs = pageUtil.getAbsoluteConfig();
// console.log(configs);return;

var compile = {
    pageConfigMap: null,
    lastVersion: null,
    currentVersion: null,
    diffVersion: null,
    compileFileSize: 0,
    skipFileSize: 0,

    mergeConfig: {
        // 路径匹配
        '/': []
    },

    options: {
        mergeJs: false,
        minifyJs: true,
        compileJs: true,
    },
    run() {
        this.initData();
        this.loadVersion();
        // this.handleApi();
        // console.log('handleApi finish');
        this.handleSrc();
        console.log('handleSrc finish');
        this.handleCache(); 
        console.log('handleCache finish');
        // this.handleStatic();
        // console.log('handleStatic finish');
        // this.handleSite();
        // console.log('handleSite finish');
        this.saveVersion();
        console.log('跳过文件数量', this.skipFileSize);
        console.log('编译文件数量', this.compileFileSize);
    },
    handleCache: function() {

    },
    initData: function() {
        var pageConfigMap = {};
        for(var i in pageConfig) {
            var item = pageConfig[i];
            var input = item.input;
            var requestUrl = input.replace('src/', '');
            pageConfigMap[requestUrl] = item;
        }
        this.pageConfigMap = pageConfigMap;

        projectConfig.urls = [];
        projectConfig.server = '';
        projectConfig.mockConfig = '';
        projectConfig.projectConfig = '';
        projectConfig.proxyConfig = '';
        projectConfig.pageData = pageData;
        projectConfig.frontPath = "D:\\www\\jianbo_plus\\h5\\lowcode-front-v2";
        projectConfig.version = new Date().getTime();
    },
    loadVersion: function() {
        var path = tool.getRootPath();
        this.lastVersion = {};
        var versionFile = path + 'cache/version.json';
        if (fs.existsSync(versionFile)) {
            var versionJson = tool.readFileBuffer(versionFile);
            this.lastVersion = JSON.parse(versionJson);
        }
        this.currentVersion = getTimeVersion();
        // console.log("上个版本", this.lastVersion);
        // console.log("当前版本", this.currentVersion);
        var diffVersion = {};
        for(var file in this.currentVersion) {
            var version = this.currentVersion[file];
            var lastVersion = this.lastVersion[file];
            if(lastVersion == version) {
                // 版本号相同，跳过
                continue;
            }
            diffVersion[file] = true;
        }
        // 需要编译的文件
        this.diffVersion = diffVersion;
        // 保存 this.currentVersion 到 cache/version.json
    },
    saveVersion: function() {
        var json = JSON.stringify(this.currentVersion, true, '    ');
        var path = tool.getRootPath();
        var versionFile = path + 'cache/version.json';
        tool.writeFile(versionFile, json);
    },
    handleApi: function() {
        // 遍历 apiConfig
        // 遍历 apiConfig
        for(var api in apiConfig) {
            var apiDefine = apiConfig[api];
            var path = tool.getRootPath();
            var jsFile = require( path +'conf/pure/conf/' + apiDefine );
            jsFile.run();
            var code = JavaApi.getData('code');
            var apiFile = path + 'cache' + api;
            tool.writeFileBuffer(apiFile, code);
        }
    },

    babelFlag: 0,
    babel: function(content) {
        var result;
        if(Babel.version.indexOf('7') == 0) {
            result = Babel.transform(content, { 
                presets: ["env"], 
                compact: false 
            });
        } else {
            result = Babel.transform(content, { 
                presets: ["es2015"], 
                compact: false 
            });
        }
        var output = result.code;
        if(this.babelFlag == 0) {
            // result.code = '';
            // console.log('result', result);
            // const { execSync } = require('child_process');
            // execSync(`sleep 2000`);
        }
        return output;
    },

    copyFile: function(file, fileType, relativePath, path) {
        var code = tool.readFileBuffer(file);
        
        var target = path + 'cache/' + relativePath;
        tool.writeFileBuffer(target, code);
    },
    compileHtml: function(file, fileType, relativePath, path, codeMap) {
        if(fileType != 'html') {
            return false;
        }
        var pageConfigMap = this.pageConfigMap;
        var pageConfig = pageConfigMap[relativePath];
        if(pageConfig == null) {
            pageConfig = pageConfigUtil.buildPageConfigByUrl('/' + relativePath);
        }

        var code = tool.readFileBuffer(file);
        // html 部署到根目录
        // 输出路径跟配置相关
        var outputPath = relativePath.substring(relativePath.lastIndexOf('/'));
        if(pageConfigMap[relativePath] != null) {
            outputPath = pageConfigMap[relativePath].output;
        }
        
        if(outputPath == '/ie.html') {
            // 读取ie-pure.html
            var purePath = path + 'static/lib/pure/html/ie-pure.html';
            var pureCode = tool.readFile(purePath);
            // console.log(pureCode);
            var mode = 'prd';
            if(this.options.mergeJs == false) {
                mode = 'dev';
            }
            var runCode = "\n<script>window.CompileMode = '"+mode+"';</script>\n";
            code = code + runCode + pureCode;
        } else if(outputPath == '/compile/require.html') {
            // 读取require-pure.html
            var purePath = path + 'static/lib/pure/html/require-pure.html';
            var pureCode = tool.readFile(purePath);
            // console.log(pureCode);
            var mode = 'prd';
            if(this.options.mergeJs == false) {
                mode = 'dev';
            }
            var runCode = "\n<script>window.CompileMode = '"+mode+"';"
                + "window.contextPath = '../';"
                + "</script>\n";
            code = code + runCode + pureCode;
        } else {
            // 迁移 fiter-html.js 的逻辑
            // 读取文件内容
            var requireConfig = pageConfigUtil.buildRequireConfig(pageConfig);
            projectConfig.root = requireConfig.root;
            projectConfig.entry = requireConfig.requireEntry;
            projectConfig.runMode = 'prd';

            if(this.options.mergeJs == false) {
                projectConfig.runMode = 'dev';
            }

            var purePath = path + 'static/lib/pure/tpl/require-js.html';
            var pureCode = tool.readFile(purePath);
            // 获取 root 
            code = code + pureCode;
        }
        code = code + ''; // buffer 转 string
        // ejs 渲染
        code = ejs.render(code, projectConfig, {
            escape: function(data) {
                return data;
            }
        });
        tool.writeFileBuffer(path + 'cache/' + outputPath, code);
    },
    compileJs: function(file, fileType, relativePath, path, codeMap, mergeJs) {
        if(this.options.compileJs == false) {
            return false;
        }
        if(fileType != 'js') {
            return false;
        }

        var code = tool.readFile(file);
        if(relativePath == 'html/index/router/index-router.js') {
            var start = '// router config start';
            var routerCode = this.buildRouter();
            code = code.replace(start, start + '\n' + routerCode);
        }
        var url = relativePath;
        // 增加filter功能
        // TODO 自动路由，自动游戏数据

        var output = this.babel(code);
        // TODO 这里有问题！！！ 跟 require.js 有差异！！！
        // console.log(filepath, newCode);
    
        // 执行中，这时又有很多发起的请求，是基于这个请求发起的
        // 实际上就是递归，闭包并传入基于哪个url发起的试试！
        if(Babel.version.indexOf('7') == 0) {
            // 7 这个版本，替换失败？
            output = output.replace("exports.default = void 0;", '');
            output = output.replace('exports["default"] = void 0;', '');
            output = output.replace("var _default = exports.default = {", 'exports.default = {');
            // output = output.replace("var _default = exports =", 'exports =');
            output = output.replace("var _default = exports.default", 'exports.default');
            // output = tool.replaceEscapedChars(output, 
            //     'function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }', 
            //     'function _interopRequireDefault(obj) { return { default: obj}; }'
            // );
            // output = output.replace('exports["default"]', 'exports');
            
            // output = tool.replaceAll(output, 'var _default = exports = {', 'exports = {',);
            // output = '/*Fuck*/'+output;
            // tool.writeFile(path + 'cache/' + relativePath, output);
            // return true;
        }
        output = tool.replaceAll(output, 'require\\(', 'require(parentUrl,');
        output = tool.replaceAll(output, 'exports.default', 'exports');
        output = tool.replaceEscapedChars(output, 
            'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }', 
            'function _interopRequireDefault(obj) { return { default: obj}; }'
        );
        output = tool.replaceEscapedChars(output, 
            'function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }', 
            'function _interopRequireDefault(obj) { return { default: obj}; }'
        );
        
        
        var flag = 'Flag("compileByJianbo");\n';
        flag += 'Flag("compileByPublish");\n'
        if(this.options.minifyJs == true) {
            flag += 'Flag("minify");\n'
        }
        output = '(function(parentUrl) {\n' 
        + flag
        + output
        + '\n})(\''+url+'\'); ';

        if(Babel.version.indexOf('7') == 0) {
            output += 'exports["default"];';
        } else {
            output += 'exports;';
        }

        const options = {
            output: {
                semicolons: true // 确保压缩后保留分号
            }
        };
    
        if(this.options.minifyJs == true) {
            output = Uglify.minify(output, options).code;
        }

        tool.writeFile(path + 'cache/' + relativePath, output);
        return true;
    },
    buildRouter() {
        var path = tool.getRootPath();
        var static = path + 'src/html/index/apps';
        var files = tool.readFiles(static);
        var data = {};
        var routerCode = '';

        for(var i in files) {
            var file = files[i];
            // console.log('file', file);
            if(file.indexOf('game.json') + 9 == file.length) {
                // .json 结尾
                continue;
            }
            if(file.indexOf('.json') + 5 == file.length) {
                // .json 结尾
                var json = tool.readFileBuffer(file);
                var gameData = JSON.parse(json);
                data[gameData.id] = gameData;

                var routerFile = file.substring(0, file.indexOf('.json')) + '.vue';
                // 自动路由
                // 判断 routerFile 是否存在
                if(tool.isFile(routerFile) == false) {
                    continue;
                }

                var path = tool.getRootPath();
                var src = path + 'src/';
                var relativePath = routerFile.replace(src, '');
                var id = gameData.id;
                var lineCode = 'import ' + id + ' from \'@/' + relativePath + '\';\n'
                    + "pushRoute('/game/"+ id +"', "+ id +");\n\n";
                routerCode += lineCode;
            }
        }
        return routerCode;
    },
    handleStatic() {
        var path = tool.getRootPath();
        var static = path + 'static/';
        var staticFiles = tool.readFiles(static);
        var codeMap = {};
        for(var i in staticFiles) {
            var file = staticFiles[i];
            var relativePath = 'static/' + file.replace(static, '');
            var fileType = file.substring(file.lastIndexOf('.') + 1);
            var data = tool.readFileBuffer(file);
            // console.log('writePath:', path + 'cache/static/' + relativePath);
            if(fileType == 'js' && relativePath.indexOf('static/lib/pure/') == 0) {
                var compileJs = this.compileJs(file, fileType, relativePath, path, codeMap, false);
                if(compileJs == true) {
                    continue;
                }
            }
            tool.writeFileBuffer(path + 'cache/' + relativePath, data);
            // const { execSync } = require('child_process');
            // execSync(`sleep 2000`);
        }
    },
    handleSite() {
        var path = tool.getRootPath();
        var static = path + 'statics/';
        var staticFiles = tool.readFiles(static);
        for(var i in staticFiles) {
            var file = staticFiles[i];
            var relativePath = file.replace(static, '');
            var data = tool.readFileBuffer(file);
            relativePath = relativePath.substring(relativePath.indexOf('/') + 1);
            // console.log('writeSitePath:', path + 'cache/static/' + relativePath);
            tool.writeFileBuffer(path + 'cache/static/' + relativePath, data);
        }
    },
    handleSrc() {
        var path = tool.getRootPath();
        // console.log('root', path);
        
        var src = path + 'src/';
        
        var files = tool.readFiles(src);
        // console.log(files);
        var codeMap = {};
        
        for(var i in files) {
            var file = files[i];
            // console.log('file', file);
            if(this.diffVersion[file] !== true) {
                this.skipFileSize ++;
                continue;
            } else {
                this.compileFileSize ++;
            }
            var relativePath = file.replace(src, '');
            var fileType = file.substring(file.lastIndexOf('.') + 1);
            if(file.indexOf('.') == -1) {
                continue;
            }
            // console.log('fileType', fileType);
            // console.log('File:' + file);
            if(fileType == 'js') {
                var compileJs = this.compileJs(file, fileType, relativePath, path, codeMap);
                if(compileJs == true) {
                    continue;
                }
            } else if(fileType == 'html') {
                var compileHtml = this.compileHtml(file, fileType, relativePath, path, codeMap);
                if(compileHtml == true) {
                    continue;
                }
            } 

            this.copyFile(file, fileType, relativePath, path);
        }
    }
};

compile.run();