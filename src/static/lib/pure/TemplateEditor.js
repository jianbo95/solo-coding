import DomParser from './DomParser.js';
import LowcodeUtil from './LowcodeUtil.js';

let build = (code, url) => {

    console.log('build ', url);

    let instance = {
        code: code,
        codeMap: {},

        replaceTemplate(template) {
            this.codeMap.template = template;
        },

        wrapTemplate() {
            // if(url != './module/dev/component/cmpt-test.vue') {
            //     return;
            // }
            let template = this.codeMap.template;
            let doc = DomParser.parseHtml(template);
            
            // console.log(template);
            // console.log('-----------');
            // Util.logType(doc);
            // console.log({doc});

            // console.log('-----------');
            // let nextElement = doc.innerHTML;
            let children = doc.content.children;
            let contentNode = children[0];
            // console.log('children', {contentNode});
            let tagName = contentNode.localName;
            // console.log('tagName', tagName);
            let contentHtml = contentNode.innerHTML;
            let attributes = contentNode.attributes;
            // console.log('attributes', attributes);

            let attrArray = [];
            for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                // console.log({attr});

                attrArray.push({
                    name: attr.name,
                    value: attr.value
                })
            }
            // console.log('attrArray', attrArray);
            attrArray.push({
                name: 'tag',
                value: tagName
            })

            template = 
            '<template edit>\n' 
                + '    <cc-edit ' + LowcodeUtil.buildAttr(attrArray) + '>'
                    + contentHtml
                + '</cc-edit>\n'
            + '</template>\n';

            // TODO 最外层包裹比替换要好吧！
            // TODO 任何自定义组件都以 div 和 span 作为根节点
            // 或者，如果是div和span就替换，如果是其它的就包裹！

            // console.log('template', template);
            this.codeMap.template = template;
        },
        
        wrapTemplateOld() {
            if(url != './module/dev/component/cmpt-test.vue') {
                return;
            }
            let template = this.codeMap.template;

            // template 转 dom 对象
            let doc = DomParser.parseXml(template);
            // console.log(doc);
            Util.logType(doc); // HTMLDocment

            let tdoc = doc.getElementsByTagName('template');
            console.log(tdoc);

            let telement = tdoc[0];
            Util.logType(telement); // HTMLElement 表示所有的 HTML 元素。

            let nextElementHtml = telement.innerHTML;
            console.log('nextElementHtml', nextElementHtml);

            doc = DomParser.parseHtml(nextElementHtml);
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

        dump() {
            let codes = [];
            for(let key in this.codeMap) {
                let code = this.codeMap[key];
                codes.push(code);
            }
            // console.log('this.codeMap', this.codeMap);
            // console.log('codes', codes);
            return codes.join("\n");
        },
        parse() {
            // console.log('parse code', url);
            var $tplMap = DomParser.parseHtml(code);
            var codeMap = {};
            // console.log(code);
            // console.log('$tplMap', $tplMap);
            for(var key in $tplMap) {
                if(key == '#text') {
                    continue;
                }
                let $tag = $tplMap[key];
                codeMap[key] = $tag.outerHTML;
                // console.log(key, codeMap[key]);
            }
            // console.log('codeMap template', codeMap.template); // 会有 ="" 存在！！！
            // console.log('codeMap script', codeMap.script);
            codeMap.template = codeMap.template.replace(/=""/g, '');
            this.codeMap = codeMap;
            // console.log('codeMap template', codeMap.template); 
        }
    }

    instance.parse();

    return instance;

};

export default build;