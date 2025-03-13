const { port } = require('../config/common-config');
const proxyData = require('../util/proxy-data');
const pageUtil = require('../util/page-util');
const viteConfig = require('./vite-config');
const viteInjectData = require('./vite-inject-data');

let config = {
    buildConfig(proxy) {
        return {
            target: proxy.target,
            changeOrigin: proxy.changeOrigin,
            pathRewrite: proxy.pathRewrite,
            rewrite(path) {
                var rewriteConfig = proxy.pathRewrite;
                for(var key in rewriteConfig) {
                    var target = rewriteConfig[key];
                    path = path.replace(new RegExp(key), target );
                }
                return path;
            }
        }
    },
    getProxy() {
        var configs = {};
        for(var key in proxyData) {
            var proxy = proxyData[key];
            var config = this.buildConfig(proxy);
            configs[key] = config;
        }

        var pageConfig = this.pageProxy();
        for(var key in pageConfig) {
            var proxy = pageConfig[key];
            var config = this.buildConfig(proxy);
            configs[key] = config;
        }
        return configs;
    },
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
    getPage() {
        var configs = this.filterConfig ();
        var page = {};
        for(var i in configs) {
            var config = configs[i];
            page[config.name] = {
                entry: config.entry,
                template: config.input,
            };
        }
        console.log('getPage', page);
        var data = viteConfig.get(this.pageProxy());

        viteInjectData.inject(page, data);

        return page;
    },
    pageProxy() {
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