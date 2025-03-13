/**
 * swallow : 前端模板引擎
 * version : [
 * 		0.3 : 优化循环无法获取外部全局变量
 * 		0.4 : 加入注释功能，解决循环的bug 2017/2/25
 * ]
 * next version : 增加 debug 功能
 * author : jianbo
 * time : 2016/10/21
 * update : 2016/11/24
 */

(function(){

	/**
	 * 定义配置对象
	 */
	var Config = {};

	Config.openTag = "{{"; // 左标签
	Config.closeTag = "}}"; // 右标签
	Config.compress = true; // 去除标签的占行

	/**
	 * 定义工具对象
	 */
	var Util = {};

	Util.join = function(list, str) {
		return list.join(str);
	};

	Util.join2 = function(list, str) {
		// var arr = [];
		// for(var i = 0; i < list.length; i++) {

		// }
		// return list.join(str);
	};

	// 数组循环 对象循环
	// 作为参数传给了 $each
	Util.foreach  = function(list, callback){
		if(list != undefined) {
			if(Array.isArray(list)) {
				for (var i = 0; i < list.length; i++) {
					callback(list[i], i, i == list.length - 1);
				}
			} else {
				
				var keys = Object.keys(list);
				var length = keys.length;
				var i = 0;
				for (var key in list) {
					callback(list[key], key, i == length - 1);
					i ++;
				}
			}
		}
	};

	Util.split = function(data, size) {
		var result = [];
		var len = data.length;
		for(var i = 0; i < len; i += size){
			result.push(data.slice(i, i + size));
		}
		return result;
	};

	Util.escape = function(sHtml) {
		return sHtml.replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});
	};

	Util.escape2 = function(sHtml) {
		return Util.escape( Util.escape(sHtml) );
	};

	// 打印错误信息
	Util.error = function(str) {
		if (typeof console != 'object') {
    		console = {log:function(){}};
		}
		console.log("Error: "+str);
	};

	// 替换所有 str1 -> str2
	Util.replaceAll = function(target, str1, str2) {
		var reg = new RegExp(str1, "gm");
		return target.replace(reg, str2); 
	};

	/**
	 * 去除标签中的换行
	 */
	Util.compress = function(source, isCompress) {
		if(source == null) {
			console.log("Error: 源码为空");
		}
		if(!isCompress) {
			return source;
		}
		var code = source;
		// 去除{{}}后面的回车符
		// 匹配开头的tab符，空格符，和末尾的回车符
		var ln = "[\s ]*\\r?\\n";
		var regList = [
			"[\t ]*{{each [^\r\n]*}}" + ln,
			"[\t ]*{{/each}}" + ln,
			"[\t ]*{{if [^\r\n]*}" + ln,
			"[\t ]*{{else if [^\n]*}" + ln,
			"[\t ]*{{/if}}" + ln,
			"[\t ]*{{else}}" + ln,
			"[\t ]*{{set [^\r\n]*}}" + ln,
			"[\t ]*{{![^\r\n]*}}" + ln,
		];
		for (var i = 0; i < regList.length; i++) {
			var regStr = regList[i];
			var mode = "gm";
			var reg = new RegExp(regStr, mode);
			var matchs = code.match(reg);
			if(matchs != undefined) {
				for (var j = 0; j < matchs.length; j++) {
					var match = (matchs[j]);
					// 去除结尾的换行符
					var match2 = match.replace(/\r?\n$/, "");
					// 去除开头的空白符
					var newMatch = match2.replace(/^[\t ]*/, "");
					code = code.replace(match, newMatch);
				}
			}
		}
		// 三层 {{{}}} 替换
		(function() {
			code = Util.replaceAll(code, '{{{', "{{echo '{'}}{{");
			code = Util.replaceAll(code, '}}}', "}}{{echo '}'}}");
		}());

		(function() {
			// 去除开头的回车符和空白符
			var regStr = "[ \t\r\n]*{{notln}[ ]*";
			var mode = "gm";
			var reg = new RegExp(regStr, mode);
			var matchs = code.match(reg);
			if(matchs != undefined) {
				for (var j = 0; j < matchs.length; j++) {
					var match = (matchs[j]);
					// 去除换行符
					var match2 = match.replace(/[ \t\r\n]*/, "");
					// 去除开头的空白符
					var match3 = match2.replace(/[ ]*/, "");
					code = code.replace(match, match3);
				}
			}
		}());

		(function() {
			// 换行
			var regStr = "{{ln}}";
			var mode = "gm";
			var reg = new RegExp(regStr, mode);
			var matchs = code.match(reg);
			if(matchs != undefined) {
				for (var j = 0; j < matchs.length; j++) {
					var match = (matchs[j]);
					// 去除换行符
					var match2 = match.replace(/{{ln}}/, "\r\n");
					// 去除开头的空白符
					code = code.replace(match, match2);
				}
			}
		}());

		return code;
	}; // end compress

	// 数据模型映射模块
	Util.Map = {
		model : "$model", // 模型变量名
		loopTimes : 0, // 记录循环次数
		loopVarName : [], // 循环变量名
		valueName : "$value",
		indexName : "$index",
		isEndName : "isEnd",
		// 循环开始
		loop : function(value, index) {
			this.loopTimes ++;
			// 当前循环变量名和索引名
			this.loopVarName[this.loopTimes] = {
				value : value, // 变量名
				index : index // 索引名
			};
		},
		loopClose : function() {
			// 循环结束，撤销自定义变量名
			this.loopVarName[this.loopTimes] = null;
			this.loopTimes --;
		},
		/**
		 * [map 获取模型映射]
		 * @param  args [分离逻辑后的参数]
		 * @return      [模型.变量名]
		 */
		toMap : function(args) {
			if (this.loopTimes == 0) {
				return this.model + "." + args; // 外部变量
			} else {
				var name0 = args.split(' ').shift(); // $value.name == ...
                var name = name0.split('.').shift(); // name
				// 循环内部 
				// 循环内部也需要引用外部变量
				// 自定义变量名
				var varName = this.loopVarName[this.loopTimes];
				if(varName != undefined) {
					if(name == varName.value || name == varName.index) {
						return args;
					}
				}
				// 默认变量名
				if(name == this.valueName || name == this.indexName) {
					return args;
				}
				// isEnd
				if(name == this.isEndName) {
					return args;
				}
				return this.model + "." + args;
			}
		}
	}; // End Map

	// 语法分析器
	Util.parser = function (code) {
		var Map = Util.Map;

		var split = code.split(' '); // 分离逻辑代码
		var key = split.shift(); // 获取逻辑关键字
		var args = split.join(' '); // 获取参数

		switch (key) {
			case '':
				Util.error("{{"+code+"}} is invalid! not blank!");
				break;

			case 'if':
				code = 'if(' + Map.toMap(args) + '){';
				break;

			case 'else':
				if (split.shift() == 'if') {
					var condition = split.join(' ');
					condition = Map.toMap(condition);
					code = '}else if(' + condition + '){';
				} else {
					code = '}else{';
				}
				break;

			case '/if':
				code = '}';
				break;

			case 'each':
				
				var object = split[0] || '$data';
				var as     = split[1] || 'as';
				var value  = split[2] || '$value';
				var index  = split[3] || '$index';
				
				if (as != 'as') {
					Util.error("{{"+code+"}} is invalid!");
				}

				object = Map.toMap(object); // 这里还属于未循环阶段
				code =  '$each(' + object + ',function(' + value + ',' + index+ ', isEnd){\n';
				
				code += 'var $value = '+value +';\n';
				code += 'var $index = '+index +';';
				Map.loop(value, index); // 开启循环，传入变量名，索引名
				break;

			case '/each':

				if(code != "/each") {
					Util.error("{{"+code+"}} is invalid!");
				}
				Map.loopClose(); // 关闭循环
				code = '});';
				break;

			case 'set':
				// $model or $value
				// code = Map.toMap(args);
				if(Map.loopTimes != 0) {
					code = '$value.' + args;
				} else {
					code = '$model.' + args;
				}
				break;
			
			case 'global':
				code = '$model.' + args;
				break;

			// 注释
			case '!':
				code = "";
				break;

			// 不换行
			case 'notln':
				code = "";
				break;

			// 换行
			case 'ln':
				code = "";
				break;
			
			// 工具类
			case 'tool':
				code = "$out+=$tool." + args +";";
				break;
			
			// 直接输出
			case 'echo':
				code = "$out+=" + args + ";";
				break;

			// 运行
			case 'run':
				code = "$out+=(function() {"+args+"})()";
				break;

			default:
				var param = Map.toMap(code);
				code = '=' + param;
				// 注释
				if(/![/s/S]*/.test(key)) {
					code = "";
				}
				break;
		}
		// console.log(code);
		return code;
	};

	var foreach = Util.foreach;

	var swallow = function(){
		// 返回self对象
		var self = {};
		self.debug = false;
		
		// 渲染代码段
		var resolveElement = function(element) {
			// 逻辑语句
			var logic = function(code) {
				code = Util.parser(code);
				if (code.indexOf('=') == 0) {
					code = "$out+" + code + ";";
				}
				return code + "\n";
			}; // end logic

			// html语句
			var html = function(code) {
				// 字符串转义
				var stringify = function (code) {
					return "'" + code
					// 单引号与反斜杠转义
					.replace(/('|\\)/g, '\\$1')
					// 换行符转义(windows + linux)
					.replace(/\r/g, '\\r')
					.replace(/\n/g, '\\n') + "'";
				};
				code = "$out+=" + stringify(code) + ";" + "\n";
				return code;
			};

			if(element.type == "html") {
				return html(element.code);
			} else {
				return logic(element.code);
			}
		};

		/**
		 * 根据标签分割代码
		 */
		var splitCodeByTag = function(source) {
			var codes = [];
			var codeArray = [];

			// class
			var element = function(code, type) {
				this.code = code;
				this.type = type;
			};
			var getHtml = function(code) {
				return new element(code, "html");
			};
			var getLogic = function(code) {
				return new element(code, "logic");
			};

			foreach(source.split(Config.openTag), function(closeSource) {
				// list: [html]
				// list: [logic, html] 
				// closeTag的前面一定是逻辑语句
				var list = closeSource.split(Config.closeTag);
				if (list.length == 1) {
					codeArray.push(getHtml(list[0]));
				} else {
					codeArray.push(getLogic(list[0]));
					if (list[1]) {
						codeArray.push(getHtml(list[1]));
					}
				}
			});
			
			return codeArray;
		};

		/**
		 * 渲染模板
		 * @param  codeArray 代码数组
		 * @param  model     数据模型
		 * @return result
		 */
		var compile = function(source, model) {

			var code = Util.compress(source, Config.compress);
			// 获取代码数组
			var codeArray = splitCodeByTag(code);

			var createMainCode = function(){
				var mainCode = "";
				for (var i = 0; i < codeArray.length; i++) {
					var element = codeArray[i];
					mainCode += resolveElement(element);
				}
				return mainCode;
			};

			var start = "'use strict';" 
				+ "var $model;"
				+ "var $M = $model;"
				+ "var $tool;"
				+ "var $T = $tool;"
				+ "var $out = '';";
			var end = "return String($out)";
			
			var code = start + createMainCode() + end;
			// console.log(code);
			var run = new Function('$model', '$each', '$tool', code);
			var result = String(run(model, foreach, Util));
			return result;

		};

		// 设置
		self.set = function(opts) {
			for(key in opts) {
				Config[key] = opts[key];
			}
		};

		// 渲染
		self.render = function(source, model) {
			// console.log(source);
			// 渲染模板
			var result = compile(source, model);
			return result;
		};

		// 根据id渲染
		self.template = function(id, model) {
			var ele = document.getElementById(id);
			var source = ele.innerHTML;
			var result = self.render(source, model);
			ele.innerHTML = result;
		};

		return self;
	}();

	// 导出Swallow
	if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
		exports.swallow = swallow; // CommonJS
		exports.template = swallow;
	} else if (typeof define === 'function' && define.amd) {
		define(['exports'], function(){
			return swallow;
		}); // AMD
	} 

	if(window != null) {
		window.swallow = swallow;
		window.template = swallow;
	}
	

}());
/**
 * name : Flower dom框架
 * author : jianbo
 * time : 2016/10/25
 */

