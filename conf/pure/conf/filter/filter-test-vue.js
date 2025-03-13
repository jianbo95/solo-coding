module.exports = {
    run: function() {
        // data
        var code = JavaApi.getData('code');
        
        var less = JavaApi.read('@/src/assets/style/app-plus.less');

        less = '<style lang="less">' + less + '</style>';

        JavaApi.putData('code', code + less);
    }
};