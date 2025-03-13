const mockConfig = require("../config/mock-config");
const proxyConfig = require("../config/proxy-config");
const pageData = require("../util/page-data");
const commonConfig = require('../config/common-config');
const projectConfig = require('../config/project-config');

module.exports = {
    jsonStringify(obj) {
        return JSON.stringify(obj, 2, 2);
    },
    jsonPetty(json) {
        var obj = JSON.parse(json);
        return this.jsonStringify(obj);
    },
    inject(page, data) {
        for(var name in page) {
            // 创建注入对象
            let inject = {};
            // 注入选项
            inject.ejsOptions = {
                // 自定义转义
                escape(str) {
                    return str;
                }
            };
            // 注入参数data
            inject.data = data;
            // 注入nav页面参数
            if(name == 'nav') {
                inject.data.mockConfig = this.jsonStringify(mockConfig);
                inject.data.proxyConfig = this.jsonStringify(proxyConfig);
                inject.data.pageData = this.jsonStringify(pageData);
                inject.data.server = commonConfig.server;
                inject.data.projectConfig = this.jsonPetty(projectConfig.data);
            }
            // 注入到page
            page[name].inject = inject;
        }
    }
}