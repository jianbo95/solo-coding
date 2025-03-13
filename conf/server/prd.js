// 模拟生产环境运行
const express = require('express');
const proxyConfig = require('../config/proxy-config.js');
const commonConfig = require('../config/common-config.js');
const middle = require('http-proxy-middleware');
const proxy = middle.createProxyMiddleware;

var app = express();
// const path = require('path');
// var p = path.join(__dirname, "../../dict");
// console.log('__dirname', __dirname);
// console.log(p);

// app.use(express.static(p));
app.use(express.static('./dist'));

var initProxy = function(proxyConfig) {
    for(var _path in proxyConfig) {
        var config = proxyConfig[_path];
        app.use(_path, proxy(config));
    }
};

initProxy(proxyConfig);

var port = commonConfig.port;
app.listen(port, () => {
    console.log('App listening on ' + port + ' !')
});