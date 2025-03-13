/**
  * HtmlUtil
  * Jianbo
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.HtmlUtil = factory());
}(this, (function () { 'use strict';

var HtmlUtil = {
    buildStyle(ids) {
        var style = '';
        for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        var idStyle = `
#${id} {
    border:1px solid #000;
}
        `;
        style += idStyle;
        }
        return style;
    },
    loadStyle(str) {
        // 创建一个style元素
        var style = document.createElement('style');
        
        // 设置样式字符串
        style.textContent = str;
        
        // 将style元素添加到head中
        document.head.appendChild(style);
    },
    delId2(mainId) {
        let root = $("#" + mainId);
        var code = root.html();
        code = code.replace(/ id="Duuid([0-9a-z_])*?"/gi, '');
        return code;
    },
    delId(mainId) {
        let root = $("#" + mainId);
        let all = root.find("*");
        for (let i = 0; i < all.length; i++) {
            const element = all[i];
            let id = $(element).attr('id');
            if(id != null) {
                if(id.indexOf('D') == 0) {
                    $(element).removeAttr('id');
                }
            }
        }
        return {root: root};
    },
    replaceDiv(code) {
        code = code.replace(/<div/gi, '<b-div');
        code = code.replace(/<\/div/gi, '</b-div');
        return code;
    },
    addId(mainId) {
        // 找到所有元素
        let root = $("#" + mainId);
        let all = root.find("*");
        let ids = [];

        // console.log(all.length);
        for (let i = 0; i < all.length; i++) {
            const element = all[i];
            // console.log({element});
            if(element.nodeName == 'EDIT') {
                continue;
            }
            let id = $(element).attr('id');
            // console.log('id', id);
            if(id == null) {
                // 生成id
                let eid = Util.UUID();
                id = 'D' + eid;
                $(element).attr('id', id);
            }
            ids.push(id);
        }
        return {
            ids: ids,
            root: root
        };
    },
    parseAttrs($html) {
        // 解析最外层所有属性
        // console.log('$html', {$html});
        let attrs = $html[0].attributes;
        // console.log('attrs', attrs);
        let result = [];
        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i];
            let name = attr.name;
            let value = attr.nodeValue;
            result.push(
                { name, value }
            );
        }
        return result;
    }
};

return HtmlUtil;

})));