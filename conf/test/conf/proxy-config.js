module.exports = function() { 
    // 1. 读取已有的代理配置文件
    var proxyConfig = require('@/conf/config/proxy-config.js')
    return proxyConfig;
}();
