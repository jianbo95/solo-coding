module.exports = {
    run: function() {

        var code = JavaApi.getData('code');
        var url = JavaApi.getData('url');
        console.log("fiter-router-manager.js " + url);

        var PureEdit = require('@/conf/pure/pure-edit.js');

        code = PureEdit.editRouterManager(code);

        JavaApi.putData('code', code);
    }
};