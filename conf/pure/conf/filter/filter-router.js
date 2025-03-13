module.exports = {
    run: function() {

        var code = JavaApi.getData('code');
        var url = JavaApi.getData('url');
        console.log("fiter-router-manager.js " + url);

        var PureEdit = require('@/conf/pure/pure-edit.js');

        var start = '// router config start';
        code = PureEdit.editRouterManager(code, start);

        code = code.replace('Vue.use(Router);', '');

        JavaApi.putData('code', code);
    }
};