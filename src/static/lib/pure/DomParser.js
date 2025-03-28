export default {
    parseHtmlByTag(html, name) {
        return this.parseHtml(html)[name];
    },
    parseAttrs($html) {
        // 解析最外层所有属性
        // console.log('$html', {$html});
        let attrs = $html.attributes;
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
    },
    parseHtml(html) {
        let $html = $(html);
        let map = {};
        if($html.length == null) {
            $html = [$html];
        }
        if($html.length == 1) {
            const element = $html[0];
            return element;
        }
        for (let i = 0; i < $html.length; i++) {
            const element = $html[i];
            let name = element.localName;
            if(name == null) {
                name = element.nodeName;
            }
            map[name] = element;
        }
        return map;
    },
    parseXml(xml) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xml, "text/html");
        return xmlDoc;
    }
}