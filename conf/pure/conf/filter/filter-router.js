module.exports = {
    run: function() {

        var filesJson = JavaApi.files('@/src/html/index/app');
        var files = JSON.parse(filesJson);
        var data = {};
        var routerCode = '';
        for(var i in files) {
            var file = files[i];
            if(file.indexOf('game.json') + 9 == file.length()) {
                // .json 结尾
                continue;
            }
            if(file.indexOf('.json') + 5 == file.length()) {
                // .json 结尾
                var gameData = JSON.parse(JavaApi.read(file));
                var file = JavaApi.resourceToUrl(file);
                var router = file.substring(0, file.indexOf('.json')) + '.vue';
                var id = gameData.id;
                var lineCode = 'import ' + id + ' from \'@' + router + '\';\n'
                    + "pushRoute('/game/"+ id +"', "+ id +");\n\n";
                routerCode += lineCode;
            }
        }

        var code = JavaApi.getData('code');
        var url = JavaApi.getData('url');
        console.log("fiter-router-manager.js " + url);

        var PureEdit = require('@/conf/pure/pure-edit.js');

        var start = '// router config start';

        code = code.replace(start, start + '\n' + routerCode);

        code = PureEdit.editRouterManager(code, start);

        code = code.replace('Vue.use(Router);', '');

        JavaApi.putData('code', code);
    }
};