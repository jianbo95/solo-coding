/**
  * VueTemplateUtil
  * Jianbo
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueTemplateUtil = factory());
}(this, (function () { 'use strict';

var VueTemplateUtil = {
    editTemplate(code) {

        code = BaseUtil.replaceStart(code, '<template', '<edit');
        code = BaseUtil.replaceEnd(code, '</template', '</edit');
        
        // console.log('template', code);
        return code;
    },
    restoreTemplate(code) {
        code = BaseUtil.replaceStart(code, '<edit', '<template');
        code = BaseUtil.replaceEnd(code, '</edit', '</template');
        
        // console.log('template', code);
        return code;
    }
};

return VueTemplateUtil;

})));