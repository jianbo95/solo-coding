(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports = {
    buildAttr: function buildAttr(attrs) {
        var attrArr = [];
        for (var i in attrs) {
            var attr = attrs[i];
            var name = attr.name;
            var value = attr.value;
            if (value != '') {
                attrArr.push(name + '="' + value + '"');
            } else {
                attrArr.push(name);
            }
        }
        return attrArr.join(' ');
    }
};
})('static/lib/pure/LowcodeUtil.js'); exports; 