var util = {};

util.error = function () {
	var errors = ["Error:"].concat(arguments);
	console.log.apply(console, errors);
};

util.foreach = function (obj, callback, scope) {
	if (obj.length == undefined) {
		util.error("Is not Array.");
		return;
	}
	for (var i = 0, len = obj.length; i < len; ++i) {
		callback.call(scope, obj[i], i, obj);
	}
};

var Flower = function(Util, document){
	"use strict";
	var foreach = Util.foreach;
	// 拓展元素方法
	var richElement = function(e) {
		e.val = function(v) {
			// val() 获取
			if (v == undefined) {
				return e.value;
			// val() 设置
			} else {
				e.value = v;
			}
		};
		e.html = function(h) {
			if (h == undefined) {
				return e.innerHTML;
			} else {
				e.innerHTML = h;
			}
		};
		e.hide = function() {
			// 记录原来的风格
			if (e.style.display != "none") {
				e.style.old_display = e.style.display;
			}
			e.style.display = "none";
		};
		e.show = function() {
			// 如果存在原来的风格，则使用原来的
			if(e.style.old_display != undefined) {
				e.style.display = e.style.old_display;
			} else {
				e.style.display = "inline";
			}
		};
		// 添加风格
		e.addStyle = function(name, value) {
			if(value != null) {
				e.style[name] = value;
				return;
			}
			var obj = name;
			for(var key in obj) {
				e.style[key] = obj[key];
			}
		};
		
	}; // end richElement

	var F = function(args){
		var getElement = function(args) {
			// #args 代表id
			if (/^#/.test(args)) {
				var id = args.substring(1, args.length);
				var element = document.getElementById(id);
				if(element == undefined) {
					Util.error("Id is not found!");
					return;
				}

				richElement(element);
				return element;
			// .args 代表class
			} else if(/^\./.test(args)) {
				var classname = args.substring(1, args.length);
				
				var elements = new Array();//定义数组 
				var tags = document.getElementsByTagName("*");//获取HTML的所有标签 
				
				for(var i in tags){//对标签进行遍历 
					if(tags[i].nodeType == 1){//判断节点类型 
						//判断和需要CLASS名字相同的，并组成一个数组 
						if(tags[i].getAttribute("class") == classname) { 
							var element = tags[i];
							richElement(element);
							elements.push(element);
						} 
					} 
				} 
				return elements;//返回组成的数组 

			// $args 代表name
			} else if (/^\$/.test(args)) {
				var name = args.substring(1, args.length);
				var elements = document.getElementsByName(name);
				if(elements.length == 0) {
					Util.error("Name is not found!");
					return [];
				}

				var type = elements[0].type;
				if(type == "radio") {
					return richElementByRadio(elements);
				} else if (type == "checkbox") {
					return richElementByCheckbox(elements);
				} else {
					Util.error("Element not read by name.");
				}

			} else {
				var name = args;
				var elements = document.getElementsByTagName(name);
				foreach(elements, function(item) {
					richElement(item);
				});
				if(elements.length == 1) {
					return elements[0];
				}

				// Util.error("Element not found.");
				return elements;
			} 
		};

		// 加载函数
		if(typeof args == "function") {
			window.onload = args;
		} else if(typeof args == "string") {
			return getElement(args);
		}
	};

	F.get = function(url, callback) {
		var xmlhttp;
		if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else { // code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
				callback(xmlhttp.responseText, "success");
			} else {
				// callback(null, xmlhttp.readyState);
			}
		}
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	};

	F.description = "轻量级Dom框架";

	return F;

}(util, document);
(function(F) {
    "use strict";

    // 添加 render 样式
    var addRenderStyle = function() {

        var styleElems = document.getElementsByTagName("style");　　　　
        if (styleElems.length == 0) {　　　　　　
            var tempStyle = document.createElement("style");　　　　　　
            tempStyle.setAttribute("type", "text/css");　　　　　　
            document.getElementsByTagName("head")[0].appendChild(tempStyle);　　　　
        }
        //如果页面中没有STYLE标签，则在HEAD中插入STYLE标签
        var styleElem = styleElems[0];

        //这里直接用数组的第一个元素
        if (styleElem.styleSheet) { //IE  
            styleElem.styleSheet.cssText += ".render{display:none}";
        } else { 
        	styleElem.appendChild(document.createTextNode(".render{display:none}"));
        }
    };
	
	if(window.initSwallow != false) {
		addRenderStyle();
	}

	var swallow = window.swallow;
	// console.log(swallow);

    /**
     * 获取数组
     */
    swallow.getNums = function(start, end, step) {
        if (start == null) {
            return [];
        } else if (end == null) {
            end = start;
            start = 0;
            step = 1;
        } else if (step == null) {
            step = 1;
        } 

        var array = [];
        for (var i = start; i < end; i += step) {
            array.push(i);
        }
        return array;
    };

    /**
     * 渲染全部
     */
    swallow.renderAll = function(data) {
        var elements = F(".render");
        for (var i = 0; i < elements.length; i++) {
            var ele = elements[i];
            var result = swallow.render(ele.html(), data);
            ele.html(result);
            ele.show();
        }
    };

    /**
     * 根据id渲染
     */
    swallow.renderById = function(id, data) {
        var source = F("#"+id).html();
        var result = swallow.render(source, data);
        F("#"+id).html(result);
        F("#"+id).show();
    };

    /**
     * 根据script模板渲染
     */
    swallow.renderByTpl = function(name, data) {
        var source = F("#"+name+"-tpl").html();
        var result = swallow.render(source, data);
        F("#"+name+"-target").html(result);
        F("#"+name+"-target").show();
    };

}(Flower));
