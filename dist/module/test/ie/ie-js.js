(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ieJs = require(parentUrl,"@/module/test/ie/ie-js2.js");

var _ieJs2 = _interopRequireDefault(_ieJs);

function _interopRequireDefault(obj) { return { default: obj}; }

exports = {
    log: function log() {
        console.log('is ie-js.js');
        _ieJs2.default.log();
    }
};
})('module/test/ie/ie-js.js'); exports; 