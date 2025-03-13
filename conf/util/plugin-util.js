const HtmlWebpackPlugin = require('html-webpack-plugin');
const tool = require('./tool.js');
const pageUtil = require('./page-util');

const projectConfig = pageUtil.getProjectConfig();
var newHtmlPlugin = function(chunks, input, output, inject) {

    var config = {
    	chunks: chunks,
    	// 使用模板的路径
    	template: input, // TODO 'ejs-render-loader!index.ejs'
    	// 输出后的文件路径
    	filename: output,
    	hash: true,
    	// 是否注入
    	inject: inject,
        // 参数注入
        templateParameters: projectConfig,
    };

    config.header = projectConfig;
    
    return new HtmlWebpackPlugin(config);
};

let util = {
    newHtmlPlugin(pluginConfig) {
        return newHtmlPlugin(
            pluginConfig.chunks,
            pluginConfig.abs_input,
            pluginConfig.output,
            pluginConfig.inejct
        );
    },
    
    load() {
        var absoluteConfig = pageUtil.getAbsoluteConfig();
        
        var plugins = [];
        var entry = {};

        for(var i in absoluteConfig) {
            var config = absoluteConfig[i];
            var htmlPlugin = this.newHtmlPlugin(config);
            plugins.push(htmlPlugin);

            if(config.entry != null) {
                entry[config.name] = config.abs_entry;
            }
        }

        tool.log('entry', entry);

        return {
            htmlPlugin: plugins,
            entry: entry
        };
    }
    
}

// util.load();
module.exports = util;