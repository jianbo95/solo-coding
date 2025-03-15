<template>
<div class="page-markdown" :style="pageStyle">

    <!-- TODO markdown 支持自限高度 -->
    <div style="height: 100%; overflow-y:auto;">
        <cc-debug v-if="debug" class="content">
            <div>
                markdown文档
            </div>
            <template v-if="url != null">
                <div>
                    url: {{url}}
                </div>
                <div>
                    directory: {{directory}}
                </div>
                <div>
                    fullUrl: {{fullUrl}}
                </div>
                <div>
                    fullPath: {{fullPath}}
                </div>
            </template>
            <div v-if="url == null">
                <div>
                    <span>
                    展示markdown源码：
                    </span>
                    <el-switch
                        v-model="debugData.showCode"
                        active-color="#13ce66"
                        inactive-color="#eee"></el-switch>
                </div>
                <pre v-html="mdContent" v-if="debugData.showCode">
                </pre>
            </div>
        </cc-debug>

        <div :id="id" class="content">
        </div>

        <div :id="'content'+id" style="display:none;">
            <slot></slot>
        </div>

        <div class="tab-menu-box" :style="tabMenuBoxStyle">
            <div class="tab-menu">
                <div class="tab">
                    <div style="font-size:20px; padding:0px; background:#efefef; width: 40px; color: #666">
                        <div class="button" style="width:20px; padding: 10px;" @click="showMenu = !showMenu">
                            <i class="el-icon-menu"></i>
                        </div>
                        <div v-if="allowEdit" class="button" style="width:20px; padding: 10px; margin-top:10px;" @click="dialogVisible = true">
                            <i class="el-icon-edit"></i>
                        </div>
                    </div>

                </div>
                <div class="menu" v-show="showMenu">
                    <div style="padding: 10px; font-size: 25px; line-height: 45px; display:inline-block;">内容目录</div>
                    <div style="padding: 10px; font-size: 13px;">
                        <template v-for="(menu, i) in menus">
                            <div :style="'margin-left:' + menu.size + 'px;'" class='link-div' @click="anchorPoint(menu.id)" :key="i">
                                <a class="link" >{{menu.text}}</a>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <cc-dialog title="Markdown编辑" width="80%" min-height="80%" :visible="dialogVisible" @on-close="dialogVisible = false" :show-footer="false">
            <iframe style="width:100%; height:calc(100% - 10px)" :src="editSrc" frameborder="0"></iframe>
        </cc-dialog>
    </div>
</div>
</template>

