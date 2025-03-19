/*Fuck*/"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default =  0;
var _NodeModule = require("../NodeModule.js");
// 路由列表
var routeArr = [];
var router = null;
var routeMap = {};
var _default = exports.default = {
  pushRoute: function pushRoute(path, component) {
    // 路由数据
    routeArr.push({
      path: path,
      component: component
    });
    routeMap[path] = component;

    // 动态路由
    if (router != null) {
      router.addRoutes([{
        path: path,
        component: component
      }]);
    } else {
      // 静态路由
      // 调用 getRouter 时创建
    }
  },
  getRouter: function getRouter() {
    if (router != null) {
      return router;
    }
    router = new _NodeModule.Router();
    window.$router = router;
    for (var i = 0; i < routeArr.length; i++) {
      var route = routeArr[i];
      router.addRoutes([route]);
    }
    return router;
  },
  // 构建
  getRouterManager: function getRouterManager() {
    var router = this.getRouter();
    return {
      router: router,
      getRoutes: function getRoutes() {
        return routeArr;
      },
      getPage: function getPage(module) {
        return routeMap['/' + module].component;
      },
      add: function add(path, module) {
        // console.log('path', path, module);
        // 主页修复
        if (module == 'icon') {
          module = '';
        }
        var route = routeMap['/' + module];
        router.addRoutes([{
          path: path,
          name: route.name,
          component: route.component
        }]);
      },
      // 路由跳转
      push: function push(path) {
        router.push(path);
      }
    };
  }
};