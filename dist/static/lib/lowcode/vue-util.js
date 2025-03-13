/**
  * VueUtil
  * Jianbo
  * @license MIT
  */
 (function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueUtil = factory());
}(this, (function () { 'use strict';

var VueUtil = {
    deleteRoute() {
        var routerManager = RouterManager.routerManager;
        var routes = routerManager.getRoutes();
        // 传入当前router
        var router = new NodeModule.Router({
        }); 
        router.addRoutes(routes);
        // 用初始化的matcher替换当前router的matcher
        window.$router.matcher = router.matcher 
        // 删除路由后，组件注册也全都删除了？
    },
    clearCache(originUrl) {
        if(vueCache[originUrl] != null) {
            vueCache[originUrl] = null;
        }
    },
    refreshRoute() {
        // console.log(window.vue.$route);
        var routePath = window.vue.$route.path;

        this.deleteRoute();

        var param = Util.currentHash();

        param.url = routePath;

        window.$router.push({
            path: '/refresh-route',
            query: param
        });

        Core.waitRef(window, 'RefreshRoute', () => {
            window.RefreshRoute.route();
        });
    },

    routeMap: null,
    initRouteData() {
        if(this.routeMap != null) {
            return;
        }
        var routerManager = RouterManager.routerManager;
        var routes = routerManager.getRoutes();
        this.routeMap = {};
        for (let i = 0; i < routes.length; i++) {
            const item = routes[i];
            this.routeMap[item.path] = item;
        }

    },
    loadRouteInfo() {
        this.initRouteData();
        var routePath = window.vue.$route.path;
        var routeInfo = this.routeMap[routePath];
        if(routeInfo == null) {
            return;
        }
        // console.log('routeInfo', routeInfo, this.routeMap);
        var url = routeInfo.component.url;
        var info = {};
        info.originUrl = url;
        // console.log('item', item.component.url);
        var xhr = window.loader.UrlMap[url];
        // console.log(xhr);
        var httpUrl = xhr.responseURL;
        info.requestUrl = httpUrl.replace(location.origin, '');
        info.fullPath = Conf.frontPath + '/src' + info.requestUrl;
        info.code = xhr.responseText;
        return info;
    },
    buildVueFile(parseInfo) {
        var nodes = parseInfo.nodes;
        var code = '';
        for (let i = 0; i < nodes.length; i++) {
            const element = nodes[i];
            code += element.code;
        }
        return code;
    },
    parseVueFile(vueCode) {
        let $html = $(vueCode);
        // console.log($html);
        let parseInfo = {};
        let nodes = [];

        for (let i = 0; i < $html.length; i++) {
            const node = $html[i];
            // console.log(node.nodeName, node.nodeType);
            var parseNode = {};
            if(node.nodeType == '1') {
                parseNode.code = node.outerHTML;
            } else if(node.nodeType == '3') {
                parseNode.code = node.data;
            }
            parseNode.nodeType = node.nodeType;
            nodes.push(parseNode);
            // console.log(node.outerHTML);
            
            if(node.nodeName == 'TEMPLATE') {
                parseInfo.template = parseNode;
            } else if(node.nodeName == 'SCRIPT') {
                parseInfo.script = parseNode;
            } else if(node.nodeName == 'STYLE') {
                parseInfo.style = parseNode;
            }
        }
        parseInfo.nodes = nodes;
        return parseInfo;
    }
}

return VueUtil;

})));