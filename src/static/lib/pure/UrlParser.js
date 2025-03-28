// 路径解析

var UrlParser = {};

UrlParser.parseLocal = function() {
    return UrlParser.parse(location.href);
};

/**
 * return @Object
 * DEMO http://127.0.0.1:3000/test?name=alex
 * protocol: http
 * host: 127.0.0.1
 * port: 3000
 * baseUrl: http://127.0.0.1:3000/
 * ...
 */
UrlParser.parse = function(url) {
    var urlObj = {
        protocol: /^(.+)\:\/\//,
        host: /\:\/\/(.+?)[\?\#\s\/]/,
        path: /\w(\/.*?)[\?\#\s]/,
        query: /\?(.+?)[\#\/\s]/,
        hash: /\#(\w+)\s$/
    }
    url += ' '
    function formatQuery(str) {
        return str.split('&').reduce((a, b) => {
            var arr = b.split('=')
            a[arr[0]] = arr[1]
            return a
        }, {});
    }
    for(var key in urlObj) {
        var pattern = urlObj[key]
        urlObj[key] = key === 'query' ? (pattern.exec(url) && formatQuery(pattern.exec(url)[1])) : (pattern.exec(url) && pattern.exec(url)[1])
    }
    var hostArrs = [];
    if(urlObj.host != null) {
        hostArrs = urlObj.host.split(":");
    }
    if(hostArrs.length == 2) {
        urlObj.port = hostArrs[1];
    } else {
        urlObj.port = '80';
    }
    urlObj.host = hostArrs[0];
    urlObj.hostAndPort = function() {
        if(urlObj.port == '80') {
            return urlObj.host;
        } else {
            return urlObj.host + ":" + urlObj.port;
        }
    }();
    urlObj.baseUrl = urlObj.protocol + "://" + urlObj.hostAndPort + "/";
    return urlObj;
};

var test = function() {
    var url = "https://abc:3000/ab?a=b#c";
    var obj = UrlParser.parse(url);
    console.log(obj);
};

window.UrlParser = UrlParser;
export default UrlParser;