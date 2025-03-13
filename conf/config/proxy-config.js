var server = "http://localhost:8080";
// var server = "http://10.31.11.13:7777";
var local = "http://localhost:97";

module.exports = {

    // '/api/editor': {
    //     target: local,
    //     changeOrigin: true,
    //     pathRewrite: {// upay-api 上下文已关闭
    //         '^/api/': '/' 
    //     }
    // },

    // 可注释选项，注释时走 smart-http-proxy 内置部分接口（目前仅支持读取和写入）
    '/index.php': {
        target: server,
        changeOrigin: true,
    },
    '/plugins': {
        target: local,
        changeOrigin: true,
        pathRewrite: {// upay-api 上下文已关闭
            '^/plugins': '/static/plugins' 
        }
    },
    '/api/authUser/getVerify': {
        target: server,
        changeOrigin: true,
        pathRewrite: {// upay-api 上下文已关闭
            '^/api': '/' 
        }
    },
    '/api/authUser/login': {
        target: server,
        changeOrigin: true,
        pathRewrite: {// upay-api 上下文已关闭
            '^/api': '/' 
        }
    },
    '/api/authUser/userInfo': {
        target: server,
        changeOrigin: true,
        pathRewrite: {// upay-api 上下文已关闭
            '^/api': '/' 
        }
    },
    '/api': {
        // target: 'http://10.13.1.235:8090',
        // target: 'http://localhost:9203',
        target: server,
        changeOrigin: true,
        pathRewrite: {// upay-api 上下文已关闭
            '^/api': '/' 
        }
    },
    '/api1.0': {
        target: 'http://localhost:9203',
        // target: 'http://10.20.88.128:9114',
        // target: 'http://10.13.1.58:9114',
        changeOrigin: true,
        pathRewrite: {// upay-api 上下文已关闭
            '^/api1.0': '/' 
        }
    },
    '/monitor': {
        target: 'http://localhost:9114',
        // target: 'http://10.20.88.128:9114',
        // target: 'http://10.13.1.58:9114',
        changeOrigin: true,
        pathRewrite: {// upay-api 上下文已关闭
        }
    },
    // http://10.20.88.106:4000/mock/23/payment-upay-console/checkAccount/bankQuery
    '/mock-api': {
        // target: 'http://localhost:9114',
        target: 'http://localhost:4000',
        changeOrigin: true,
        pathRewrite: {//代理地址重写
          '^/mock-api': '/mock/60/' 
        }
    },
};
