// require('./pre.js');
const tool = require('../../util/tool.js');
const Babel = require('../compile/babel.min.js');
const Uglify = require('../compile/terser.min.js');
const ejs = require('../compile/ejs.js');
const projectConfig = require('../../config/project-config.js');
const pageConfig = require('../../config/page-config.js');
const pageConfigUtil = require('../../../conf/function/page-config-util.js');
const apiConfig = require('../../../conf/pure/conf/api-config.js');
require('./pure-in-node.js');

console.log('apiConfig', apiConfig);

var pageConfigMap = {};
for(var i in pageConfig) {
    var item = pageConfig[i];
    var input = item.input;
    var requestUrl = input.replace('src/', '');
    pageConfigMap[requestUrl] = item;
}

const pageData = require("../../util/page-data.js");
const pageUtil = require('../../util/page-util');

// compileHtml html/test/test.html
var configs = pageUtil.getAbsoluteConfig();
// console.log(configs);return;

projectConfig.urls = [];
projectConfig.server = '';
projectConfig.mockConfig = '';
projectConfig.projectConfig = '';
projectConfig.proxyConfig = '';
projectConfig.pageData = pageData;
projectConfig.frontPath = "D:\\www\\jianbo_plus\\h5\\lowcode-front-v2";
projectConfig.version = new Date().getTime();

var path = tool.getRootPath();
var static = path + 'src/html/index/apps';
var files = tool.readFiles(static);
var data = {};
var routerCode = '';

for(var i in files) {
    var file = files[i];
    console.log('file', file);
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

// console.log(data);
// console.log(routerCode);
// return;

var compile = {
    options: {
        mergeJs: false,
        minifyJs: false,
        compileJs: true,
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
            var apiFile = path + 'dist' + api;
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
        
        var target = path + 'dist/' + relativePath;
        tool.writeFileBuffer(target, code);
    },
    compileHtml: function(file, fileType, relativePath, path, codeMap) {
        if(fileType != 'html') {
            return false;
        }
        
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
        tool.writeFileBuffer(path + 'dist/' + outputPath, code);
    },
    compileJs: function(file, fileType, relativePath, path, codeMap, mergeJs) {
        if(this.options.compileJs == false) {
            return false;
        }
        if(fileType != 'js') {
            return false;
        }
        // module 和 html 路径开头的不合并
        if(mergeJs == null) {
            mergeJs = true;
            if(relativePath.indexOf('module') == 0) {
                mergeJs = false;
            }
            if(relativePath.indexOf('html') == 0) {
                mergeJs = false;
            }
        }
        var code = tool.readFile(file);
        if(relativePath == 'html/index/router/index-router.js') {
            var start = '// router config start';
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
            // tool.writeFile(path + 'dist/' + relativePath, output);
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
    
        if(this.options.minifyJs == true) {
            output = Uglify.minify(output).code;
        }
        // console.log(output);
        if(this.options.mergeJs == true && mergeJs == true) {
            if(url.indexOf('.') != 0 && url.indexOf('/') != 0) {
                url = './' + url;
            }
            codeMap[url] = output;
        } else {
            tool.writeFile(path + 'dist/' + relativePath, output);
        }
        return true;
    },
    run() {
        this.cleanDist();
        this.handleApi();
        console.log('handleApi finish');
        this.handleSrc();
        console.log('handleSrc finish');
        // this.handleStatic();
        // console.log('handleStatic finish');
        // this.handleSite();
        // console.log('handleSite finish');
    },
    cleanDist() {
        var path = tool.getRootPath();
        tool.removeDir(path + 'dist');
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
            // console.log('writePath:', path + 'dist/static/' + relativePath);
            if(fileType == 'js' && relativePath.indexOf('static/lib/pure/') == 0) {
                var compileJs = this.compileJs(file, fileType, relativePath, path, codeMap, false);
                if(compileJs == true) {
                    continue;
                }
            }
            tool.writeFileBuffer(path + 'dist/' + relativePath, data);
            // const { execSync } = require('child_process');
            // execSync(`sleep 2000`);
        }

        // 输出codeMap
        if(this.options.mergeJs == true) {
            var result = 'LoadMerge(' + JSON.stringify(codeMap) + ')';
            // var resultPath = path + 'dist/merge.js';
            var resultPath = path + 'dist/static/pure-merge.js';
            tool.writeFile(resultPath, result);

            // var staticPath = path + 'static/pure-merge.js';
            // tool.writeFile(staticPath, result);
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
            // console.log('writeSitePath:', path + 'dist/static/' + relativePath);
            tool.writeFileBuffer(path + 'dist/static/' + relativePath, data);
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
            var relativePath = file.replace(src, '');
            var fileType = file.substring(file.lastIndexOf('.') + 1);
            if(file.indexOf('.') == -1) {
                continue;
            }
            // console.log('fileType', fileType);
            console.log(file);
            var compileJs = this.compileJs(file, fileType, relativePath, path, codeMap);
            if(compileJs == true) {
                continue;
            }
            var compileHtml = this.compileHtml(file, fileType, relativePath, path, codeMap);
            if(compileHtml == true) {
                continue;
            }

            this.copyFile(file, fileType, relativePath, path);
        }

        // 输出codeMap
        if(this.options.mergeJs == true) {
            var result = 'var Merge = ' + JSON.stringify(codeMap);
            // var resultPath = path + 'dist/merge.js';
            var resultPath = path + 'dist/static/merge.js';
            tool.writeFile(resultPath, result);

            // var staticPath = path + 'static/merge.js';
            // tool.writeFile(staticPath, result);
        }
    }
};

compile.run();