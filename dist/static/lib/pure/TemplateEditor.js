(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _DomParser = require(parentUrl,'./DomParser.js');

var _DomParser2 = _interopRequireDefault(_DomParser);

var _LowcodeUtil = require(parentUrl,'./LowcodeUtil.js');

var _LowcodeUtil2 = _interopRequireDefault(_LowcodeUtil);

function _interopRequireDefault(obj) { return { default: obj}; }

var build = function build(code, url) {

    console.log('build ', url);

    var instance = {
        code: code,
        codeMap: {},

        replaceTemplate: function replaceTemplate(template) {
            this.codeMap.template = template;
        },
        wrapTemplate: function wrapTemplate() {
            // if(url != './module/dev/component/cmpt-test.vue') {
            //     return;
            // }
            var template = this.codeMap.template;
            var doc = _DomParser2.default.parseHtml(template);

            // console.log(template);
            // console.log('-----------');
            // Util.logType(doc);
            // console.log({doc});

            // console.log('-----------');
            // let nextElement = doc.innerHTML;
            var children = doc.content.children;
            var contentNode = children[0];
            // console.log('children', {contentNode});
            var tagName = contentNode.localName;
            // console.log('tagName', tagName);
            var contentHtml = contentNode.innerHTML;
            var attributes = contentNode.attributes;
            // console.log('attributes', attributes);

            var attrArray = [];
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                // console.log({attr});

                attrArray.push({
                    name: attr.name,
                    value: attr.value
                });
            }
            // console.log('attrArray', attrArray);
            attrArray.push({
                name: 'tag',
                value: tagName
            });

            template = '<template edit>\n' + '    <cc-edit ' + _LowcodeUtil2.default.buildAttr(attrArray) + '>' + contentHtml + '</cc-edit>\n' + '</template>\n';

            // TODO 最外层包裹比替换要好吧！
            // TODO 任何自定义组件都以 div 和 span 作为根节点
            // 或者，如果是div和span就替换，如果是其它的就包裹！

            // console.log('template', template);
            this.codeMap.template = template;
        },
        wrapTemplateOld: function wrapTemplateOld() {
            if (url != './module/dev/component/cmpt-test.vue') {
                return;
            }
            var template = this.codeMap.template;

            // template 转 dom 对象
            var doc = _DomParser2.default.parseXml(template);
            // console.log(doc);
            Util.logType(doc); // HTMLDocment

            var tdoc = doc.getElementsByTagName('template');
            console.log(tdoc);

            var telement = tdoc[0];
            Util.logType(telement); // HTMLElement 表示所有的 HTML 元素。

            var nextElementHtml = telement.innerHTML;
            console.log('nextElementHtml', nextElementHtml);

            doc = _DomParser2.default.parseHtml(nextElementHtml);
            console.log(doc);

            // console.log('当前节点：' + telement.localName);
            // console.log(telement.innerHTML);
            // console.log(telement);

            // var element = telement.childElementCount;
            // console.log('element', element);
            // let templateInner = tdoc[0].innerHTML;
            // console.log(templateInner);


            // let doc = DomParser.parseHtml(template);
            // console.log(doc.template);
            // console.log(doc.template.getElementByTagName('div'));
            // let $test = $(doc.template);
            // console.log($test);
        },
        dump: function dump() {
            var codes = [];
            for (var key in this.codeMap) {
                var _code = this.codeMap[key];
                codes.push(_code);
            }
            // console.log('this.codeMap', this.codeMap);
            // console.log('codes', codes);
            return codes.join("\n");
        },
        parse: function parse() {
            // console.log('parse code', url);
            var $tplMap = _DomParser2.default.parseHtml(code);
            var codeMap = {};
            // console.log(code);
            // console.log('$tplMap', $tplMap);
            for (var key in $tplMap) {
                if (key == '#text') {
                    continue;
                }
                var $tag = $tplMap[key];
                codeMap[key] = $tag.outerHTML;
                // console.log(key, codeMap[key]);
            }
            // console.log('codeMap template', codeMap.template); // 会有 ="" 存在！！！
            // console.log('codeMap script', codeMap.script);
            codeMap.template = codeMap.template.replace(/=""/g, '');
            this.codeMap = codeMap;
            // console.log('codeMap template', codeMap.template); 
        }
    };

    instance.parse();

    return instance;
};

exports = build;
})('static/lib/pure/TemplateEditor.js'); exports; 