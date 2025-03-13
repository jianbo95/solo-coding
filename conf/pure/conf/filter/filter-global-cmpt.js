module.exports = {
    run: function() {

        var code = JavaApi.getData('code');
        var url = JavaApi.getData('url');
        console.log("fiter-global-cmpt.js " + url);

        var PureEdit = require('@/conf/pure/pure-edit.js');

        code = PureEdit.editGlobalCmpt(code);

        JavaApi.putData('code', code);
    }
};