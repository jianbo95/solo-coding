module.exports = {
    run: function() {

        var code = JavaApi.getData('code');
        var url = JavaApi.getData('url');
        console.log("fiter-node-module.js " + url);

        code = JavaApi.read('@/conf/pure/conf/filter/data/data-node-module.js');

        JavaApi.putData('code', code);
    }
};