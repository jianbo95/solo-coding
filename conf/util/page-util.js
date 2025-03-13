const path = require('path');
const pageData = require('../util/page-data.js');
const projectConfig = require('../config/project-config.js');
const root = '../../';

projectConfig.data = JSON.stringify(projectConfig);

let util = {
    getProjectConfig() {
        return projectConfig;
    },
    getAbsoluteConfig() {
        var fullConfig = [];
        for(var i in pageData) {
            var config = pageData[i];
            if(config.input != null) {
                var configUnit = this.loadConfig(config);
                fullConfig.push(configUnit);
            }
        }

        // fullconfig : 足够配置
        // console.log('fullconfig', fullConfig);
        
        var absoluteConfig = this.loadAbsuluteConfig(fullConfig);
        // console.log('absoluteConfig', absoluteConfig);

        return absoluteConfig;
    },
    
    loadConfig(config) {

        var fileName = path.join(__dirname, root + config.input)
        var basename = path.basename(fileName, '.html');

        if(config.chunks == null) {
            config.chunks = [basename];
        }
        if(config.output == null) {
            // config.output = '/page/' + basename + '.html';
            config.output = '/' + basename + '.html';
        }
        if(config.entry == null) {
            config.entry = config.input.replace('.html', '.js');
        }

        config.name = basename;

        return config;
    },
    loadAbsuluteConfig(configs) {
        var result = [];
        for(var i in configs) {
            var config = configs[i];
            result.push({
                chunks: config.chunks,
                abs_input : path.join(__dirname, root + config.input),
                abs_entry : path.join(__dirname, root + config.entry),
                input: config.input,
                entry: config.entry,
                output: '.' + config.output,
                proxy: config.output,
                name: config.name,
                inejct: config.inject == false ? false : true
            });
        }
        return result;
    },
}

// util.load();
module.exports = util;