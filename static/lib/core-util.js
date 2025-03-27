var Flag = function() {};
var LoadMerge = function(obj) {
    logTime();
    for(var key in obj) {
        Merge[key] = obj;
    }
    logTime();
};
var Tool = {
    // 替代全部
    replaceAll: function (data, str, target) {
        var exp = new RegExp(str, "gm")
        data = data.replace(exp, target);
        return data;
    },
    
    replaceEscapedChars: function(str, search, replacement) {
        // 对输入的搜索和替换字符串中的转义字符进行处理
        search = search.replace(/\\n/g, '\\n').replace(/\\r/g, '\\r').replace(/\\t/g, '\\t');
        replacement = replacement.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
    
        // 使用正则表达式和全局标志来替换所有匹配项
        var regex = new RegExp(search.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), 'g');
        return str.replace(regex, replacement);
    }
};
var exports = {};
var CoreUtil = {
    requestMap: {},
    isIE: function() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
        //判断是否IE<11浏览器  
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; 
        //判断是否IE的Edge浏览器  
        // var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; 
        var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
        if(isIE || isIE11) {
            return true;
        } else {
            return false;
        }
    },
    
    // use full url
    // 相对路径不好确定模块唯一性，根路径就是 /static 啊
    // 请求路径是 ../static/lib/pure/httpVuePlus2.js 那就必须是 /static/lib/pure/httpVuePlus2.js
    // 如何计算全路径
    // 如果多部署了一层 root，那全路径就是 /root/static/lib/pure/httpVuePlus2.js，这个root也应该最后才加上！不影响其它流程！
    // 这里可以先手动设置一下，根路径就是 /
    // 然后页面地址是 /compile/require.html
    // 直接相加就是 /compile/../static/lib/pure/httpVuePlus2.js
    // 页面用相对路径引入，但首先我要拿到全路径，全路径才能保证唯一性！

    // 正确例子
    // actualUrl: ./html/index/util/locales/en.js
    // parentUrl: html/index/util/i18n.js
    // lastUrl:./locales/en.js

    // 错误例子
    // actualUrl: ./html/index/apps/mine/mine-ai/html/index/apps/mine/mine-ai/mine-game-ai-v2/overlap-region-strategy.js
    // parentUrl: html/index/apps/mine/mine-ai/mine-game-ai-v2.js
    // lastUrl:/html/index/apps/mine/mine-ai/mine-game-ai-v2/overlap-region-strategy.js
    // 这里正确应该是 ./html/index/apps/mine/mine-ai/mine-game-ai-v2/overlap-region-strategy.js
    actualUrl: function(url, parentUrl) {
        if(url.indexOf('@') == 0) {
            return url.substring(1);
        }
        if(url.indexOf('/') == 0) {
            return url;
        }
        if(parentUrl != null) {
            var baseUrl = parentUrl.substring(0, parentUrl.lastIndexOf('/') + 1);
            url = baseUrl + url;
        }
        // 解析url
        // console.log('url', url);
        // console.log('window.contextPath', window.contextPath);
        if(window.contextPath != null) {
            url = window.contextPath + url;
        }
        
        // 首次引入需要 window.pagePath，即当前请求时的 html 请求路径
        if(parentUrl == null) {
            if(window.pagePath != null) {
                url = window.pagePath + url;
            } else {
                url = './' + url;
            }
        }
        // console.log('before shortUrl', url);
        url = CoreUtil.shortUrl(url);

        if(url == '/main.js') {
            url = './main.js';
        }
        // console.log('shortUrl', url);
        return url;
    },
    shortUrl: function(url) {
        // 处理 URL 逻辑的辅助函数 
        var shortUrlByI = function(urls, i, j) {
            // 如果 j 为 null，意味着只需要删除一个元素  
            if(j == null) {
                urls.splice(i, 1);
                return urls;
            }
            // 删除两个路径部分  
            if(i > j) {
                urls.splice(i, 1);
                urls.splice(j, 1);
            } else {
                urls.splice(j, 1);
                urls.splice(i, 1);
            }
            return urls;
        };
        // 主处理函数  
        var processUrls = function(urls) {  
            for (var i = 0; i < urls.length; i++) {  
                var url = urls[i];  
                if (url === '..') {  
                    // 处理 '..' 的逻辑  
                    if (i > 0 && urls[i - 1] !== '..') {  
                        return processUrls(shortUrlByI(urls, i, i - 1));  
                    }  
                } else if (url === '.' || url === '') {  
                    // 处理 '.' 和空字符串的逻辑  
                    return processUrls(shortUrlByI(urls, i));  
                }  
            }  
            return urls;  
        };  
        
        // 初始分割  
        var urls = url.split('/');  
        // 处理路径  
        urls = processUrls(urls);  
        // 处理结果返回，检查是否以 / 开头  
        if (url.startsWith('/')) {  
            // 如果原始路径是绝对路径，返回绝对路径  
            return '/' + urls.join('/').replace(/^\/+/, ''); // 确保去掉多余的斜杠  
        } else {  
            // 如果原始路径是相对路径，返回相对路径  
            return './' + urls.join('/').replace(/^\/+/, ''); // 确保去掉多余的斜杠  
        }  
    },
    requestSync: function(url, _succ, _fail) {
        if(this.requestMap[url] != null) {
            _succ(null, this.requestMap[url]);
            return;
        }

        // 其他浏览器的代码
        var xhr = new XMLHttpRequest();
        xhr.open("get", url, false); // 设置为同步请求
        // console.log('xhr not send', xhr);
        xhr.send();
        var responseText = xhr.responseText;
        // 处理响应
        // console.log('实际地址：' + xhr.responseURL);
        // console.log(responseText);
        _succ(xhr, responseText);

        this.requestMap[url] = responseText;
    },
    request: function(url, _succ, _fail) {
        
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        var requestMap = this.requestMap;
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // 请求成功
                // var response = JSON.parse(xhr.responseText);
                // console.log(response);
                requestMap[url] = xhr.responseText;
                _succ(xhr, xhr.responseText);
            } else {
                // 请求失败
                // console.error(xhr.statusText);
                _fail = _fail || function(){};
                _fail(xhr, xhr.responseText);
            }
        };
        
        xhr.send();
    },

    babel: function(content) {
        var output = Babel.transform(content, { presets: ['es2015'] }).code;
        return output;
    }

};

// console.log(CoreUtil.shortUrl('/compile/../static/lib/pure/httpVuePlus2.js'));
// console.log(CoreUtil.shortUrl('./compile/../static/lib/pure/httpVuePlus2.js'));