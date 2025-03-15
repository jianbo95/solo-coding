import VueCodeWrap from './VueCodeWrap.js';
import Counter from '../../../app/util/Counter.js'
import UrlParser from './UrlParser.js';

//替换所有
String.prototype.replaceAll = function(s1, s2){ 
    var reg = new RegExp(s1, "gm");
    return this.replace(reg, s2); 
}

var vueCache = {};
window.vueCache = vueCache;

/**
 * 加载vue文件，解析，编译，转换
 * 返回vue文件
 */
var HttpVuePlus = {
    writeMap: {},
    originWriteMap: {},
    
    writeCache: function(code, url) {
        window.vueCache[url] = code;
    },
    write: function(code, url) {
        this.writeMap[url] = code;
        // console.log('write url', url);
        // 保存到浏览器缓存当中
        Core.put(url, code);
        window.vueCache[url] = null;
    },
    writeOrigin: function(code, url) {
        this.originWriteMap[url] = code;
    },
    read: function(url) {
        return this.writeMap[url];
    },
    waitOrigin: function(url, _call) {
        var i = 0;
        var timer = setInterval(() => {
            i ++;
            if(i == 100) {
                console.error('wait vue 超过一秒');
                clearInterval(timer);
                return;
            }
            var code = this.originWriteMap[url];
            if(code != null) {
                // console.log('waitDom success');
                _call(code);
                clearInterval(timer);
            }
        }, 10);
    },
    wait: function(url, _call) {
        var i = 0;
        var timer = setInterval(() => {
            i ++;
            if(i == 100) {
                console.error('wait vue 超过一秒');
                clearInterval(timer);
                return;
            }
            var code = this.read(url);
            if(code != null) {
                // console.log('waitDom success');
                _call(code);
                clearInterval(timer);
            }
        }, 10);
    },

    compileScript: function(code, url) {

		var head = '<script>';

		if(code.indexOf(head) !== -1) {
			var start = new Date().getTime();

			var strs = code.split(head);
			var template = strs[0];
			// console.log(strs[0]);
			var str1 = strs[1];
			var str1s = str1.split('</script>');
			var script = str1s[0];
			var style = str1s[1];
			
			// 兼容IE
			var output = Babel.transform(script, { presets: ['es2015'] }).code;
            // console.log('script output', output);
            output = output.replace('"use strict";', '');
			output = output.replace("'use strict';", '');
			// console.log('output', output);
			output = output.substring(0, output.length - 1);

			output = template + '<script>' + output + '\n</script>' + style;
			// console.log('code2', output);
			var end = new Date().getTime();
			console.log('useTime:' + (end - start) + 'ms ' + url);
			return output;
		}
		
		return code;
	},
    
    /**
     * 加载vue代码并转换
     * @param {String} code 
     * @param {String} url 
     * @param {String} name 
     * @param {Function} resolve 
     * @returns 返回加载后的vue文件
     */
    load: function (code, url, name, resolve) {
        // console.log('HttpVuePlus.load', url);
        this.writeOrigin(code, url);
        
        // 这里暂时关闭了缓存！
        if(this.writeMap[url] != null) {
            // TODO 支持缓存，同时支持异步。
            // code = this.writeMap[url];
            // console.log('loadCompile from cache ' + url);
        } else {
            // console.log('loadCompile from url ' + url);
        }
        
        let newCode = this.loadCompile(code, url, name, (result) => {
            resolve(result);
        });

        this.writeMap[url] = newCode;
        // console.log('loadVueUrl', url);
        if('./AppUltra.vue' == url) {
            console.log('loadVueCode', code, newCode);
        }

        // console.log('newCode', newCode);

        return newCode;
    },

    /**
     * 加载并编译vue文件，返回编译好的vue文件
     */
    loadCompile (code, url, name, _call) {
        var lines = code.split('\n');
        var counter = Counter.auto('loadJs' + url);
        for (var i = 0; i < lines.length; i++) {
            lines[i] = this.loadLine(lines[i], url, counter);
        }
        
        code = lines.join('\n');
        
        code = VueCodeWrap.wrap(code, url, name);
        
        // console.log('wrap code', code);
        if(window.CoreUtil != null && CoreUtil.isIE()) {
            code = this.compileScript(code, url);
        }
        
        counter.finish(() => {
            // console.log('counter finish ' + url);
            _call(code);
        });
        return code;
    },

    /**
     * 加载行，语法转换
     */
    loadLine (originLine, url, counter) {
        // console.log('originLine', originLine);
        let line = originLine.trim();

        if(line.startsWith('//')) {
            return originLine;
        }

        if(line.indexOf('import') !== -1 && line.indexOf('from') !== -1) {
            return this.loadImport(line, url, counter);
        } else if(line.indexOf('export default') !== -1) {
            return this.loadExport(line, url);
        } else {
            return originLine;
        }
    },

    /**
     * 加载行中的import
     * @param {String} line 
     * @param {String} url 
     * @returns 
     */
    loadImport (line, url, counter) {
        line = line.trim();
        if(line.indexOf('//') != -1) {
            line = line.split('//')[0];
        }
        var info = UrlParser.parse(url);
        var splits = line.split('from');
        var name = splits[0].replace('import', '').trim();
        if(window[name] != null) {
            // console.log('loadImport return ' + url);
            return;
        }
        var path = splits[1].replaceAll('\'', '')
            .replaceAll('"', '')
            .replaceAll(';', '')
            .trim();
        // loadJs
        // import Test from './test/test.js';
        var urlDir = this.urlDir(url);
        
        // 判断资源类型
        // console.log('原始引用', line);
        // console.log('引入模块名', name);
        // console.log('vue的文件路径', url);
        // console.log('引入vue的路径', urlDir);
        // console.log('引入时的路径', path);

        // vue的文件路径 ../../module/devtool/test2.vue
        // 引入vue的路径 ../../module/devtool
        // 引入时的路径 ../../app/util/TestImport.js
        // 拼接路径 ../../module/devtool/../../app/util/TestImport.js

        var resourceUrl = this.buildResourceUrl(urlDir, path);
        // console.log('resourceUrl', resourceUrl);
        
        var type = this.parseType(resourceUrl);
        // console.log('loadImport type', type);
        // console.log('\n');
        
        if(type == 'js') {

            // TODO import 模式下没问题，但是requireJs 模式下有问题
            // return line;

            let call = counter.callAuto(resourceUrl);

            $.get(resourceUrl, (code) => {
                // console.log('code ' + name + " " + resourceUrl);
                // console.log(code);
                this.loadImportSize ++;
                
                if(code.indexOf('Flag("compileByPublish");') != -1) {
                    // console.log('Flag("compileByPublish");', resourceUrl, code);
                    // 编译过的js
                    var jsCode = code;
                    var result = eval(jsCode); // 执行js code
                    window[name] = result;
                    call();
                } else {
                    var jsCode = this.loadJs(code, name);
                        this.loadScript(jsCode, name, resourceUrl, () => {
                            // console.log('loadScript success');
                        call();
                    });
                }

                // console.log('jsCode ' + resourceUrl);
                // try {
                //     eval(jsCode); // 执行js code
                    
                // } catch (e) {
                //     console.error(e);
                //     console.error(jsCode);
                // }
                // console.log('加载' + name + '成功');
                // call();

                
            }, 'text');

        } else if(type == 'vue') {
            // 定义组件为全局变量
            window[name] = httpVueLoader(resourceUrl);
            // console.log('load ' + name, window[name]);
            this.loadImportSize ++;
        }
            
        return '';
    },
    parseType (url) {
        return url.substring(url.lastIndexOf('.') + 1);
    },
    loadExport (line) {
        // 语法转换
        return line.replace('export default', 'module.exports=');
    },
    urlDir(url) {
        return url.substring(0, url.lastIndexOf('/'));
    },
    buildResourceUrl(urlDir, path) {
        if(path.indexOf('@') == 0) {
            // 根路径直接请求
            return path.replace('@', '.');
        } else {
            // return urlDir + path.replace('.', '');
            return urlDir + '/' + path
        }
    },
    loadJs(js, name) {
        var posStart = js.lastIndexOf('export default');
        var posEnd = posStart + 'export default'.length;
        var code = js.substring(0, posStart) + 'window.' + name + ' = ' +
            js.substring(posEnd);
        // console.log('code', code);

        if(window.CoreUtil != null && CoreUtil.isIE()) {
            code = CoreUtil.babel(code);
        }
        return code;
        // 多个export default 时可能会出错
        // return js.replace('export default', 'window.' + name + ' = ');
    },
    loadScript( innerHTML, name, resourceUrl, callback ){
        // TODO require 模式下 loadScript

        innerHTML = StringUtil.replaceAll(innerHTML, "from '@/", "from '/");
        innerHTML = StringUtil.replaceAll(innerHTML, "from \"@/", "from \"/");

        var script = document.createElement('script'),

        fn = callback || function(){};

        var timer = setInterval(() => {
            if(window[name] != null) {
                callback();
                clearInterval(timer);
            }
        }, 100);

        // script.type = 'text/javascript';
        script.type="module";
        script.setAttribute('type', 'module');
        
        // console.log(resourceUrl);
        // console.log(innerHTML);
        script.innerHTML = innerHTML;
        
        // script.src = resourceUrl;
        document.getElementsByTagName('head')[0].appendChild(script);
        
        // for(var key in script) {
        //     if(key != 'innerText' && key != 'textContent') {
        //         console.log('script'+key, script[key]);
        //     }
        // }
        //IE

        if(script.readyState){

            script.onreadystatechange = function(){

                if( script.readyState == 'loaded' || script.readyState == 'complete' ){

                    script.onreadystatechange = null;

                    fn();

                }

            };

        }else{

            //其他浏览器

            script.onload = function(){
                console.log('script.onload');
                fn();

            };

        }


    }
};

window.HttpVuePlus = HttpVuePlus;

export default HttpVuePlus;