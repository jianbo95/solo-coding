/**
 * 开发环境配置
 */
process.env.NODE_ENV = 'development';

const webpackConfig = require('./webpack.config.js')

webpackConfig.devServer = {
    // contentBase: './dist'
}

// let rules = webpackConfig.module.rules;
// for(var i = 0; i< rules.length; i++) {
// 	var rule = rules[i];
// 	if(rule.resourceQuery != null) {
// 		// console.log(rule);
// 	} else {
// 		// 不需要 cache-loader
// 		// rule.use.unshift('cache-loader'); // 会导致图片无法显示？
// 	}
// }

module.exports = webpackConfig;