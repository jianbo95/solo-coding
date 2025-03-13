const mockConfig = require('../config/mock-config');
const proxyConfig = require('../config/proxy-config');
const commonConfig = require('../config/common-config');

console.log('mockConfig', mockConfig);

var buildProxy = function(api, dataUrl) {
    var target = 'http://localhost:' + commonConfig.port;
    var changeOrigin = true;
    var pathRewrite = {}; 
    pathRewrite['^' + api] = dataUrl;
    return {
        target: target, 
        changeOrigin: changeOrigin,
        pathRewrite: pathRewrite
    };
};

var proxyData = {};
for(var api in mockConfig) {
    var dataUrl = mockConfig[api];
    proxyData[api] = buildProxy(api, dataUrl);
}

for(var api in proxyConfig) {
    var config = proxyConfig[api];
    proxyData[api] = config;
}

console.log('proxyData', proxyData);

module.exports = proxyData;