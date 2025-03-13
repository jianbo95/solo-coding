/**
 * 生产环境配置
 */
process.env.NODE_ENV = 'production'; // development

const webpackConfig = require('./webpack.config.js')

module.exports = webpackConfig;
