import md5 from '../../../app/util/md5.js'

window.cmptMap = {};

/**
 * 加载vue文件为组件
 */
(function umd(root, factory) {
	if (typeof module === 'object' && typeof exports === 'object')
		module.exports = factory()
	else if (typeof define === 'function' && define.amd)
		define([], factory)
	else
		root.httpVueLoader = factory()
})(window, function factory() {
	'use strict';

    var scopeIndex = 0;
    
	StyleContext.prototype = {

		withBase: function (callback) {

			var tmpBaseElt;
			if (this.component.baseURI) {

				// firefox and chrome need the <base> to be set while inserting or modifying <style> in a document.
				tmpBaseElt = document.createElement('base');
				tmpBaseElt.href = this.component.baseURI;

				var headElt = this.component.getHead();
				headElt.insertBefore(tmpBaseElt, headElt.firstChild);
			}

			callback.call(this);

			if (tmpBaseElt)
				this.component.getHead().removeChild(tmpBaseElt);
		},

		scopeStyles: function (styleElt, scopeName) {

			function process() {

				var sheet = styleElt.sheet;
				var rules = sheet.cssRules;

				for (var i = 0; i < rules.length; ++i) {

					var rule = rules[i];
					if (rule.type !== 1)
						continue;

					var scopedSelectors = [];

					rule.selectorText.split(/\s*,\s*/).forEach(function (sel) {

						scopedSelectors.push(scopeName + ' ' + sel);
						var segments = sel.match(/([^ :]+)(.+)?/);
						scopedSelectors.push(segments[1] + scopeName + (segments[2] || ''));
					});

					var scopedRule = scopedSelectors.join(',') + rule.cssText.substr(rule.selectorText.length);
					sheet.deleteRule(i);
					sheet.insertRule(scopedRule, i);
				}
			}

			try {
				// firefox may fail sheet.cssRules with InvalidAccessError
				process();
			} catch (ex) {

				if (ex instanceof DOMException && ex.code === DOMException.INVALID_ACCESS_ERR) {

					styleElt.sheet.disabled = true;
					styleElt.addEventListener('load', function onStyleLoaded() {

						styleElt.removeEventListener('load', onStyleLoaded);

						// firefox need this timeout otherwise we have to use document.importNode(style, true)
						setTimeout(function () {

							process();
							styleElt.sheet.disabled = false;
						});
					});
					return;
				}

				throw ex;
			}
		},

		compile: function () {

			var hasTemplate = this.template !== null;

			var scoped = this.elt.hasAttribute('scoped');

			if (scoped) {

				// no template, no scopable style needed
				if (!hasTemplate)
					return;

				// firefox does not tolerate this attribute
				this.elt.removeAttribute('scoped');
			}

			this.withBase(function () {

				this.component.getHead().appendChild(this.elt);
			});

			if (scoped)
				this.scopeStyles(this.elt, '[' + this.component.getScopeId() + ']');

			return Promise.resolve();
		},

		getContent: function () {

			return this.elt.textContent;
		},

		setContent: function (content) {

			this.withBase(function () {

				this.elt.textContent = content;
			});
		}
	};

	function StyleContext(component, elt) {

		this.component = component;
		this.elt = elt;
	}


	ScriptContext.prototype = {

		getContent: function () {

			return this.elt.textContent;
		},

		setContent: function (content) {

			this.elt.textContent = content;
		},

		compile: function (module) {

			var childModuleRequire = function (childURL) {

				return httpVueLoader.require(resolveURL(this.component.baseURI, childURL));
			}.bind(this);

			var childLoader = function (childURL, childName) {
				var resolvedUrl = resolveURL(this.component.baseURI, childURL);
				return httpVueLoader(resolvedUrl, childName);
			}.bind(this);

			try {
				Function('exports', 'require', 'httpVueLoader', 'module', this.getContent())
					.call(this.module.exports, this.module.exports, childModuleRequire, childLoader, this.module);
			} catch (ex) {

				if (!('lineNumber' in ex)) {

					return Promise.reject(ex);
				}
				var vueFileData = responseText.replace(/\r?\n/g, '\n');
				var lineNumber = vueFileData.substr(0, vueFileData.indexOf(script)).split('\n').length + ex.lineNumber - 1;
				throw new(ex.constructor)(ex.message, url, lineNumber);
			}

			return Promise.resolve(this.module.exports)
				.then(httpVueLoader.scriptExportsHandler.bind(this))
				.then(function (exports) {
					// console.log('exports', exports);
					// Logger.info('exports', exports);
					
					if(exports.computed == null) {
						exports.computed = {};
					}
					
					exports.computed.auto = function() {
						var basePath = Conf.frontPath;
						var baseUrlPath = location.origin;
						var relativePath = exports._fullUrl.replace(baseUrlPath, '');
						var fullPath = basePath + '/src' + relativePath;
						return {
							fullUrl: exports._fullUrl,
							fullPath: fullPath,
							url: exports._url
						};
					};
					// console.log('exports', exports);
					this.module.exports = exports;
				}.bind(this));
		}
	};

	function ScriptContext(component, elt) {

		this.component = component;
		this.elt = elt;
		this.module = {
			exports: {}
		};
	}


	TemplateContext.prototype = {

		getContent: function () {

			return this.elt.innerHTML;
		},

		setContent: function (content) {

			this.elt.innerHTML = content;
		},

		getRootElt: function () {

			var tplElt = this.elt.content || this.elt;

			if ('firstElementChild' in tplElt)
				return tplElt.firstElementChild;

			for (tplElt = tplElt.firstChild; tplElt !== null; tplElt = tplElt.nextSibling)
				if (tplElt.nodeType === Node.ELEMENT_NODE)
					return tplElt;

			return null;
		},

		compile: function () {

			return Promise.resolve();
		}
	};

	function TemplateContext(component, elt) {

		this.component = component;
		this.elt = elt;
	}



	Component.prototype = {

		getHead: function () {

			return document.head || document.getElementsByTagName('head')[0];
		},

		getScopeId: function () {

			if (this._scopeId === '') {

				this._scopeId = 'data-s-' + (scopeIndex++).toString(36);
				this.template.getRootElt().setAttribute(this._scopeId, '');
			}
			return this._scopeId;
		},

		load: function (componentURL, name) {

			return httpVueLoader.httpRequest(componentURL, name)
				.then(function (obj) { 
					var responseText = obj.code;
					var xhr = obj.xhr;
					// 获取到编译后的vue代码，responseText
                    // console.log("finish load", componentURL);
					// Logger.info('xhr', xhr);

					this.baseURI = componentURL.substr(0, componentURL.lastIndexOf('/') + 1);
					this.xhr = xhr;

					var doc = document.implementation.createHTMLDocument('');

					// IE requires the <base> to come with <style>
					doc.body.innerHTML = (this.baseURI ? '<base href="' + this.baseURI + '">' : '') + responseText;

					for (var it = doc.body.firstChild; it; it = it.nextSibling) {

						switch (it.nodeName) {
							case 'TEMPLATE':
								this.template = new TemplateContext(this, it);
								break;
							case 'SCRIPT':
								this.script = new ScriptContext(this, it);
								break;
							case 'STYLE':
								this.styles.push(new StyleContext(this, it));
								break;
						}
					}

					return this;
				}.bind(this));
		},

		_normalizeSection: function (eltCx) {

			var p;

			if (eltCx === null || !eltCx.elt.hasAttribute('src')) {

				p = Promise.resolve(null);
			} else {

				p = httpVueLoader.httpRequest(eltCx.elt.getAttribute('src'))
					.then(function (content) {

						eltCx.elt.removeAttribute('src');
						return content;
					});
			}

			return p
				.then(function (content) {

					if (eltCx !== null && eltCx.elt.hasAttribute('lang')) {

						var lang = eltCx.elt.getAttribute('lang');
						eltCx.elt.removeAttribute('lang');
                        var content2 = httpVueLoader.langProcessor[lang.toLowerCase()].call(this, content === null ? eltCx.getContent() : content);
                        // console.log("content2", content2);
                        return content2;
					}
					return content;
				}.bind(this))
				.then(function (content) {

					if (content !== null)
						eltCx.setContent(content);
				});
		},

		normalize: function () {

			return Promise.all(Array.prototype.concat(
					this._normalizeSection(this.template),
					this._normalizeSection(this.script),
					this.styles.map(this._normalizeSection)
				))
				.then(function () {
					return this;
				}.bind(this));
		},

		compile: function () {

			return Promise.all(Array.prototype.concat(
					this.template && this.template.compile(),
					this.script && this.script.compile(),
					this.styles.map(function (style) {
						return style.compile();
					})
				))
				.then(function () {
					return this;
				}.bind(this));
		}
	};

	function Component(name) {

		this.name = name;
		this.template = null;
		this.script = null;
		this.styles = [];
		this._scopeId = '';
	}

	function identity(value) {

		return value;
	}

	function parseComponentURL(url) {

		var comp = url.match(/(.*?)([^/]+?)\/?(\.vue)?(\?.*|#.*|$)/);
		var result = {
			name: comp[2],
			url: comp[1] + comp[2] + (comp[3] === undefined ? '/index.vue' : comp[3]) + comp[4]
		};
		return result;
	}

	function resolveURL(baseURL, url) {
		if(url.indexOf(baseURL) == 0) {
			return url;
		}

		if (url.substr(0, 2) === './' || url.substr(0, 3) === '../') {
			return baseURL + url;
		}
		return url;
	}

    // console.log('in httpVueLoader')
    var timeCache = {};
	httpVueLoader.load = function (url, name) {

		// console.log('load url', url);

		let loadFunc = function () {

			var component = new Component(name).load(url, name)
				.then(function (component) {
                    timeCache[url] = new Date();
					return component.normalize();
				})
				.then(function (component) {

					return component.compile();
				})
				.then(function (component) {

					var exports = component.script !== null ? component.script.module.exports : {};

					if (component.template !== null)
						exports.template = component.template.getContent();

					if (exports.name === undefined)
						if (component.name !== undefined)
							exports.name = component.name;

					var xhr = component.xhr;
					exports._baseURI = component.baseURI;
					exports._url = url;
					exports._fullUrl = xhr.responseURL;
                    var start = timeCache[url];
                    // console.log("耗时", new Date().getTime() - start.getTime());
					return exports;
				});
			component.url = url;
			return component;
		};
		loadFunc.url = url;
		return loadFunc;
	};


	httpVueLoader.register = function (Vue, url) {

		var comp = parseComponentURL(url);
		Vue.component(comp.name, httpVueLoader.load(comp.url));
	};

	httpVueLoader.install = function (Vue) {

		Vue.mixin({

			beforeCreate: function () {

				var components = this.$options.components;

				for (var componentName in components) {

					if (typeof (components[componentName]) === 'string' && components[componentName].substr(0, 4) === 'url:') {

						var comp = parseComponentURL(components[componentName].substr(4));

						var componentURL = ('_baseURI' in this.$options) ? resolveURL(this.$options._baseURI, comp.url) : comp.url;

						// 注册子组件
						if (isNaN(componentName))
							components[componentName] = httpVueLoader.load(componentURL, componentName);
						else
							components[componentName] = Vue.component(comp.name, httpVueLoader.load(componentURL, comp.name));
					}
				}
			}
		});
	};

	httpVueLoader.require = function (moduleName) {

		return window[moduleName];
	};

	httpVueLoader.UrlData = {};
	httpVueLoader.UrlMap = {};

	// 发起http请求并返回promise
	httpVueLoader.httpRequest = function (url, name) {

		// console.log('requestUrl', url);

		// 存在缓存的情况
		if(vueCache[url] != null) {
            console.log("get from cache:" + url);
			
            return new Promise(function(resolve, reject) {
				var xhr = httpVueLoader.UrlMap[url];
				var code = vueCache[url];
				HttpVuePlus.load(code, xhr._url, name, (code) => {
					resolve({
						code: code, 
						xhr: xhr
					});
				});
                resolve({
					xhr: xhr,
					code: code
				});
            });
        }

		/**
		 * 生效代码：xhr._resolve(code);
		 */
		return new Promise(function (resolve, reject) {

			// CoreUtil.request(url, function(xhr, text) {
			// 	if (xhr.status >= 200 && xhr.status < 300) {
			// 		var js = HttpVuePlus.load(text, xhr._url, name, (code) => {
			// 			resolve(code);
			// 		});
			// 	} else {
			// 		reject(xhr.status);
			// 	}
			// });

			var xhr = new XMLHttpRequest();
			xhr.open('GET', url + '?version='+new Date().getTime());
			xhr._url = url;
			xhr._resolve = resolve;
			var md5 = window.md5(new Date().getTime() + '');
			xhr.setRequestHeader('id', md5);
			// console.log('set id', md5);

			xhr.onreadystatechange = function () {

				if (xhr.readyState === 4) {

					if (xhr.status >= 200 && xhr.status < 300) {
						
						var responseText = xhr.responseText;
						if(vueCache[url] != null) {
							responseText = vueCache[url];
						}

						var js = HttpVuePlus.load(responseText, xhr._url, name, (code) => {
							// Logger.info('xhr', xhr);
							httpVueLoader.UrlData[xhr.responseURL] = code;
							httpVueLoader.UrlMap[url] = xhr;
							
							resolve({
								code: code, 
								xhr: xhr
							});
							// vueCache[url] = js; // 延后缓存
						});
                        // resolve(js);
                    } else {
                        reject(xhr.status);
                    }
				}
			};

			xhr.send(null);
		});
	};

	httpVueLoader.langProcessor = {
		html: identity,
		js: identity,
        css: identity,
        less: function(value) {
            var v2 = less.render(value);
            return v2.then(function(e, out) {
                return e.css;
            });
        }
	};

	httpVueLoader.scriptExportsHandler = identity;

	function httpVueLoader(url, name) {
		if(name != null) {
			// console.log(url + ": name " + name)
		}
        // console.log("url", url);
        // preloadVue (url);
		var comp = parseComponentURL(url);
		var component = httpVueLoader.load(comp.url, name);
		component.url = url;
		return component;
    };
    
    window.loader = httpVueLoader;

	return httpVueLoader;
});

export default window.loader;