<script>
import CommonUtil from '../../app/util/CommonUtil.js';
import Counter from '../../app/util/Counter.js';
import StringUtil from '../../app/util/StringUtil.js';
export default {
    data: function() {
        return {
            debug: false,
            debugData: {
                showCode: false
            },
            allowEdit: false,
            dialogVisible: false,      
            showMenu: false,
            id: null,
            html: null,
            fullUrl: null,
            fullPath: null,
            editSrc: null,
            menus: [],
            mdContent: null,
            directory: null
        }
    },
    props: {
        url: {
            type: String
        },
        code: {
            type: String
        },
        relative: {
            type: String,
            default: 'self' // self/out
        },
        tabRight: {
            type: Number,
            default: 0
        },
        tabTop: {
            type: Number,
            default: 0
        }
    },
    computed: {
        pageStyle() {
            var style = 'height: 100%;';
            if(this.relative == 'self') {
                style += 'position:relative;';
            }
            return style;
        },
        tabMenuBoxStyle() {
            
            var right = 0;
            var top = 0;

            if(this.relative == 'out') {
                right = 20;
                top = 20;
            }

            right += this.tabRight;
            top += this.tabTop;

            var style = `right:${right}px; top:${top}px;`;
            // console.log('tabMenuBoxStyle', style);
            return style;
        }
    },
    created() {
        this.id = Util.UUID();

        if(this.url != null) {
            this.initUrl();
        }
        Core.waitDomById(this.id, () => {
            this.initJs(() => {
                this.loadMarkdown();
            });
        });
    },
    methods: {
        initUrl() {
            // 获取fullUrl
            if(this.url.indexOf('/') == 0) {
                this.fullUrl = this.url;
            } else {
                let auto = this.$parent.auto;
                let parentFullUrl = auto.fullUrl;
                this.directory = parentFullUrl.substring(0, parentFullUrl.lastIndexOf('/') + 1);
                var fullUrl = this.directory + this.url;
                this.fullUrl = CommonUtil.shortUrl(fullUrl);
            }
            
            // console.log('location', location);
            var origin = location.origin;
            var relativePath = this.fullUrl.substring(origin.length);
            var basePath = Conf.frontPath;
            var fullPath = basePath + '/src' + relativePath;
            this.fullPath = fullPath;
            this.editSrc = origin + '/ace.html?editor/edit#filename=' + fullPath;
            this.allowEdit = true;
        },
        initJs(_call) {
            var modeuls = [
                'markdownit',
                'hljs',
                'loadHighlightCss'];
            ModuleDefine.load(modeuls, () => {
                console.log('load finish');
                _call();
            });
        },
        buildMd() {
            // Actual default values
            var md = markdownit({
                html: true,
                linkify: true,
                typographer: true,
                highlight: function (str, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return '<pre><code class="hljs">' +
                                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                                '</code></pre>';
                        } catch (__) {}
                    }

                    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
                }
            });
            return md;
        },
        loadMarkdown() {
            if(this.url != null) {
                this.loadMarkdownByUrl();
            } else if(this.code!= null) {
                this.mdContent = this.code;
                this.renderMarkdown(this.code);
            } else {
                this.loadMarkdownByContent();
            }
        },
        loadMarkdownByContent() {
            Core.waitDom('#content' + this.id, () => {
                var html = $('#content' + this.id).html();
                // console.log('html', html);
                html = this.replyCode(html);
                // this.$refs.mdContent.html(html);
                this.mdContent = html;
                this.renderMarkdown(html);
            });
        },
        replyCode(code) {
            var strs = code.split('\n');
            var regex = /^\s*/g;

            var firstLine = null;
            for (let i = 0; i < strs.length; i++) {
                const line = strs[i];
                // console.log('line', line);
                if(line.trim() != '') {
                    firstLine = line;
                    break;
                }
            }

            var matched = regex.exec(firstLine);
            var tabs = matched[0];
            var lines = [];
            var firstBlankLine = false;
            for (let i = 0; i < strs.length; i++) {
                var line = strs[i];
                if(line.trim() == '' && firstBlankLine == false) {
                    // first blank line;
                } else {
                    lines.push(line);
                }
            }

            var newLines = [];
            for (let i = 0; i < lines.length; i++) {
                var line = lines[i];
                // console.log('line', line);
                line = StringUtil.replaceAll(line, tabs, '');
                newLines[i] = line;
            }
            code = newLines.join('\n');
            return code;
        },
        renderMarkdown(code) {
            const md = this.buildMd();
            const html = md.render(code);
            // var parseInfo = md.parse(result);
            // console.log('parseInfo', parseInfo);
            var parseInfo = this.parseMenu(html);
            var domElements = parseInfo.domElements;
            this.menus = parseInfo.menus;
            $("#" + this.id).append(domElements);
        },
        loadMarkdownByUrl() {
            
            $.get(this.fullUrl, (result) => {
                // console.log('result', result);
                this.renderMarkdown(result);
            });
        },

        anchorPoint(id) {
            // console.log('uid', id);
            // console.log(document.querySelector('#' + id));
            document.querySelector('#' + id).scrollIntoView(true);
        },

        parseMenu(html) {
            // 构建目录
            var domElements = $.parseHTML(html);
            // console.log('domElements', domElements);
            var map = {
                "H1": 0,
                "H2": 10*2,
                "H3": 20*2,
                "H4": 30*2,
                "H5": 40*2,
                "H6": 50*2
            };
    
            var menus = [];
            for(var i in domElements) {
                var element = domElements[i];
                if(map[element.nodeName] != null) {
                    var text = element.innerText;
                    var name = element.nodeName;
                    element.id = Util.UUID();
                    menus.push({
                        id: element.id,
                        name: name,
                        text: text,
                        size: map[element.nodeName]
                    })
                }
            }
            return {
                domElements: domElements,
                menus: menus
            };
        }
    }
}
</script>

<style lang="less">
.page-markdown {

    .tab-menu-box {
        position: absolute;
    }
    .tab-menu {
        position: relative;
        .tab {
            position: absolute;
            top: 0px;
            right: 0px;
            .button:hover {
                background: #ddd;
                cursor: pointer;
            }
        }
        .menu {
            position: absolute;
            background: #fff;
            border:1px solid #ccc;
            right: 40px;
            top: 0px;
            width: 250px;

            .link-div {
                color:#428bca;
                padding: 3px;
            }
            .link-div:hover {
                background: #DDEEFF;
                cursor: pointer;
            }

        }
        .content {
            padding: 0 10px;
        }
    }
    
    table {
        border:1px solid #ddd;
    }
    th {
        background:#eee;
    }
    th,td {
        border:1px solid #eee;
        padding:5px 20px;
    }
  
}
</style>