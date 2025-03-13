(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _routerBuilder = require(parentUrl,'@/app/core/router-builder');

var _routerBuilder2 = _interopRequireDefault(_routerBuilder);

var _test = require(parentUrl,'@/module/test/test.vue');

var _test2 = _interopRequireDefault(_test);

function _interopRequireDefault(obj) { return { default: obj}; }

var RouterManager = _routerBuilder2.default.build();
var pushRoute = RouterManager.pushRoute;

// 测试模块

pushRoute('/test', _test2.default);

pushRoute('/', _test2.default);

exports = RouterManager;
})('html/test/router/test-router-manager.js'); exports; 