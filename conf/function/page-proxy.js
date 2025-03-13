const pageUtil = require('../util/page-util');

let config = {
    filterConfig () {
        var configs = pageUtil.getAbsoluteConfig();
        // console.log('vitePageConfig', configs);
        var filterConfig = [];
        for(var i in configs) {
            var config = configs[i];
            filterConfig.push( config );
        }
        return filterConfig;
    },

    pageProxy(port) {
        // demo
        // '/page/refresh.html': {
        //     target: 'http://localhost:9211',
        //     changeOrigin: true,
        //     pathRewrite: {
        //         '^/page/refresh.html': '/src/html/refresh/refresh.html' 
        //     }
        // },
        var proxyMap = {};
        var configs = this.filterConfig ();

        for(var i in configs) {
            var config = configs[i];
            var proxy = config.proxy; // 代理地址
            var input = config.input; // 输入文件地址

            var proxyUnit = {
                target: 'http://localhost:' + port,
                changeOrigin: true,
                pathRewrite: {}
            };

            proxyUnit.pathRewrite['^' + proxy] = input;
            proxyMap[proxy] = proxyUnit
        }

        console.log('pageProxy', proxyMap);

        return proxyMap;
    }
}

module.exports = config;