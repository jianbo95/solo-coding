module.exports = function() { 
    // 1. 读取已有的代理配置文件
    var proxyConfig = require('@/conf/config/proxy-config.js');
    var pageConfig = require('@/conf/config/page-config.js');
    var pageConfigUtil = require('@/conf/function/page-config-util.js');

    var pageConfigMap = {};
    for(var i in pageConfig) {
        var item = pageConfig[i];
        var input = item.input;
        var requestUrl = input.replace('src', '');
        pageConfigMap[requestUrl] = item;
    }
    
    // console.log('pageConfigMap' + JSON.stringify(pageConfigMap, true, 2));
    
    // 2. 读取html文件并进行代理
    var filesJson = JavaApi.files('@/src/html');
    var files = JSON.parse(filesJson);
    var frontDir = System.frontDir;

    for(var i in files) {
        var file = files[i];

        if(file.indexOf('.html') + 5 == file.length()) {
            // .html 结尾
            // 获取相对路径
            var requestUrl = JavaApi.resourceToUrl(file)
            // console.log('requestUrl ' + requestUrl );
            if(pageConfigMap[requestUrl] == null) {
                var pageConfig = pageConfigUtil.buildPageConfigByUrl(requestUrl);
                var content = JavaApi.read(file);
                if(content.indexOf('run mode = require') != -1) {
                    pageConfig.mode = 'require';
                } else if(content.indexOf('run mode = import') != -1) {
                    pageConfig.mode = 'import';
                }
                pageConfigMap[requestUrl] = pageConfig;
            }
            // buildProxy(file, pageProxy);
        }
    }
    // console.log('pageConfigMap' + JSON.stringify(pageConfigMap , true, 2));
    // 得到完整版 pageConfigMap
    var requireConfigMap = pageConfigUtil.buildRequireConfigMap(pageConfigMap);
    console.log('requireConfigMap ' + JSON.stringify(requireConfigMap , true, 2));
    // JavaApi.pause();
    JavaApi.putGlobalData('requireConfigMap', JSON.stringify(requireConfigMap , true, 2));
    
    // 3. 当前服务地址
    var target = 'http://127.0.0.1:' + System.port;
    
    // 构建html页面的代理
    var buildProxy = function(file, pageProxy) {
        resourceUrl = file;
        
        var requestUrl = JavaApi.resourceToUrl(resourceUrl)
        // console.log('resourceUrl ' + resourceUrl);
        // console.log('requestUrl ' + requestUrl);

        var proxyUrl;

        if(pageConfigMap[requestUrl] != null) {
            // 如果在 page-config.js 已经配置了，则不需要生成
            proxyUrl = pageConfigMap[requestUrl].output;
        } else {
            proxyUrl = requestUrl.substring(requestUrl.lastIndexOf('/'), requestUrl.length);
            // throw new Error('requestUrl ' + requestUrl + ' is not in pageConfigMap.');
        }
        
        console.log("requestUrl " + requestUrl); // 实际请求地址 例如 /html/ie/ie.html
        console.log("proxyUrl " + proxyUrl); // http请求地址 /ie.html
        console.log("target " + target); // 服务端地址，例如 http://127.0.0.1:97 

        var pathRewrite = {};
        pathRewrite['^' + proxyUrl] = requestUrl;
        
        var proxy = {
            target: target,
            changeOrigin: true,
            pathRewrite: pathRewrite
        };
        pageProxy[proxyUrl] = proxy;
    };

    var pageProxy = {};
    for(var i in files) {
        var file = files[i];

        if(file.indexOf('.html') + 5 == file.length()) {
            // .html 结尾
            // 获取相对路径
            buildProxy(file, pageProxy);
        }
    }

    var urls = [];
    for(var key in pageProxy) {
        proxyConfig[key] = pageProxy[key];
        urls.push(key);
    }
    console.log('proxyConfig' + JSON.stringify(proxyConfig));
    console.log('put urls:' + JSON.stringify(urls));
    JavaApi.putGlobalData('urls', JSON.stringify(urls));

    return proxyConfig;
}();
