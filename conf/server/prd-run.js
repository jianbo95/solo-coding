const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require("webpack-hot-middleware")
const webpackConfig = require('../webpack.prd.js');
const proxyConfig = require('../config/proxy-config.js');
const expressBuilder = require('../util/express-builder.js');
const webpack = require('webpack');
const express = require('express');
const middle = require('http-proxy-middleware');
const path = require('path')
const commonConfig = require('../config/common-config')
var http = require('http');
var tool = require('../util/tool')

const proxy = middle.createProxyMiddleware;

var app = expressBuilder();

// if(tool.isArray(webpackConfig.entry)) {
//     webpackConfig.entry.push('webpack-hot-middleware/client?noInfo=true&reload=true');
// } else {
//     webpackConfig.entry['client'] = ('webpack-hot-middleware/client?noInfo=true&reload=true');
// }

for(var k in webpackConfig.plugins) {
    var plugin = webpackConfig.plugins[k];
    var pluginName = plugin.constructor.name;
    if(pluginName == 'HtmlWebpackPlugin') {
        console.log('plugin', plugin);
        plugin.options.chunks.push('client');
    }
}
// webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
webpackConfig.output.publicPath = './'; // 同时控制两种情况？
webpackConfig.cache = true;
webpackConfig.devServer = {}

const compiler = webpack(webpackConfig);
app.use(
    webpackDevMiddleware(compiler, {
        // webpack-dev-middleware options
        publicPath: '/',
        writeToDisk: true
    })
);
// var hotMiddleware = webpackHotMiddleware(compiler,{
//     log: false,
//     heartbeat: 2000,
// })
// app.use(hotMiddleware);

// 动态加载测试
// app.use('/test', (req, res) => {
//     app.use('/test2', (req, res) => {
//         res.send("test2");
//     });
//     res.send('success');
// });

var initProxy = function(proxyConfig) {
    for(var _path in proxyConfig) {
        var config = proxyConfig[_path];
        app.use(_path, proxy(config));
    }
};

initProxy(proxyConfig);

var resetProxy = function(proxyConfig) {
    for(var _path in proxyConfig) {
        var config = proxyConfig[_path];
        app.delete(_path);
        app.use(_path, proxy(config));
    }
    app.close(() => {
        app.listen();
    });
};

// 监听proxy文件 TODO 删除旧的所有代理
var watcher = require('../util/watch-proxy');
watcher.watch((config) => {
    console.log('代理重设', config);
    resetProxy(config);
});

var port = commonConfig.port;
app.listen(port);
