(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports = {
    parseHtmlByTag: function parseHtmlByTag(html, name) {
        return this.parseHtml(html)[name];
    },
    parseAttrs: function parseAttrs($html) {
        // 解析最外层所有属性
        // console.log('$html', {$html});
        var attrs = $html.attributes;
        var result = [];
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            var name = attr.name;
            var value = attr.nodeValue;
            result.push({ name: name, value: value });
        }
        return result;
    },
    parseHtml: function parseHtml(html) {
        var $html = $(html);
        var map = {};
        if ($html.length == null) {
            $html = [$html];
        }
        if ($html.length == 1) {
            var element = $html[0];
            return element;
        }
        for (var i = 0; i < $html.length; i++) {
            var _element = $html[i];
            var name = _element.localName;
            if (name == null) {
                name = _element.nodeName;
            }
            map[name] = _element;
        }
        return map;
    },
    parseXml: function parseXml(xml) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xml, "text/html");
        return xmlDoc;
    }
};
})('static/lib/pure/DomParser.js'); exports; 