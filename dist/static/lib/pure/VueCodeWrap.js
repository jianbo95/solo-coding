(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _TemplateEditor = require(parentUrl,'./TemplateEditor.js');

var _TemplateEditor2 = _interopRequireDefault(_TemplateEditor);

function _interopRequireDefault(obj) { return { default: obj}; }

var CommonUtil = {};

CommonUtil.rand = function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

CommonUtil.uid = function () {
    var date = new Date();
    var rand = this.rand(10000, 99999) + '';
    var time = date.getTime() + '';
    return time + rand;
};

exports = {
    // 入口
    wrap: function wrap(code, url, name) {
        if (code.indexOf('<template edit>') == -1) {
            // TODO cc-input 强制 edit
            // if(name != 'cc-input') {
            //     return code;
            // }
            return code;
        }

        code = this.componentWrapV2(code, url);

        // if(url == './module/dev/component/cmpt-test.vue') {
        //     console.log('code', '\n'+ code);
        // }

        // 通过jquery增加ID
        code = this.addId(code, url); // 增加id会有问题？

        var start = '<template edit>';
        var content = code.substring(start.length);

        return '<template>' + content;
    },

    // 增加id
    addId: function addId(code, url) {
        var pos = code.lastIndexOf('</template>');
        var start = '<template edit>';
        var left = code.substring(start.length, pos);
        var right = code.substring(pos, code.length);
        // console.log('addId', left);
        // console.log('addId', right);
        var uid = CommonUtil.uid();
        $('#codeWrap').append('<div id="' + uid + '">' + left + '</div>');

        // 找到所有元素
        var root = $('#codeWrap #' + uid);
        var all = root.find("*");
        // console.log(all.length);
        for (var i = 0; i < all.length; i++) {
            var element = all[i];
            // console.log(element);
            var id = $(element).attr('id');
            // console.log('id', id);
            if (id == null) {
                // 生成id
                var eid = CommonUtil.uid();
                $(element).attr('id', 'D' + eid);
            }
        }
        // console.log('root', root.html());
        left = root.html();
        root.remove();

        return start + left + right;
    },

    // 组件替换
    componentWrapV2: function componentWrapV2(code, url) {
        var editor = (0, _TemplateEditor2.default)(code, url);
        editor.wrapTemplate();
        code = editor.dump();
        return code;
    },

    // 组件替换
    componentWrap: function componentWrap(code, url) {
        // console.log('allow edit', url);

        var changeEndCode = function changeEndCode(code) {

            var pos = code.lastIndexOf('</template>');
            var left = code.substring(0, pos);
            var right = code.substring(pos, code.length);

            left = left.substring(0, left.lastIndexOf('</div>') - '</div>'.length) + '\n    </cc-edit>\n';
            left = left.replace('<div', '<cc-edit');

            // console.log('left', left);
            // console.log('right', right);
            return left + right;
        };

        code = changeEndCode(code);

        var changeDivCode = function changeDivCode(code) {
            var reg = new RegExp('div', "gm");
            code = code.replace(reg, 'div-edit');
            return code;
        };

        // code = changeDivCode(code);

        return code;
    }
};
})('static/lib/pure/VueCodeWrap.js'); exports; 