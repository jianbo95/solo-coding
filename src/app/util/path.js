var containsSize = function (str, char) {
    var pos;
    var arr = [];
    pos = str.indexOf(char);
    while (pos > -1) {
        arr.push(pos);
        pos = str.indexOf(char, pos + 1);
    }
    return arr.length;
};

var urlDepth = function (url) {
    url = url.replace("http://", "");
    var size = containsSize(url, "/");
    return size;
};

var buildBaseUrl = function (depth) {
    var url = "";
    var size = depth - 2;
    for (var i = 0; i < size; i++) {
        url += "../"
    }
    return url;
};


export default function (path) {
    var depth = urlDepth(location.href);
    var relativeUrl = buildBaseUrl(depth);
    return relativeUrl + path;
};