/**
 * html实时编译模块
 */
module.exports = {
    run: function() {
        // url
        var code = JavaApi.getData('code');
        var url = JavaApi.getData('url');
        console.log("fiter-html.js " + url);
        
        // 验证 url 必须以 .html 结尾
        if (!url.endsWith('.html')) {
            JavaApi.putData('code', 'URL must end with .html');
            return;
        }

        // pure 中最难搞的应该还是代理
        var projectConfig = require('@/conf/config/project-config.js');
        var commonConfig = require('@/conf/config/common-config.js');
        var mockConfig = require('@/conf/config/mock-config.js');
        var proxyConfig = require('@/conf/config/proxy-config.js');
        var loadVue = require('@/conf/pure/compile/load-vue.js');
        var pageConfigUtil = require('@/conf/function/page-config-util.js');

        var requireConfigMapJson = JavaApi.getGlobalData('requireConfigMap');
        var requireConfigMap = JSON.parse(requireConfigMapJson);
        
        // 获取项目前端根路径
        var mainJsPath = JavaApi.truePath('@/src/main.js');
        var frontPath = mainJsPath.replace('/src/main.js', '');
        projectConfig.frontPath = frontPath;
        
        // 创建data字符串
        var data = JSON.stringify(projectConfig);

        // 实现 projectConfig.urls
        var urls = JSON.parse(JavaApi.getGlobalData('urls'));
        projectConfig.projectConfig = JSON.stringify(projectConfig, ' ', 4);
        projectConfig.data = data;
        projectConfig.urls = urls;
        projectConfig.server = commonConfig.server;
        projectConfig.mockConfig = JSON.stringify(mockConfig, ' ', 4);
        projectConfig.proxyConfig = JSON.stringify(proxyConfig, ' ', 4);
        projectConfig.pageData = '';
        projectConfig.version = new Date().getTime();
        
        var richHtml = false;

        // 通过 -pure.html 文件补充
        // if(richHtml == false) {
        //     richHtml = true;
        //     if(url == '/html/editor/textarea/textarea.html') {
        //         var indexPlus = JavaApi.read('@/static/lib/pure/html/textarea-pure.html');
        //         code = code + indexPlus;
        //     } else {
        //         richHtml = false;
        //     }
        // }


        if(richHtml == false) {
            // 直接获取完整的 pageConfigMap 
            var pageConfig = requireConfigMap[url];
            if(requireConfigMap[url] != null) {
                projectConfig.root = pageConfig.root;
                projectConfig.entry = pageConfig.requireEntry;

                if(pageConfig.mode != 'require') {
                    if(code.indexOf('id="app"') != -1) {
                        pageConfig.mode = 'import';
                    }
                }

                var isVue = false;
                if(code.indexOf('vue.') != -1) {
                    isVue = true;
                }
                
                // 当前页面模式为 require 模式
                if(pageConfig.mode == 'require') {
                    var indexPlus = JavaApi.read('@/static/lib/pure/tpl/require-js.html');
                    code = code + indexPlus;
                    richHtml = true;
                } else if(pageConfig.mode == 'import') {

                    var jsPath = '@/' + pageConfig.entry;
                    // console.log('pageConfig' + JSON.stringify(pageConfig, true, 2));
                    // 根据html路径判断root路径
                    var root = pageConfigUtil.pathRootByUrl(pageConfig.output);

                    var jsCode = JavaApi.read(jsPath);
                    projectConfig.runMode = 'dev';

                    if(isVue) {
                        code = code 
                            // + '<script type="text/javascript" src="'+root+'static/lib/pure-lib/less.min.js"></script>\n'
                            + '<script type="module">\n'
                            + 'import plus from "'+root+'static/lib/pure/httpVuePlus2.js";\n'
                            + 'import loader from "'+root+'static/lib/pure/httpVueLoader2.js";\n'
                            + loadVue.compile(jsCode, pageConfig)
                            + "</script>";
                        richHtml = true;
                    } else {
                        code = code 
                            + '<script type="module">\n'
                            + loadVue.compile(jsCode, pageConfig)
                            + "</script>";
                        richHtml = true;
                    }
                }
            }
        }

        

        // ejs 渲染
        code = ejs.render(code, projectConfig, {
            escape: function(data) {
                return data;
            }
        });

        JavaApi.putData('code', code);
    }
};