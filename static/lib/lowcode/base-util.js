/**
  * BaseUtil
  * Jianbo
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.BaseUtil = factory());
}(this, (function () { 'use strict';

var BaseUtil = {
  replaceStart(target, str, replaceStr) {
    var pos = target.indexOf(str);
    var start = target.substring(0, pos);
    var end = target.substring(pos + str.length);
    return start + replaceStr + end;
  },
  replaceEnd(target, str, replaceStr) {
    var pos = target.lastIndexOf(str);
    var start = target.substring(0, pos);
    var end = target.substring(pos + str.length);
    return start + replaceStr + end;
  },
};

return BaseUtil;

})));