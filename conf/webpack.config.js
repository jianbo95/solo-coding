const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const isDevMode = process.env.NODE_ENV !== 'production';
const modeCn = isDevMode ? '开发模式': '生产模式';

const vueLoaderConfig = require('./config/vue-loader-config.js');
const staticConfig = require('./config/static-config.js');
const staticReg = require('./util/static-reg.js');
const pluginUtil = require('./util/plugin-util.js');
const tool = require('./util/tool.js');
const htmlPlugin = require('./plugin/htmlPlugin.js');
const staticFiles = staticReg.reg(staticConfig.files);

const pluginConfig = pluginUtil.load();

console.log("当前模式:", modeCn);

var webpackConfig = {
	externals: staticConfig.export,
	mode: isDevMode ? 'development': 'production',
    devtool:false,
	// entry:'./src/index.js',
	entry: pluginConfig.entry,
    // snapshot: {
    //     managedPaths: [path.resolve(__dirname, 'node_modules')],
	// },
	// 打包出口文件
	output: {
		// 输出目录
		path: path.join(__dirname, '../dist/'),
		// 公共路径前缀
		publicPath: isDevMode ? './' : './',
		// 输出文件名
		filename: 'js/[name].[contenthash].js',
		// 配置按需加载文件
		chunkFilename: 'js/[name].bundle.js',
		// 配置打包输出环境，不使用箭头函数
		environment: {
            arrowFunction: false
        }
	},
	target: ['web', 'es5'],
    cache:{
        type: 'filesystem' // 开启磁盘缓存！
	},
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
				/node_modules/.test(file) 
				// && !/\.vue\.js/.test(file)
			},
			use: [{
				loader: 'babel-loader',
				options: {
					presets: [
					  ['@babel/preset-env', { targets: "ie 11" }]
					]
				}
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
		}, {
			test: /.html$/,
			loader: 'ejs-loader',
			options: {
				// variable: 'data',
				esModule: false
			},
		}
	]
    },
    plugins: tool.merge(pluginConfig.htmlPlugin, [
		new htmlPlugin(),
		new CleanWebpackPlugin(),
        // 配置HTML页面模板
		new MiniCssExtractPlugin({
			filename: "css/[name].[contenthash].css",
			chunkFilename: "css/[id].[contenthash].css"
			// filename: 'main.css'
		}),
		new VueLoaderPlugin(),		// vue-loader 加载插件
		new CopyPlugin({ // 复制静态文件
			patterns: staticFiles
		}),
    ]),

	optimization: {
		splitChunks: {
			cacheGroups: {
				// 打包业务中公共代码
				common: {
					name: "common",
					chunks: "initial",
					minSize: 1,
					priority: 0,
					minChunks: 2, // 同时引用了2次才打包
				},
				// 打包引入第三方库
				defaultVendors: {
					name: "vendor",
					test: /[\\/]node_modules[\\/]/,
					chunks: "initial",
					priority: 10,
					minChunks: 2, // 同时引用了2次才打包
				}
			}
		}
	}
}

module.exports = webpackConfig;
