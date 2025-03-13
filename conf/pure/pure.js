// pure模式运行
process.env.NODE_ENV = 'pure';

// TODO 减少依赖模块
const express = require('express');
const ejs = require('ejs');
const middle = require('http-proxy-middleware');

const fs = require('fs'); 
const path = require('path');
const commonConfig = require('../config/common-config.js');
const viteUtil = require('../vite/vite-util.js');
const projectConfig = require('../config/project-config.js');
const proxy = middle.createProxyMiddleware;
const PureEdit = require('./pure-edit.js');

var pageProxy = viteUtil.getProxy();
var app = express();
projectConfig.devMode = 'pure';

var src = path.join(__dirname, '../../src/');
app.set('views', src);
app.set('view engine', 'html' );
app.set('view options', {
    escape(data) {
        return data;
    }
})
app.engine( '.html', ejs.__express );

let readFile = (url) => {
    var src = path.join(__dirname, '../../' + url);
    const data = fs.readFileSync(src, {encoding:'utf8', flag:'r'}); 
    return data;
};

// html页面增加渲染
app.get('/html*.html', (req, res) => {
    var requestUrl = req.originalUrl;
    console.log('requestUrl', requestUrl);
    res.render(requestUrl.substring(1), projectConfig, (error, html) => {
        if(requestUrl == '/html/index/index.html') {
            const indexPlus = readFile('/static/lib/pure/index-pure.html');
            res.send(html + indexPlus);
        } else {
            res.send(html);
        }
    });
});

// 导入外部依赖统一通过 NodeModule 导入
app.use('/app/NodeModule.js', (req, res) => {
    var code = `
const Vue = window.Vue;
const Vuex = window.Vuex;
const ElementUI = window.ELEMENT;
const Router = window.VueRouter;
const axios = window.axios;
const qs = {};
const CryptoJS = window.CryptoJS;
console.log('CryptoJS', CryptoJS);
export {
    Vue, Vuex, ElementUI, Router, axios, CryptoJS, qs
};
    `;
    res.set('Content-Type','application/javascript');
    res.send(code);
});

let responseFile = (req, res, handle) => {
    var requestUrl = req.originalUrl;
    // 读取文件内容
    var src = path.join(__dirname, '../../src' + requestUrl);
    const data = fs.readFileSync(src, {encoding:'utf8', flag:'r'}); 
    handle(data, (response) => {
        res.set('Content-Type','application/javascript');
        res.send(response);
    });
};

// 加载vue转loader
app.use('/app/config/global-cmpt.js', (req, res) => {
    responseFile(req, res, (data, call) => {
        let newCode = PureEdit.editGlobalCmpt(data);
        console.log('newCode', newCode);
        call(newCode);
    });
});

// 加载vue转loader
app.use('/html/index/router/index-router-manager.js', (req, res) => {
    responseFile(req, res, (data, call) => {
        let newCode = PureEdit.editRouterManager(data);
        console.log('newCode', newCode);
        call(newCode);
    });
});

// let responseStatic = (req, res, handle) => {
//     var requestUrl = req.originalUrl;
//     // 读取文件内容
//     var src = path.join(__dirname, '../../' + requestUrl);
//     const data = fs.readFileSync(src, {encoding:'utf8', flag:'r'}); 
//     handle(data, (response) => {
//         res.set('Content-Type','application/javascript');
//         res.send(response);
//     });
// };

// app.use('/static/lib/vue/vue.js', (req, res) => {
//     responseStatic(req, res, (data, call) => {
//         call(data + 'export default window.Vue;');
//     });
// });

// app.use('/static/lib/vue/vue.min.js', (req, res) => {
//     responseStatic(req, res, (data, call) => {
//         call(data + 'export default window.Vue;');
//     });
// });

// app.use('/static/lib/vuex/vuex.js', (req, res) => {
//     responseStatic(req, res, (data, call) => {
//         call(data + 'export default window.Vuex;');
//     });
// });

// app.use('/static/lib/vue-router/vue-router.min.js', (req, res) => {
//     responseStatic(req, res, (data, call) => {
//         call(data + 'export default window.VueRouter;');
//     });
// });

// app.use('/static/lib/element-ui/index.js', (req, res) => {
//     responseStatic(req, res, (data, call) => {
//         call(data + '\n export default window.ELEMENT;');
//     });
// });

// 加载页面路由
// 建议页面路由放在API路由之前
// app.use('/', router);

// 加载静态资源
app.use(express.static('./src'));
app.use('/static', express.static('./static'));

var initProxy = function(proxyConfig) {
    for(var _path in proxyConfig) {
        var config = proxyConfig[_path];
        app.use(_path, proxy(config));
    }
};

// initProxy(proxyConfig);

for(var i in pageProxy) {
    const proxy = pageProxy[i];
    const pathRewrite = proxy.pathRewrite;
    for(let path in pathRewrite) {
        let rewrite = pathRewrite[path];
        if(rewrite.indexOf('src/') == 0) {
            rewrite = rewrite.substring(4);
            pathRewrite[path] = rewrite;
        }
    }
    
    console.log('setProxy' , proxy);
}

initProxy(pageProxy);

// app.use('/index.html', proxy({
//     target: 'http://localhost:99',
//     changeOrigin: true,
//     pathRewrite: {
//         '^/index.html': '/html/index/index.html' 
//     }
// }));

var port = commonConfig.port;
app.listen(port, () => {
    console.log('App listening on ' + port + ' !')
});