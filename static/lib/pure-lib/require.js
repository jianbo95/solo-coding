(function() {

var requireUrls = {};
var RequireCode = {};

var requireTool = {
    requestCode: function(url) {
        
        // 判断是否生产模式
        // 发布时可生成 Merge 加速加载
        if(window.CompileMode == 'prd') {
            // console.log('will from merge', url);
            if(Merge[url] != null) {
                // console.log('from merge', url);
                var code = Merge[url];
                return code;
            }
        }
        
        if(RequireCode[url] != null) {
            return RequireCode[url];
        }

        var responseText;
        // console.log('requestSync', url);
        CoreUtil.requestSync(url, function(xhr, content) {
            responseText = content;
        });

        if(responseText.indexOf('compileByJianbo') != -1) {
            // 已经编译过了
            RequireCode[url] = responseText;
            return responseText;
        }
        
        // 编译
        var startTime = new Date();
        var output = CoreUtil.babel(responseText);
        output = output;
    
        // 执行中，这时又有很多发起的请求，是基于这个请求发起的
        // 实际上就是递归，闭包并传入基于哪个url发起的试试！
        output = Tool.replaceAll(output, 'require\\(', 'require(parentUrl,');
        output = Tool.replaceAll(output, 'exports.default', 'exports');
        output = Tool.replaceEscapedChars(output, 
            'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }', 
            'function _interopRequireDefault(obj) { return { default: obj}; }'
        );
        
        // console.log('inject code url:' + url);
        var code = '(function(parentUrl) {\n' + output
    
        + '\n})(\''+url+'\'); exports; ';
    
        // console.log('-----------eval output-----------\n', code);
        // console.log('-----------eval output END -----------\n');
    
        RequireCode[url] = code;
        var endTime = new Date();
        console.log('编译时间：' + (endTime.getTime() - startTime.getTime()) + ' 毫秒' + url);
        logTime();

        return code;
    }
};

/**
 * 当前文件引用其它文件时，必须包含当前文件的路径，所以这个 parentUrl 其实就是 httpVuePlus2.js 自身的路径
 * httpVuePlus2.js 的路径应当是固定的
 * parentUrl 是 '../static/lib/pure/httpVuePlus2.js' compile/require.html 页面时
 * parentUrl 是 'static/lib/pure/httpVuePlus2.js' ie.html 页面时
 * 能否共用一个 parentUrl ? 不能，因为两个 html 页面请求的路径深度不一致
 * 
 *  (function(parentUrl) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _VueCodeWrap = require(parentUrl,'./VueCodeWrap.js');

var _VueCodeWrap2 = _interopRequireDefault(_VueCodeWrap);

var _Counter = require(parentUrl,'../../../app/util/Counter.js');

var _Counter2 = _interopRequireDefault(_Counter);

var _UrlParser = require(parentUrl,'./UrlParser.js');

var _UrlParser2 = _interopRequireDefault(_UrlParser);

......
exports = HttpVuePlus;
})('../static/lib/pure/httpVuePlus2.js'); exports;
 * 
 */
var require = function(parentUrl, url) {
    // console.log('require:parentUrl:' + parentUrl + 'url:' + url);

    if(url == null) {
        url = parentUrl;
        parentUrl = null;
    }

    // todo 通过pure实现动态
    var staticModule = {
        'vue': 'Vue',
		'vue-router': 'VueRouter',
		'element-ui': 'ELEMENT',
        'vuex': 'Vuex',
        'crypto-js': 'CryptoJS'
    };
    if(staticModule[url] != null) {
        return window[staticModule[url]];
    }

    // actualUrl: ./html/index/util/locales/en.js
    // parentUrl: html/index/util/i18n.js
    // lastUrl:./locales/en.js

    // actualUrl: ./html/index/apps/mine/mine-ai/html/index/apps/mine/mine-ai/mine-game-ai-v2/overlap-region-strategy.js
    // parentUrl: html/index/apps/mine/mine-ai/mine-game-ai-v2.js
    // lastUrl:/html/index/apps/mine/mine-ai/mine-game-ai-v2/overlap-region-strategy.js
    // 这里正确应该是 ./html/index/apps/mine/mine-ai/mine-game-ai-v2/overlap-region-strategy.js

    // var lastUrl = url;
    url = CoreUtil.actualUrl(url, parentUrl);
    // console.log('actualUrl: ' + url + '\nparentUrl: ' + parentUrl + '\nlastUrl:'+ lastUrl);
    
    if(url.indexOf('.vue') == url.length - 4) {
        // console.log('require vue', url);
        // console.log(window);
        return window.loader(url);
    }

    // 相同url只需要require一次
    if(requireUrls[url] != null) {
        return requireUrls[url];
    }

    // requireUrls[url] = true;

    // console.log('requestCode url: ' + url);
    var code = requireTool.requestCode(url);
    if('app/NodeModule.js' == url) {
        console.log(code);
    }

    var result;
    try {
        // console.log('code', code)
        result = eval(code); 
    } catch (e) {
        console.error(e);
        console.error('error from url = ' + url, code);
    }

    requireUrls[url] = result;
    // console.log('require', url);
    logTime();
    // console.log('require finish', requireUrls);

    return result;
    
};

window.require = require;
})();