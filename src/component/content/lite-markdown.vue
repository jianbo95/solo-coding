<template>
<div class="page-markdown" :style="pageStyle">

    <!-- TODO markdown 支持自限高度 -->
    <div style="height: 100%; overflow-y:auto;">

        <div :id="id" class="content">
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
                            <div :style="'margin-left:' + menu.size + 'px;'" class='link-div' @click="anchorPoint(menu.id)" 
                                >
                                <a class="link" >{{menu.text}}</a>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

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

        this.initJs(() => {
            Core.waitDomById(this.id, () => {
                this.loadMarkdown();
            });
        });
    },

    methods: {
        initJs(_call) {
            var modeuls = [
                'markdownit',
                'hljs',
                'loadHighlightCss'
            ];
            ModuleDefine.load(modeuls, () => {
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
                    var typeDiv = '<div class="codeType">'+lang+'</div>';
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return `<div class="code">${typeDiv}<pre><code class="hljs">` +
                                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                                '</code></pre></div>';
                        } catch (__) {}
                    }

                    return `<div class="code">${typeDiv}<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre></div>`;
                }
            });
            return md;
        },
        loadMarkdown() {
            this.mdContent = this.code;
            this.renderMarkdown(this.code);
        },
        renderMarkdown(code) {
            const md = this.buildMd();
            console.log('code', code);
            const html = md.render(code);

            var parseInfo = this.parseMenu(html);
            var domElements = parseInfo.domElements;
            this.menus = parseInfo.menus;
            $("#" + this.id).append(domElements); 
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