module.exports = {
    // 导入的文件
    files : [
        'vue/dist/vue.min.js',
        'vue-router/dist/vue-router.min.js',
        'vuex/dist/vuex.js',
        'crypto-js/crypto-js.js'
    ],
    // 导出的模块
    export: {
        'vue': 'Vue',
		'vue-router': 'VueRouter',
		'element-ui': 'ELEMENT',
        'vuex': 'Vuex',
        'crypto-js': 'CryptoJS'
    }
};