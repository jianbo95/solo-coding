process.env.NODE_ENV = 'development';

const path = require('path');
// const VueLoaderPlugin = require('vue-loader/lib/plugin');
// 问题就在这里了 VueLoaderPlugin
const VueLoaderPlugin = require('vue-loader/lib/plugin-webpack5')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const vueLoaderConfig = require('./config/vue-loader-config.js');


module.exports = {
    entry: [
		path.join(__dirname, '../src/main.js')
    ],
    resolve: {
		// 引入文件时可以省略文件后缀名
		extensions:['.js','.json','.vue'],
		// 常用路径别名
		alias: {
			vue$: "vue/dist/vue.esm.js",
			'@': path.join(__dirname, '../src/')
		}
    },
    module: {
        rules: [{	// 添加解析 .vue文件loader
			test: /\.vue$/,
			use: [{
				loader: 'vue-loader',
				options: vueLoaderConfig
			}]
		}, {		// 添加解析 .css文件loader
			test: /\.css(\?.*)?$/,
			use: [	// loader 顺序不能乱
				'vue-style-loader',
				'style-loader',
				'css-loader',
				'postcss-loader'
			]
		}, {
			test: /\.less$/,
			use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', {
				loader: 'less-loader',
				options: {
					lessOptions: {
						modifyVars: {
							'primary-color': '#4608e2',
							'link-color': '#4608e2',
							'border-radius-base': '20px',
						},
						javascriptEnabled: true,
					}
				}
			}]
		}, { // 配置Babel将ES6+ 转换为ES5
			test: /\.js(\?.*)?$/,
			exclude: (file) => { // 排除node_modules文件夹
				/node_modules/.test(file) &&
				!/\.vue\.js/.test(file)
			},
			use: [{
				loader: 'babel-loader',
				// 以下选项会报错
				// options: {
				// 	presets: ['@babel/preset-env'],
				// 	plugins: ['@babel/plugin-transform-runtime']
				// }
			}]
		}, { // 配置图片文件加载
			test: /\.(png|jpe?g|gif|tif?f|bmp|webp|svg)(\?.*)?$/,
			use: [{
				loader: 'url-loader',
				options: {
					name: 'img/[name].[hash].[ext]',
					limit: 100000, // 100KB
					esModule: false
				}
			}]
		}, { // 配置字体文件加载
			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			use: [{
				loader: 'file-loader',
				options: {
					name: 'font/[name].[hash].[ext]',
					esModule: false,
					limit: 10000
				}
			}]
		}, { // 处理node文件
			test: /\.node$/,
			use: ['node-loader']
		}]
    },
    plugins:[
        new VueLoaderPlugin(),		// vue-loader 加载插件
    ]
};