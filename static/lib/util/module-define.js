/**
  * ModuleDefine
  * Jianbo
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ModuleDefine = factory());
}(this, (function () { 'use strict';

var getType = function(obj) {
    return Object.prototype.toString.call(obj);
};
var isString = function(obj) {
    return getType(obj) == '[object String]' ;
};

var ModuleDefine = {
    module: {
        'BaseUtil': './static/lib/lowcode/base-util.js',
        'VueTemplateUtil': './static/lib/lowcode/vue-template-util.js',
        'VueUtil': './static/lib/lowcode/vue-util.js',
        'HtmlUtil': './static/lib/lowcode/html-util.js',
        'Babel': './static/lib/pure-lib/babel.min.js',
        'loadAce': './static/js/lib/ace/src-min-noconflict/ace.js',
        'hljs': './static/js/lib/markdown/highlight.min.11.9.0.js',
        'axios': './static/js/lib/axios.min.js',
        'markdownit': './static/js/lib/markdown/markdown-it.min.js',
        'loadHighlightCss': './static/js/lib/markdown/highlight.css',
        'purecss': './static/lib/purecss/pure-min.css',
        'difflib': {
            'difflib': './static/lib/difflib/difflib.js',
            'diffview': './static/lib/difflib/diffview.js',
            'diffcss': './static/lib/difflib/diffview.css',
        },
        'webuploader': {
            'webuploader': './static/lib/webuploader/webuploader.min.js',
            'webuploaderCss': './static/lib/webuploader/webuploader.css',
            'webuploaderDemoCss': './static/lib/webuploader/demo/webuploader-demo.css'
        }
    },

    loadMulti: function(counter, moduleMap) {
        for(let module in moduleMap) {
            var url = moduleMap[module];
            var _call = counter.callAuto(module);

            var loadCall = function() {
                _call();
            };
            loadCall.key = module;
            if(url.endsWith('.js')) {
                // console.log('loadJs', url)
                loadJS(url, loadCall);
            } else if(url.endsWith('.css')) {
                // console.log('loadCss', url)
                loadCSS(url, loadCall);
            }
        }
    },

    load: function(modules, _finish) {
        if(Object.prototype.toString.call(modules) == '[object String]') {
            modules = [modules];
        }
        var counter = Counter.auto('loadModule');
        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            var url = this.module[module];
            if(url == null) {
                console.error('module not exist', module);
                continue;
            }
            if(!isString(url)) {
                this.loadMulti(counter, url);
                continue;
            }
            var _call = counter.callAuto(module);

            var loadCall = function() {
                _call();
            };
            loadCall.key = module;
            if(url.endsWith('.js')) {
                // console.log('loadJs', url)
                loadJS(url, loadCall);
            } else if(url.endsWith('.css')) {
                // console.log('loadCss', url)
                loadCSS(url, loadCall);
            }
        }

        counter.finish(function() {
            _finish();
        });
    }
};

return ModuleDefine;

})));