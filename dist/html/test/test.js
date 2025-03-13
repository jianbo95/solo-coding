(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
'use strict';

var _NodeModule = require(parentUrl,'../../app/NodeModule');

var _App = require(parentUrl,'../../App.vue');

var _App2 = _interopRequireDefault(_App);

var _globalCmpt = require(parentUrl,'@/app/config/global-cmpt');

var _globalCmpt2 = _interopRequireDefault(_globalCmpt);

var _loadJs = require(parentUrl,'../../app/config/loadJs');

var _loadJs2 = _interopRequireDefault(_loadJs);

var _testRouterManager = require(parentUrl,'./router/test-router-manager');

var _testRouterManager2 = _interopRequireDefault(_testRouterManager);

function _interopRequireDefault(obj) { return { default: obj}; }

// import counter from '@/app/Counter.js';
console.log('test.js');

window.RouterManager = _testRouterManager2.default;

_NodeModule.Vue.use(_NodeModule.ElementUI); // ui库

var vue = new _NodeModule.Vue({
    el: '#app',
    router: _testRouterManager2.default.router,
    components: {
        'App': _App2.default
    },
    template: '<App/>'
});

window.vue = vue;
window.App = vue;

_globalCmpt2.default.log();
_loadJs2.default.init(vue);
})('html/test/test.js'); exports; 