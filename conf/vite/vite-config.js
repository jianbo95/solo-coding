const projectConfig = require('../config/project-config');

// const pluginUtil = require('../util/plugin-util.js');

// const pluginConfig = pluginUtil.load();

projectConfig.devMode = 'open';

module.exports = {
    get(proxy) {
        // console.log('get proxy', proxy);
        // console.log('webpack config', pluginConfig.htmlPlugin);
        // let plugins = pluginConfig.htmlPlugin;
        // for(let i in plugins) {
            // let plugin = plugins[i];
            // console.log(plugin.options.filename); // 导出路径
        // }

        let urls = [];
        for(let url in proxy) {
            if(url == '/nav.html') {
                continue;
            }
            urls.push(url);
        }

        projectConfig.urls = urls;

        return projectConfig;
    }
};