import Core from "../util/Core.js";

    var wm_js = document.scripts; 
    var wm_js_path = wm_js[wm_js.length - 1].src;
    if(wm_js_path&&wm_js_path.indexOf("partner")<0){
       wm_js_path = null;
    }

	function createWMXmlHttpRequest() {
		if (window.ActiveXObject) {

			return new ActiveXObject("Microsoft.XMLHTTP");
		} else {
			return new XMLHttpRequest();
		}
	}

	function getWMPartnerCode() {
		var src = wm_js_path?wm_js_path:getWMCurrentScript();
		console.log(src)
		if (src != "") {
			var s = src.split('/');
			s = s[s.length - 1].split('?');
			return s[0].replace("partner", "")
		}
		return "";
	}
	
	function getWMCurrentScript() {
		var doc = document;
		var a = {};
		var expose = +new Date();
		var rExtractUri = /((?:http|https|file):\/\/.*?\/[^:]+)(?::\d+)?:\d+/;
		var isLtIE8 = ('' + doc.querySelector).indexOf('[native code]') === -1;
		// FF,Chrome
		if (doc.currentScript) {
			return doc.currentScript.src;
		}

		var stack;
		try {
			a.b();
		} catch (e) {
			stack = e.fileName || e.sourceURL || e.stack || e.stacktrace;
		}
		// console.log("stack="+stack)
		//火狐
		if(navigator.userAgent.indexOf("Firefox")>0){
		  return stack;
		}
		// IE10
		if (stack) {
		   try {
			  var absPath = rExtractUri.exec(stack)[1];
			  if (absPath) {
				return absPath;
			  }
			} catch (e) {
			  return stack;
			}
		}

		// IE5-9
		for (var scripts = doc.scripts,
			i = scripts.length - 1,
			script; script = scripts[i--];) {
			if (script.className !== expose && script.readyState === 'interactive') {
				script.className = expose;
				// if less than ie 8, must get abs path by getAttribute(src, 4)
				return isLtIE8 ? script.getAttribute('src', 4) : script.src;
			}
		}
		return stack;

	}

	function isNullWM(a) {
		return a == "" || a == null || a == undefined;
	}

	
     initWM();
	function initWM() {
		// var url = urlHostWm + "/js/initLog";
		// var hrefUrl = window.location.href;
		// var browser = navigator.userAgent;
		// var terminalType = "PC";
		// if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
		// 	terminalType = "MOBILE"
		// }

		// var partnerCode = getWMPartnerCode();

		// var sendData = {
		// 	"partnerCode": partnerCode,
		// 	"hrefUrl": hrefUrl,
		// 	"browser": browser,
		// 	"terminalType": terminalType
		// };
		// var xmlHttpRequest = createWMXmlHttpRequest();

		// xmlHttpRequest.open("POST", url, true);
		// xmlHttpRequest.setRequestHeader("Content-type", "application/json; charset=utf-8");
		// xmlHttpRequest.send(JSON.stringify(sendData));
	}

	function __createWM(userAccount, userName, department, phone) {

		var url = Constants.root + "/authData/waterMarkConfig";
		var hrefUrl = window.location.href;
		var ua = navigator.userAgent;
		
		var terminalType = "PC";
		if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
			terminalType = "MOBILE"
		}

		var partnerCode = getWMPartnerCode();

        Core.post(url, (res) => {

            var result = res.data;

            if(result.width==null||result.width==""){
			    result.width = getTextWidth(result.content, result.fontSize +" " +result.font)+5;
			}
                    
            watermark.init({
                watermark_id: 'wm_div_id_' + userAccount,
                watermark_prefix: 'mask_div_id_' + userAccount,
                watermark_txt: result.content,
                watermark_font: result.font,
                watermark_color: result.colour,
                watermark_angle: result.rotationAngle,
                watermark_width: result.width,
                watermark_height: result.height,
                watermark_alpha: result.alpha,
                watermark_fontsize: result.fontSize
            });
        });

		// 屏蔽无用代码
        // var xmlHttpRequest = createWMXmlHttpRequest();

		// xmlHttpRequest.open("POST", url, true);
		// xmlHttpRequest.setRequestHeader("Content-type", "application/json; charset=utf-8");

		// xmlHttpRequest.onreadystatechange = function() {

		// 	if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
		// 		var result = JSON.parse(xmlHttpRequest.responseText);

		// 		if (result != null && result != "") {
		// 			if(result.width==null||result.width==""){
		// 			   result.width = getTextWidth(result.content, result.fontSize +" " +result.font)+5;
		// 			}
                    
		// 			watermark.init({
		// 				watermark_id: 'wm_div_id_' + userAccount,
		// 				watermark_prefix: 'mask_div_id_' + userAccount,
		// 				watermark_txt: result.content,
		// 				watermark_font: result.font,
		// 				watermark_color: result.colour,
		// 				watermark_angle: result.rotationAngle,
		// 				watermark_width: result.width,
		// 				watermark_height: result.height,
		// 				watermark_alpha: result.alpha,
		// 				watermark_fontsize: result.fontSize
		// 			});
		// 		}
		// 	}

		// }

		// var sendData = {
		// 	"partnerCode": partnerCode,
		// 	"userAccount": userAccount,
		// 	"userName": userName,
		// 	"browser": ua,
		// 	"terminalType": terminalType,
		// 	"hrefUrl": hrefUrl,
		// 	"dataType": "login",
		// 	"department": department,
		// 	"phone": phone
		// };

		// if (isNullWM(userAccount)) {
		// 	let oldUserAccount = JSON.parse(myStorage.getItem("_WM_userAccount"));
		// 	if(oldUserAccount){
		// 	   sendData = oldUserAccount;
		// 	}
		// 	sendData["browser"] = ua;
		//     sendData["terminalType"] = terminalType;
		//     sendData["hrefUrl"] = hrefUrl;
		//     sendData["dataType"] = "login";
		// }

		// xmlHttpRequest.send(JSON.stringify(sendData));
		// myStorage.setItem("_WM_userAccount", JSON.stringify(sendData));
	}

	function getTextWidth(text, font) {
		const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"))
		const context = canvas.getContext("2d")
		context.font = font
		const metrics = context.measureText(text)
		return metrics.width
	}

	window.myStorage = (new (function() {

		var storage;

		if (window.localStorage) {
			storage = localStorage;
		} else {
			storage = window.customCookieStorage;
		}

		this.setItem = function(key, value) {
			storage.setItem(key, value);
		};

		this.getItem = function(name) {
			return storage.getItem(name);
		};

		this.removeItem = function(key) {
			storage.removeItem(key);
		};

		this.clear = function() {
			storage.clear();
		};
	})());

	window.customCookieStorage = (new (function() {
		var maxage = 60 * 60 * 24 * 1000;
		var path = '/';

		var cookie = getCookie();

		function getCookie() {
			var cookie = {};
			var all = document.cookie;
			if (all === "")
				return cookie;
			var list = all.split("; ");
			for (var i = 0; i < list.length; i++) {
				var cookies = list[i];
				var p = cookies.indexOf("=");
				var name = cookies.substring(0, p);
				var value = cookies.substring(p + 1);
				try {
					value = decodeURIComponent(value);
					cookie[name] = value;
				} catch (e) {
					console.error('decode url error:' + value);
				}
			}
			return cookie;
		}

		var keys = [];
		for (var key in cookie)
			keys.push(key);

		this.length = keys.length;

		this.key = function(n) {
			if (n < 0 || n >= keys.length)
				return null;
			return keys[n];
		};

		this.setItem = function(key, value) {
			if (!(key in cookie)) {
				keys.push(key);
				this.length++;
			}

			cookie[key] = value;
			var cookies = key + "=" + encodeURIComponent(value);
			if (maxage)
				cookies += "; max-age=" + maxage;
			if (path)
				cookies += "; path=" + path;

			document.cookie = cookies;
		};

		this.getItem = function(name) {
			return cookie[name] || null;
		};

		this.removeItem = function(key) {
			if (!(key in cookie))
				return;

			delete cookie[key];

			for (var i = 0; i < keys.length; i++) {
				if (keys[i] === key) {
					keys.splice(i, 1);
					break;
				}
			}
			this.length--;

			document.cookie = key + "=; max-age=0";
		};

		this.clear = function() {
			for (var i = 0; i < keys.length; i++)
				document.cookie = keys[i] + "; max-age=0";
			cookie = {};
			keys = [];
			this.length = 0;
		};
	})());

	/*Just return a value to define the module export.*/
	var watermark = {};

	var defaultSettings = {
		watermark_id: 'wm_div_id',          //水印总体的id
		watermark_prefix: 'mask_div_id',    //小水印的id前缀
		watermark_txt: "测试水印",             //水印的内容
		watermark_x: 20,                     //水印起始位置x轴坐标
		watermark_y: 20,                     //水印起始位置Y轴坐标
		watermark_rows: 0,                   //水印行数
		watermark_cols: 0,                   //水印列数
		watermark_x_space: 50,              //水印x轴间隔
		watermark_y_space: 50,               //水印y轴间隔
		watermark_font: '微软雅黑',           //水印字体
		watermark_color: 'black',            //水印字体颜色
		watermark_fontsize: '18px',          //水印字体大小
		watermark_alpha: 0.15,               //水印透明度，要求设置在大于等于0.005
		watermark_width: 100,                //水印宽度
		watermark_height: 100,               //水印长度
		watermark_angle: 15,                 //水印倾斜度数
		watermark_parent_width: 0,      //水印的总体宽度（默认值：body的scrollWidth和clientWidth的较大值）
		watermark_parent_height: 0,     //水印的总体高度（默认值：body的scrollHeight和clientHeight的较大值）
		watermark_parent_node: null,     //水印插件挂载的父元素element,不输入则默认挂在body上
		monitor: true,                   //monitor 是否监控， true: 不可删除水印; false: 可删水印。
	};

	var settingsToDefaultSetting = function(settings) {
		defaultSettings.watermark_id = settings.watermark_id || defaultSettings.watermark_id;
		defaultSettings.watermark_prefix = settings.watermark_prefix || defaultSettings.watermark_prefix;
		defaultSettings.watermark_txt = settings.watermark_txt || defaultSettings.watermark_txt;
		defaultSettings.watermark_x = settings.watermark_x || defaultSettings.watermark_x;
		defaultSettings.watermark_y = settings.watermark_y || defaultSettings.watermark_y;
		defaultSettings.watermark_rows = settings.watermark_rows || defaultSettings.watermark_rows;
		defaultSettings.watermark_cols = settings.watermark_cols || defaultSettings.watermark_cols;
		defaultSettings.watermark_x_space = settings.watermark_x_space || defaultSettings.watermark_x_space;
		defaultSettings.watermark_y_space = settings.watermark_y_space || defaultSettings.watermark_y_space;
		defaultSettings.watermark_font = settings.watermark_font || defaultSettings.watermark_font;
		defaultSettings.watermark_color = settings.watermark_color || defaultSettings.watermark_color;
		defaultSettings.watermark_fontsize = settings.watermark_fontsize || defaultSettings.watermark_fontsize;
		defaultSettings.watermark_alpha = parseFloat(settings.watermark_alpha || defaultSettings.watermark_alpha);
		defaultSettings.watermark_width = parseInt(settings.watermark_width || defaultSettings.watermark_width);
		defaultSettings.watermark_height = parseInt(settings.watermark_height || defaultSettings.watermark_height);
		defaultSettings.watermark_angle = settings.watermark_angle || defaultSettings.watermark_angle;
		defaultSettings.watermark_parent_width = settings.watermark_parent_width || defaultSettings.watermark_parent_width;
		defaultSettings.watermark_parent_height = settings.watermark_parent_height || defaultSettings.watermark_parent_height;
		defaultSettings.watermark_parent_node = settings.watermark_parent_node || defaultSettings.watermark_parent_node;
		defaultSettings.monitor = settings.monitor || defaultSettings.monitor;
	}

    
	/*加载水印*/
	var loadMark;
	loadMark = function(settings) {
		/*采用配置项替换默认值，作用类似jquery.extend*/
		if (arguments.length === 1 && typeof arguments[0] === "object") {
			// var src = arguments[0] || {};
            var src = {};
			for (key in src) {
				if (src[key] && defaultSettings[key] && src[key] === defaultSettings[key]) continue;
				/*veronic: resolution of watermark_angle=0 not in force*/
				else if (src[key] || src[key] === 0) defaultSettings[key] = src[key];
			}
		}

		settingsToDefaultSetting(settings);
        // console.log(defaultSettings)
		/*如果元素存在则移除*/
		var watermark_element = document.getElementById(defaultSettings.watermark_id);
		watermark_element && watermark_element.parentNode && watermark_element.parentNode.removeChild(watermark_element);

		/*如果设置水印挂载的父元素的id*/
		var watermark_parent_element = document.getElementById(defaultSettings.watermark_parent_node);
		var watermark_hook_element = watermark_parent_element ? watermark_parent_element : document.body;

		

		/*获取页面宽度*/
		var page_width = Math.max(watermark_hook_element.scrollWidth, watermark_hook_element.clientWidth);
		/*获取页面最大长度*/
		//var page_height = Math.max(watermark_hook_element.scrollHeight, watermark_hook_element.clientHeight);
        var page_height = window.innerHeight;
        
		var setting = arguments[0] || {};
		var parentEle = watermark_hook_element;

		var page_offsetTop = 0;
		var page_offsetLeft = 0;
		if (setting.watermark_parent_width || setting.watermark_parent_height) {
			/*指定父元素同时指定了宽或高*/
			if (parentEle) {
				page_offsetTop = parentEle.offsetTop || 0;
				page_offsetLeft = parentEle.offsetLeft || 0;
				defaultSettings.watermark_x = defaultSettings.watermark_x + page_offsetLeft;
				defaultSettings.watermark_y = defaultSettings.watermark_y + page_offsetTop;
			}
		} else {
			if (parentEle) {
				page_offsetTop = parentEle.offsetTop || 0;
				page_offsetLeft = parentEle.offsetLeft || 0;
			}
		}

		/*创建水印外壳div*/
		var otdiv = document.getElementById(defaultSettings.watermark_id);
		var shadowRoot = null;

		if (!otdiv) {
			otdiv = document.createElement('div');
			/*创建shadow dom*/
			otdiv.id = defaultSettings.watermark_id;
			otdiv.setAttribute('style', 'pointer-events: none !important; display: block !important;position: fixed;top: 0;left: 0;width: 100%;height: 100%;overflow: hidden;z-index:9999;');
			/*判断浏览器是否支持attachShadow方法*/
			if (typeof otdiv.attachShadow === 'function') {
				/* createShadowRoot Deprecated. Not for use in new websites. Use attachShadow*/
				shadowRoot = otdiv.attachShadow({ mode: 'open' });
			} else {
				shadowRoot = otdiv;
			}
			/*将shadow dom随机插入body内的任意位置*/
			var nodeList = watermark_hook_element.children;
			var index = Math.floor(Math.random() * (nodeList.length - 1));
			if (nodeList[index]) {
				watermark_hook_element.insertBefore(otdiv, nodeList[index]);
			} else {
				watermark_hook_element.appendChild(otdiv);
			}
		} else if (otdiv.shadowRoot) {
			shadowRoot = otdiv.shadowRoot;
		}
		/*三种情况下会重新计算水印列数和x方向水印间隔：1、水印列数设置为0，2、水印宽度大于页面宽度，3、水印宽度小于于页面宽度*/
		defaultSettings.watermark_cols = parseInt((page_width - defaultSettings.watermark_x) / (defaultSettings.watermark_width + defaultSettings.watermark_x_space) || 0);
		var temp_watermark_x_space = parseInt((page_width - defaultSettings.watermark_x - defaultSettings.watermark_width * defaultSettings.watermark_cols) / (defaultSettings.watermark_cols));
		defaultSettings.watermark_x_space = temp_watermark_x_space ? defaultSettings.watermark_x_space : temp_watermark_x_space;
		var allWatermarkWidth;

		

		/*三种情况下会重新计算水印行数和y方向水印间隔：1、水印行数设置为0，2、水印长度大于页面长度，3、水印长度小于于页面长度*/
		// console.log(page_height, 'a', defaultSettings.watermark_y, 'b', defaultSettings.watermark_height, 'c', defaultSettings.watermark_y_space, 'd');
		defaultSettings.watermark_rows = parseInt((page_height - defaultSettings.watermark_y) / (defaultSettings.watermark_height + defaultSettings.watermark_y_space) || 0);
		var temp_watermark_y_space = parseInt((page_height - defaultSettings.watermark_y - defaultSettings.watermark_height * defaultSettings.watermark_rows) / (defaultSettings.watermark_rows));
		defaultSettings.watermark_y_space = temp_watermark_y_space ? defaultSettings.watermark_y_space : temp_watermark_y_space;
		var allWatermarkHeight;

		if (watermark_parent_element) {
			allWatermarkWidth = defaultSettings.watermark_x + defaultSettings.watermark_width * defaultSettings.watermark_cols + defaultSettings.watermark_x_space * (defaultSettings.watermark_cols - 1);
			allWatermarkHeight = defaultSettings.watermark_y + defaultSettings.watermark_height * defaultSettings.watermark_rows + defaultSettings.watermark_y_space * (defaultSettings.watermark_rows - 1);
		} else {
			allWatermarkWidth = page_offsetLeft + defaultSettings.watermark_x + defaultSettings.watermark_width * defaultSettings.watermark_cols + defaultSettings.watermark_x_space * (defaultSettings.watermark_cols - 1);
			allWatermarkHeight = page_offsetTop + defaultSettings.watermark_y + defaultSettings.watermark_height * defaultSettings.watermark_rows + defaultSettings.watermark_y_space * (defaultSettings.watermark_rows - 1);
		}

		var x;
		var y;
		//console.log(defaultSettings.watermark_cols, '12121221212')
		//console.log(defaultSettings.watermark_rows, '67676767767')
		for (var i = 0; i < defaultSettings.watermark_rows; i++) {
			if (watermark_parent_element) {
				y = page_offsetTop + defaultSettings.watermark_y + (page_height - allWatermarkHeight) / 2 + (defaultSettings.watermark_y_space + defaultSettings.watermark_height + 200) * i;
			} else {
				y = defaultSettings.watermark_y + (page_height - allWatermarkHeight) / 2 + (defaultSettings.watermark_y_space + defaultSettings.watermark_height + 200) * i;
			}
			for (var j = 0; j < defaultSettings.watermark_cols; j++) {
				if (watermark_parent_element) {
					x = page_offsetLeft + defaultSettings.watermark_x + (page_width - allWatermarkWidth) / 2 + (defaultSettings.watermark_width + defaultSettings.watermark_x_space + 200) * j;
				} else {
					x = defaultSettings.watermark_x + (page_width - allWatermarkWidth) / 2 + (defaultSettings.watermark_width + defaultSettings.watermark_x_space + 200) * j;
				}
                
				var mask_div = document.createElement('div');
				var oText = document.createTextNode(defaultSettings.watermark_txt);
				mask_div.appendChild(oText);
				/*设置水印相关属性start*/
				mask_div.id = defaultSettings.watermark_prefix + i + j;
				/*设置水印div倾斜显示*/
				mask_div.style.webkitTransform = "rotate(" + defaultSettings.watermark_angle + "deg)";
				mask_div.style.MozTransform = "rotate(" + defaultSettings.watermark_angle + "deg)";
				mask_div.style.msTransform = "rotate(" + defaultSettings.watermark_angle + "deg)";
				mask_div.style.OTransform = "rotate(" + defaultSettings.watermark_angle + "deg)";
				mask_div.style.transform = "rotate(" + defaultSettings.watermark_angle + "deg)";
				mask_div.style.visibility = "";
				mask_div.style.position = "absolute";
				/*选不中*/
				mask_div.style.left = x + 'px';
				mask_div.style.top = y + 'px';
				mask_div.style.overflow = "hidden";
				mask_div.style.zIndex = "9999999";
				mask_div.style.opacity = defaultSettings.watermark_alpha;
				mask_div.style.fontSize = defaultSettings.watermark_fontsize;
				mask_div.style.fontFamily = defaultSettings.watermark_font;
				mask_div.style.color = defaultSettings.watermark_color;
				mask_div.style.textAlign = "center";
				mask_div.style.width = defaultSettings.watermark_width + 'px';
				mask_div.style.height = defaultSettings.watermark_height + 'px';
				mask_div.style.display = "block";
				mask_div.style['-ms-user-select'] = "none";
				/*设置水印相关属性end*/
				shadowRoot.appendChild(mask_div);
			}
		}

		watermarkDom.observe(watermark_hook_element, option);
		watermarkDom.observe(document.getElementById(defaultSettings.watermark_id).shadowRoot, option);
	};
	var globalSetting;
	/*初始化水印，添加load和resize事件*/
	watermark.init = function(settings) {
		console.log(settings, 'settings')
		globalSetting = settings;
		loadMark(settings);
		window.addEventListener('onload', function() {
			loadMark(settings);
		});
		window.addEventListener('resize', function() {
			loadMark(settings);
		});
	};

	/*手动加载水印*/
	watermark.load = function(settings) {
		//console.log(settings, 'settings')
		globalSetting = settings;
		loadMark(settings);
	};

	//监听dom是否被移除或者改变属性的回调函数
	var callback = function(records) {
		if ((globalSetting && records.length === 1) || records.length === 1 && records[0].removedNodes.length >= 1) {
			loadMark(globalSetting);
		}
	};
	const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	var watermarkDom = new MutationObserver(callback);
	var option = {
		'childList': true,
		'attributes': true,
		'subtree': true,
	};


export default {
    createWM: __createWM
};