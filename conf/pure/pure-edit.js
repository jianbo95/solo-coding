module.exports = {
    editGlobalCmpt: function(data) {
        console.log('edit global cmpt');
        var start = 'import Input';
        var end = 'export default';
        var startPos = data.indexOf(start);
        var endPost = data.indexOf(end);
        var content = data.substring(startPos, endPost);
        
        var startContent = data.substring(0, startPos);
        var endContent = data.substring(endPost);
        
        var lines = content.split("\n");
        var imports = [];
        var regs = [];

        for (var i = 0; i < lines.length; i++) {
            var element = lines[i].trim();

            if(element.indexOf('import') == 0) {
                imports.push(element);
            } else if(element.indexOf('Vue.component') == 0) {
                regs.push(element);
            }
        }

        // console.log('imports', imports);

        var components = [];

        for (var i = 0; i < imports.length; i++) {
            var importVue = imports[i];
            var reg = regs[i];
            
            var url = this.parseImportUrl(importVue);
            var key = this.parseKey(reg);
            var importInfo = {
                url: url, key: key
            };
            components.push(importInfo);
        }

        var replaceCode = '';
        for (var i = 0; i < components.length; i++) {
            var element = components[i];
            var key = element.key;
            var url = element.url;
            var code = 'Vue.component("'+key+'", httpVueLoader("'+url+'", "'+key+'"));\n'
            replaceCode += code;
        }

        return startContent + '\nVue.use(httpVueLoader);\n' + replaceCode + endContent;
    },
    editRouterManager: function(data, start, end) {
        if(start == null) {
            start = 'Vue.use(Router);';
            // start = '// router config start';
        }
        var startPos = data.indexOf(start);
        if(startPos == -1) {
            return '// not exist router config start \n' + data;
        }
        if(end == null) {
            end = '// router config end';
        }
        var endPost = data.indexOf(end);
        if(endPost == -1) {
            return '// not exist router config end \n' + data;
        }
        var content = data.substring(startPos, endPost);

        // console.log(data);
        // console.log('content');
        // console.log(content);
        
        var startContent = data.substring(0, startPos);
        var endContent = data.substring(endPost);

        var lines = content.split("\n");
        var imports = [];
        var regs = [];

        for (var i = 0; i < lines.length; i++) {
            var element = lines[i].trim();

            if(element.indexOf('import') == 0) {
                imports.push(element);
            } else if(element.indexOf('pushRoute') == 0) {
                regs.push(element);
            }
        }

        // console.log(JSON.stringify(imports));
        // console.log(JSON.stringify(regs));

        var components = [];

        for (var i = 0; i < imports.length; i++) {
            var importVue = imports[i];
            var reg = regs[i];
            
            var url = this.parseImportUrl(importVue);
            
            // console.log('this.parseImportUrl' + url);

            var key = this.parseKey(reg);

            // console.log('this.parseImportUrl2' + url);
            var importInfo = {
                url: url, key: key
            };
            components.push(importInfo);
        }
        // console.log(components);

        var replaceCode = '';
        for (var i = 0; i < components.length; i++) {
            var element = components[i];
            var key = element.key;
            var url = element.url;
            var code = 'pushRoute("'+key+'", httpVueLoader("'+url+'"));\n'
            replaceCode += code;
        }

        var result = startContent + '\nVue.use(httpVueLoader);\n' + replaceCode + endContent;
        // console.log(result);
        return result;
    },
    parseKey: function(reg) {
        // console.log('this.parseKey '+ reg);
        var key = reg.substring(reg.indexOf('(') + 1, reg.indexOf(','));
        key = key.trim();
        key = key.substring(1, key.length - 1);
        return key;
    },
    parseImportUrl: function(importVue) {
        var url = importVue.substring(importVue.indexOf("from") + 4);
        url = url.substring(0, url.indexOf('.vue'));
        url = url.trim();
        url = url.substring(1, url.length);
        if(url.indexOf('.vue') == -1) {
            url = url + '.vue';
        }
        url = url.replace('@/', '../../');
        return url;
    }
};