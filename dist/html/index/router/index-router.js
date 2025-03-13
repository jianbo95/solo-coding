(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _NodeModule = require(parentUrl,'../../../app/NodeModule.js');

var _easyRouter = require(parentUrl,'../../../app/core/easy-router.js');

var _easyRouter2 = _interopRequireDefault(_easyRouter);

var _routerManager = require(parentUrl,'../../../app/config/router-manager.js');

var _routerManager2 = _interopRequireDefault(_routerManager);

var _home = require(parentUrl,'@/html/index/module/home.vue');

var _home2 = _interopRequireDefault(_home);

var _ieTest = require(parentUrl,'@/module/test/ie/ie-test.vue');

var _ieTest2 = _interopRequireDefault(_ieTest);

function _interopRequireDefault(obj) { return { default: obj}; }

var pushRoute = _easyRouter2.default.pushRoute;

Vue.use(_NodeModule.Router);

// router config start

pushRoute('/test', _home2.default);

pushRoute('/', _ieTest2.default);
// router config end

_routerManager2.default.setRouterManager(_easyRouter2.default.getRouterManager());
exports = _routerManager2.default.router;
})('html/index/router/index-router.js'); exports; 