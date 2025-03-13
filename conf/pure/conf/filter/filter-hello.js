module.exports = {
    run: function() {
        // data
        var code = JavaApi.getData('code');
        code = code.replace('hello.js', 'hello in filter');
        
        JavaApi.putData('code', code);
    }
};