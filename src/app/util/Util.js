
    /**
     * 用法 date.format("yy-MM-dd HH:mm:ss");
     * @param {type} fmt
     * @returns {unresolved}
     */
    Date.prototype.format = function (fmt) {
        // 默认值
        if (fmt == null) {
            fmt = "yyyy-MM-dd HH:mm:ss";
        }
        var o = {
            "M+": this.getMonth() + 1, // 月份
            "d+": this.getDate(), // 日
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, // 小时
            "H+": this.getHours(), // 小时
            "m+": this.getMinutes(), // 分
            "s+": this.getSeconds(), // 秒
            "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
            "S": this.getMilliseconds()
                    // 毫秒
        };
        var week = {
            "0": "/u65e5",
            "1": "/u4e00",
            "2": "/u4e8c",
            "3": "/u4e09",
            "4": "/u56db",
            "5": "/u4e94",
            "6": "/u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
                    .substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt
                    .replace(
                            RegExp.$1,
                            ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f"
                                    : "/u5468")
                                    : "")
                            + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                        : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };

    //格式化代码函数,已经用原生方式写好了不需要改动,直接引用就好
    String.prototype.removeLineEnd = function() {
        return this.replace(/(<.+?\s+?)(?:\n\s*?(.+?=".*?"))/g, '$1 $2')
    }

    function formatXml(text) {
        //去掉多余的空格
        text = '\n' + text.replace(/(<\w+)(\s.*?>)/g, function($0, name, props) {
            return name + ' ' + props.replace(/\s+(\w+=)/g, " $1");
        }).replace(/>\s*?</g, ">\n<");

        //把注释编码
        text = text.replace(/\n/g, '\r').replace(/<!--(.+?)-->/g, function($0, text) {
            var ret = '<!--' + escape(text) + '-->';
            //alert(ret);
            return ret;
        }).replace(/\r/g, '\n');

        //调整格式
        var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
        var nodeStack = [];
        var output = text.replace(rgx, function($0, all, name, isBegin, isCloseFull1, isCloseFull2, isFull1, isFull2) {
            var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/') || (isFull1 == '/') || (isFull2 == '/');
            //alert([all,isClosed].join('='));
            var prefix = '';
            if (isBegin == '!') {
                prefix = getPrefix(nodeStack.length);
            } else {
                if (isBegin != '/') {
                    prefix = getPrefix(nodeStack.length);
                    if (!isClosed) {
                        nodeStack.push(name);
                    }
                } else {
                    nodeStack.pop();
                    prefix = getPrefix(nodeStack.length);
                }

            }
            var ret = '\n' + prefix + all;
            return ret;
        });

        var prefixSpace = -1;
        var outputText = output.substring(1);
        //alert(outputText);

        //把注释还原并解码，调格式
        outputText = outputText.replace(/\n/g, '\r').replace(/(\s*)<!--(.+?)-->/g, function($0, prefix, text) {
            //alert(['[',prefix,']=',prefix.length].join(''));
            if (prefix.charAt(0) == '\r')
                prefix = prefix.substring(1);
            text = unescape(text).replace(/\r/g, '\n');
            var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix) + '-->';
            //alert(ret);
            return ret;
        });

        return outputText.replace(/\s+$/g, '').replace(/\r/g, '\r\n');
    }

    function getPrefix(prefixIndex) {
        var span = '    ';
        var output = [];
        for (var i = 0; i < prefixIndex; ++i) {
            output.push(span);
        }

        return output.join('');
    }

    var formatJson = function (json, options) {
        var reg = null,
            formatted = '',
            pad = 0,
            PADDING = '    ';
        options = options || {};
        options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
        options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
        if (typeof json !== 'string') {
            json = JSON.stringify(json);
        } else {
            json = JSON.parse(json);
            json = JSON.stringify(json);
        }
        reg = /([\{\}])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        reg = /([\[\]])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        reg = /(\,)/g;
        json = json.replace(reg, '$1\r\n');
        reg = /(\r\n\r\n)/g;
        json = json.replace(reg, '\r\n');
        reg = /\r\n\,/g;
        json = json.replace(reg, ',');
        if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
            reg = /\:\r\n\{/g;
            json = json.replace(reg, ':{');
            reg = /\:\r\n\[/g;
            json = json.replace(reg, ':[');
        }
        if (options.spaceAfterColon) {
            reg = /\:/g;
            json = json.replace(reg, ':');
        }
        (json.split('\r\n')).forEach(function (node, index) {
                var i = 0,
                    indent = 0,
                    padding = '';
                if (node.match(/\{$/) || node.match(/\[$/)) {
                    indent = 1;
                } else if (node.match(/\}/) || node.match(/\]/)) {
                    if (pad !== 0) {
                        pad -= 1;
                    }
                } else {
                    indent = 0;
                }
                for (i = 0; i < pad; i++) {
                    padding += PADDING;
                }
                if(node == "") {
                    formatted += padding + node + '\r\n';
                }
                pad += indent;
            }
        );
        return formatted;
    };

    var formatJson2 = function(txt, compress) {
        compress = compress || false;
        var indentChar = '    ';
        if (/^\s*$/.test(txt)) {
            console.log('数据为空,无法格式化! ');
            return;
        }
        try {
            var data = eval('(' + txt + ')');
        } catch (e) {
            console.log('数据源语法错误,格式化失败! 错误信息: ' + e.description, 'err');
            return;
        }
        var draw = [],
            last = false,
            This = this,
            line = compress ? '' : '\n',
            nodeCount = 0,
            maxDepth = 0;
    
        var notify = function (name, value, isLast, indent, formObj) {
            nodeCount++; /*节点计数*/
            for (var i = 0, tab = ''; i < indent; i++)
                tab += indentChar; /* 缩进HTML */
            tab = compress ? '' : tab; /*压缩模式忽略缩进*/
            maxDepth = ++indent; /*缩进递增并记录*/
            if (value && value.constructor == Array) {
                /*处理数组*/
                draw.push(
                    tab + (formObj ? '"' + name + '":' : '') + '[' + line
                ); /*缩进'[' 然后换行*/
                for (var i = 0; i < value.length; i++)
                    notify(i, value[i], i == value.length - 1, indent, false);
                draw.push(
                    tab + ']' + (isLast ? line : ',' + line)
                ); /*缩进']'换行,若非尾元素则添加逗号*/
            } else if (value && typeof value == 'object') {
                /*处理对象*/
                draw.push(
                    tab + (formObj ? '"' + name + '":' : '') + '{' + line
                ); /*缩进'{' 然后换行*/
                var len = 0,
                    i = 0;
                for (var key in value)
                    len++;
                for (var key in value)
                    notify(key, value[key], ++i == len, indent, true);
                draw.push(
                    tab + '}' + (isLast ? line : ',' + line)
                ); /*缩进'}'换行,若非尾元素则添加逗号*/
            } else {
                if (typeof value == 'string') value = '"' + value + '"';
                draw.push(
                    tab +
                    (formObj ? '"' + name + '":' : '') +
                    value +
                    (isLast ? '' : ',') +
                    line
                );
            }
        };
        var isLast = true,
            indent = 0;
        notify('', data, isLast, indent, false);
        return draw.join('');
    };

    (function() {
        //引用示例部分
        //(1)创建xml格式或者从后台拿到对应的xml格式
        var originalXml = '<?xml version="1.0"?> <note> <to>Tove</to> <from>Jani</from> <heading>Reminder</heading> <body>Dont forget me this weekend!</body> </note>';
        //(2)调用formatXml函数,将xml格式进行格式化
        var resultXml = formatXml(originalXml);
        console.log(resultXml);
    });


    var baseTypes = [
        '[object String]',
        '[object Number]',
        '[object Boolean]',
        '[object Undefined]',
        '[object Null]',
        '[object Date]'
    ];

    var Util = {
        size: function(obj) {
            if(this.isArray(obj)) {
                return obj.length;
            } else {
                var i = 0;
                for(var _ in obj) {
                    i ++;
                }
                return i;
            }
        },
        getType: function(obj) {
            return Object.prototype.toString.call(obj);
        },
        // 判断是否基础类型
        isBaseType: function(obj) {
            var type = this.getType(obj);
            for(var i in baseTypes) {
                var bType = baseTypes[i];
                if(type == bType) {
                    return true;
                }
            }
            return false;
        },
        isString: function(obj) {
            return this.getType(obj) == '[object String]' ;
        },
        isArray: function(obj) {
            return this.getType(obj) == '[object Array]' ;
        },
        isObject: function(obj) {
            return this.getType(obj) == '[object Object]' ;
        },
        isFunction: function(obj) {
            return this.getType(obj) == '[object Function]' ;
        },
        isNumberStr: function(obj) {
            return !isNaN(new Number(obj));
        },
        /**
         * 判断数组是否相等
         * @param {Array} array1 
         * @param {Array} array2 
         */
        isArrayEqual: function(array1, array2) {
            if(array1.length == array2.length) {
                for(var i in array1) {
                    if(array1[i] != array2[i]) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        inArray: function(target, array) {
            for(var i in array) {
                var obj = array[i];
                if(target == obj) {
                    return true;
                }
            }
            return false;
        },
        toMap: function(arr) {
            var map = {};
            for(var i in arr) {
                var value = arr[i];
                map[value] = value;
            }
            return map;
        },
        // 数组分割 每个数组size个元素（不是分割成 size 个数组）
        splitArray: function(arr, size) {
            var result = [];
            var len = arr.length;
            for(var i = 0; i < len; i += size){
                result.push(arr.slice(i, i + size));
            }
            return result;
        },
        // 转map
        toStrMap: function(obj) {
            var map = {};
            for(var key in obj) {
                var value = obj[key];
                if(!this.isBaseType(value)) {
                    value = JSON.stringify(value, 4);
                }
                map[key] = value;
            }
            return map;
        },
        // 克隆对象
        clone: function(obj) {
            return JSON.parse( JSON.stringify(obj) );
        },
        cloneMap: function(obj) {
            var map = {};
            for(var key in obj) {
                map[key] = obj[key];
            }
            return map;
        },
        // 仅克隆基础类型属性
        cloneBase: function(obj) {
            var newObj = {};
            for(var key in obj) {
                var value = obj[key];
                if(this.isBaseType(value)) {
                    newObj[key] = value;
                }
            }
            return newObj;
        },
        // 仅克隆基础类型属性
        cloneBaseOld: function(obj) {
            var cloneObj = this.clone(obj);
            var newObj = {};
            for(var key in cloneObj) {
                var value = cloneObj[key];
                if(this.isBaseType(value)) {
                    newObj[key] = value;
                }
            }
            return newObj;
        },
        isBlank: function(str) {
            if(str == null || str == '' || str == undefined) {
                return true;
            } else {
                return false;
            }
        },
        isTextBlank: function(str) {
            if(str == null || str == '') {
                return true;
            } else {
                if(str.trim() == '') {
                    return true;
                }
                return false;
            }
        },
        isNotBlank: function(str) {
            return !this.isBlank(str);
        },
        clearBlank: function(param) {
            for(var key in param) {
                if(this.isBlank(param[key])) {
                    delete param[key]
                }
            }
        },
        deleteIndex: function(arr, index) {
            arr.splice(index, 1);
        },
        arrayDelete: function(arr, val) {
            var index = arr.indexOf(val);
            if (index > -1) {
                arr.splice(index, 1);
            }
        },
        swapArray: function(arr, i1, i2) {
            // console.log(arr);
            var arr2 = [];
            for(var i in arr) {
                if(i == i1) {
                    arr2.push(arr[i2]);
                } else if(i == i2) {
                    arr2.push(arr[i1]);
                } else {
                    arr2.push(arr[i]);
                }
            }
            // console.log(arr2);
            return arr2;
        },
        /**
         * [parse 根据字符串返回Date 类型]
         * yyyy--MM--dd HH:mm:ss
         * 2012--01--12 14:14:59
         */
        dateParse : function (fmt, str) {
            var map = {
                year: "y",
                day: "d",
                month: "M",
                hour: "H",
                minute: "m",
                second: "s"
            };

            // 获取值
            var getMapValure = function (type) {
                var start = fmt.indexOf(type);
                if(start == -1) {
                    return 0;
                }
                var end = fmt.lastIndexOf(type);
                return str.substring(start, end + 1);
            };

            var year = getMapValure(map.year);
            var month = getMapValure(map.month);
            var day = getMapValure(map.day);
            var hour = getMapValure(map.hour);
            var minute = getMapValure(map.minute);
            var second = getMapValure(map.second);

            return new Date(year, month - 1, day, hour, minute, second);
        },
        // 除去两边空白 
        trim : function(str) {
            if(this.isString(str)) {
                return str.replace(/(^\s+)|(\s+$)/g, "");
            } else {
                return str;
            }
        },
        trimMapField : function(map) {
            for(var key in map) {
                var value = map[key];
                value = this.trim(value);
                map[key] = value;
            }
        },
        getStrCount(scrstr, armstr) { //scrstr 源字符串 armstr 特殊字符
            var count=0;
            while(scrstr.indexOf(armstr) != -1 ) {
               scrstr = scrstr.replace(armstr,"")
               count++;    
            }
            return count;
        },
        formatXml: formatXml,
        formatJson: formatJson,
        formatJson2: formatJson2,
        formatIf: function(str) {
            var result = this.formatXmlOrJson(str);
            if(result != null) {
                return result;
            }
            return str;
        },
        // 猜测文本格式
        guessTextFormat: function(str) {
            str = str.trim();
            if(str.indexOf('{') == 0) {
                return 'json';
            } else if(str.indexOf('[') == 0) {
                return 'json';
            } else if(str.indexOf('<') == 0) {
                return xml;
            }
        },
        formatXmlOrJson: function(str) {
            var jsonSize = this.getStrCount(str, '{');
            var xmlSize = this.getStrCount(str, '<');
            if(jsonSize > xmlSize) {
                return formatJson2(str);
            } else {
                return formatXml(str);
            }
        },
        
        changeColor: function(col, amt) {
        
            var usePound = false;
        
            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }
        
            var num = parseInt(col,16);
        
            var r = (num >> 16) + amt;
        
            if (r > 255) r = 255;
            else if  (r < 0) r = 0;
        
            var b = ((num >> 8) & 0x00FF) + amt;
        
            if (b > 255) b = 255;
            else if  (b < 0) b = 0;
        
            var g = (num & 0x0000FF) + amt;
        
            if (g > 255) g = 255;
            else if (g < 0) g = 0;
        
            return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
        
        },
        // 分转元
        centToYuan: function(cent) {
            return cent / 100;
        },
        // 分转万元
        centToWan: function(cent, size) {

        },
        // 左对齐
        splitStrByLen: function(str, len) {
            var strArr = [];
            var totalLen = str.length;
            for (var i = 0; i < totalLen / len; i++) { 
                var a = str.slice(len * i, len * (i + 1));
                strArr.push(a); 
            } 
            return strArr;
        },
        // 右对齐
        splitStrByLenRight: function(str, len) {
            var totalLen = str.length;
            var firstLen = totalLen % len;
            var firstStr;
            if(firstLen > 0) {
                firstStr = str.slice(0, firstLen);
            }

            str = str.slice(firstLen);
            var strArr = this.splitStrByLen(str, len);
            if(firstStr != null) {
                strArr.unshift(firstStr);
            }
            return strArr;
        },
        // 三位分节法 TODO 支持小数
        numberThreePart: function(num) {
            var arr = this.splitStrByLenRight(num, 3);
            return arr.join(",");
        },
        isIE: function() {
            if(!!window.ActiveXObject || "ActiveXObject" in window){
                return true;
            } else {
                return false;
            }
        },
        // 判断是否昨天
        isAfterDay: function() {

        },
        pairToMap: function(arr) {
            var map = {};
            for(var i in arr) {
                var pair = arr[i];
                var key = pair.key;
                var value = pair.value;
                if(key != null && key != '') {
                    map[key] = value;
                }
            }
            return map;
        },
        // url解析，hash参数解析
        urlParse: function(url, parseQuery) {
            if(parseQuery == null) {
                parseQuery = true;
            }
            var info = URLParse(url, parseQuery);
            var hash = info.hash;
            if(hash != null) {
                var hashTest = 'http://test.com?' + hash.substring(hash.indexOf('?') + 1);
                var hashInfo = URLParse(hashTest, true);
                info.hashQuery = hashInfo.query;
                info.hashPath = hash.split('?')[0];
            }
            return info;
        },
        currentHash: function() {
            var info = this.urlParse(location.href, true);
            return info.hashQuery;
        },
        /**
         * changeURLStatic 修改地址栏 URL参数 不跳转
         * @param name
         * @param value
         */
        changeURLStatic(name, value) {
            let url = this.changeURLParam(location.href, name, value); // 修改 URL 参数
            history.replaceState(null, null, url);  // 替换地址栏
        },
        /**
         * changeURLParam 修改 URL 参数
         * @param url
         * @param name
         * @param value
         * @returns {string}
         */
        changeURLParam(url, name, value) {
            if (typeof value === 'string') {
                value = value.toString().replace(/(^\s*)|(\s*$)/, ""); // 移除首尾空格
            }
            let url2;
            if (!value) { // remove
                let reg = eval('/(([\?|&])' + name + '=[^&]*)(&)?/i');
                let res = url.match(reg);
                if (res) {
                    if (res[2] && res[2] === '?') { // before has ?
                        if (res[3]) { // after has &
                            url2 = url.replace(reg, '?');
                        } else {
                            url2 = url.replace(reg, '');
                        }
                    } else {
                        url2 = url.replace(reg, '$3');
                    }
                }
            } else {
                let reg = eval('/([\?|&]' + name + '=)[^&]*/i');
                if (url.match(reg)) { // edit
                    url2 = url.replace(reg, '$1' + value);
                } else { // add
                    let reg = /([?](\w+=?)?)[^&]*/i;
                    let res = url.match(reg);
                    url2 = url;
                    if (res) {
                        if (res[0] !== '?') {
                            url2 += '&';
                        }
                    } else {
                        url2 += '?';
                    }
                    url2 += name + '=' + value;
                }
            }
            return url2;
        },
 
        /**
         * 用法 date.format('yy-MM-dd HH:mm:ss');
         * @param {type} fmt
         * @returns {unresolved}
         */
        dateFormat (date, fmt) {
            // 默认值
            if (fmt == null) {
            fmt = 'yyyy-MM-dd HH:mm:ss'
            }
            var o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, // 小时
            'H+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
            }
            var week = {
            '0': '/u65e5',
            '1': '/u4e00',
            '2': '/u4e8c',
            '3': '/u4e09',
            '4': '/u56db',
            '5': '/u4e94',
            '6': '/u516d'
            }
            if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
            }
            if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + ''])
            }
            for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
            }
            }
            return fmt
        },
        /**
         * 获取指定时间的n天后的时间戳
         * @param {number} n 天数
         * @returns {Number} 返回值为时间毫秒值
         */
        toNextTimes(time,n){
            let timestamp = +time + n * 86400000;
            return new Date(timestamp);
        },

        UUID(){
            var time = function(){
                var time = (new Date()).valueOf();
                return parseInt(time/1000);
            }
            return 'uuid_'+time()+'_'+Math.ceil(Math.random()*10000)
        }
    };

    // 全局监听器
    window.GlobalEvent = {
        listeners: {},
        // 事件推送
        $emit(eventId, data) {
            var _call = this.listeners[eventId];
            if(_call != null) {
                _call(data);
            }
        },
        // 监听器注册
        addEventListener(eventId, _call) {
            this.listeners[eventId] = _call;
        }
    };

    window.GlobalIframe = {
        iframe: {},
        $reg(iframeId, iframe) {
            this.iframe[iframeId] = iframe;
        },
        get(iframeId) {
            return this.iframe[iframeId];
        }
    };
    

    window.Util = Util;

export default Util;

