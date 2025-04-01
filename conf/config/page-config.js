/**
 * 支持自动扫描，会自动扫描html目录下的模块，没有手动配置的页面则会自动加载
 * 配置说明
 * chunks: ['main'],            
 * entry: 'src/main.js',        配置js入口 默认为 input 替换 .html 为 .js
 * input: 'src/index.html',     配置前端入口 必须配置
 * output: '/index.html',       配置输出文件 默认为 /xxx.html
 * inject: false                是否自动注入 默认为true
 */
module.exports = [
    {
        name: 'index',
        entry: 'src/main.js',
        input: 'src/html/index/index.html',
		output: '/index.html', // vite默认为 '/none.html'
        mode: 'import',
        inject: true
    },
    {
        // entry: 'src/html/auction/auction.js',
        name: 'auction',
        input: 'src/html/auction/auction.html',
		// output: '/auction.html',
        // inject: false
    },
    {
        name: 'customHtmlPath',
        input: 'src/html/compile/customHtmlPath/customHtmlPath.html',
		output: '/compile/customHtmlPath.html',
    },
    {
        name: 'require',
        input: 'src/html/compile/require/require.html',
		output: '/compile/require.html',
        mode: 'require'
    },
    {
        name: 'import',
        input: 'src/html/compile/import/import.html',
		output: '/compile/import.html',
        mode: 'import'
    },
    // {
    //     // entry: // 默认为 input 替换 .html 为 .js
    //     name: 'test',
    //     input: 'src/html/test/test.html',
    //     // output 默认为 '/test.html'
    //     // inject: true // 默认为true
    // },
    // {
    //     // entry: // 默认为 input 替换 .html 为 .js
    //     name: 'nav',
    //     input: 'src/html/nav/nav.html',
    //     // output 默认为 '/nav.html'
    //     // inject: true // 默认为true
    // },
];
