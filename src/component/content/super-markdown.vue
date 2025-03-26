<template>
    <div class="super-markdown">
        <div class="markdown-content" v-html="renderedContent"></div>
        
        <div class="tab-menu-box">
            <div class="tab-menu">
                <div class="tab">
                    <div style="font-size:20px; padding:0px; background:#efefef; width: 40px; color: #666">
                        <div class="button" style="width:20px; padding: 10px;" @click="showMenu = !showMenu">
                            <i class="el-icon-menu"></i>
                        </div>
                    </div>
                </div>
                <div class="menu" v-show="showMenu">
                    <div style="padding: 10px; font-size: 25px; line-height: 45px; display:inline-block;">目录</div>
                    <div style="padding: 10px; font-size: 13px;">
                        <template v-for="menu in menus">
                            <div :style="'margin-left:' + menu.size + 'px;'" class='link-div' @click="anchorPoint(menu.id)">
                                <a class="link">{{menu.text}}</a>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'super-markdown',
    props: {
        code: {
            type: String,
            required: true
        },
        relative: {
            type: String,
            default: 'self'
        }
    },

    data() {
        return {
            renderedContent: '',
            showMenu: false,
            menus: []
        }
    },

    created() {
        this.initJs(() => {
            this.renderMarkdown()
        });
    },

    methods: {
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
        renderMarkdown() {
            if (this.code) {
                const md = window.markdownit({
                    html: true,
                    linkify: true,
                    typographer: true,
                    highlight: function (str, lang) {
                        if (lang && window.hljs.getLanguage(lang)) {
                            try {
                                const highlightedCode = window.hljs.highlight(str, { language: lang }).value;
                                const lines = highlightedCode.split('\n');
                                const lineNumbers = lines.map((_, index) => `<span class="line-number">${index + 1}</span>`).join('');
                                return `<div class="code-block-wrapper">
                                    <div class="line-numbers">${lineNumbers}</div>
                                    <div class="code-content">${lines.join('\n')}</div>
                                    <div class="lang-label">${lang}</div>
                                </div>`;
                            } catch (__) {}
                        }
                        return '';
                    }
                })

                // 添加标题锚点插件
                md.renderer.rules.heading_open = function (tokens, idx) {
                    const token = tokens[idx];
                    const id = 'heading-' + Math.random().toString(36).substr(2, 9);
                    return `<${token.tag} id="${id}">`;
                };

                // 解析目录
                // 渲染 markdown
                this.code =StringUtil.replaceAll(this.code, '\\(@', '(' + window.Site);
                this.renderedContent = md.render(this.code);

                // 解析目录
                setTimeout(() => {
                    const parseInfo = this.parseMenu(this.renderedContent);
                    this.menus = parseInfo.menus;
                }, 0);
                // this.renderedContent = parseInfo.domElements.map(el => el.outerHTML).join('')
            }
        },
        parseMenu(html) {
            const domElements = document.querySelector('.markdown-content').children;
            const map = {
                "H1": 0,
                "H2": 20,
                "H3": 40,
                "H4": 60,
                "H5": 80,
                "H6": 100
            };
            
            const menus = [];
            Array.from(domElements).forEach(element => {
                if (map[element.tagName] != null) {
                    menus.push({
                        id: element.id,
                        name: element.tagName,
                        text: element.innerText,
                        size: map[element.tagName]
                    });
                }
            });

            return {
                domElements,
                menus
            };
        },

        anchorPoint(id) {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }
    }
}
</script>

<style lang="less">
.super-markdown {
position: relative;

.markdown-content {

    line-height: 1.6;
    word-wrap: break-word;
    
    p {
        margin: 1em 0;
    }

    h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 1em;
    }

    code {
        padding: 0.2em 0.4em;
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
    }

    pre {
        border: 1px solid #ddd;
        position: relative;
        padding: 0 0;
        margin: 10px 0 ;
        background-color: #eee;

        .code-block-wrapper {
            display: flex;
            font-family: Consolas, Monaco, 'Courier New', monospace;
            font-size: 14px;

            position: relative ;

            .lang-label {
                position: absolute;
                top: 0;
                right: 0;
                padding: 4px 8px;
                font-size: 12px;
                color: #666;
                background-color: #f6f8fa;
                border-left: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                border-bottom-left-radius: 3px;
                user-select: none;
            }
            
            .line-numbers {
                user-select: none;
                text-align: right;
                padding: 0 12px;
                color: #999;
                background-color: #f6f8fa;
                border-right: 1px solid #ddd;
                
                .line-number {
                    display: block;
                    line-height: 1.6;
                }
            }
            
            .code-content {
                padding: 0 16px;
                overflow-x: auto;
                flex: 1;

                > code {
                    display: block;
                    line-height: 20px;
                }
            }
        }

        code {
            padding: 0;
            background-color: transparent;
            
            // 添加高亮相关样式
            .hljs-keyword,
            .hljs-selector-tag,
            .hljs-built_in,
            .hljs-name,
            .hljs-tag {
                color: #d73a49;
            }

            .hljs-string,
            .hljs-title,
            .hljs-section,
            .hljs-attribute,
            .hljs-literal,
            .hljs-template-tag,
            .hljs-template-variable,
            .hljs-type,
            .hljs-addition {
                color: #032f62;
            }

            .hljs-comment,
            .hljs-quote,
            .hljs-deletion,
            .hljs-meta {
                color: #6a737d;
            }

            .hljs-number,
            .hljs-regexp,
            .hljs-symbol,
            .hljs-variable,
            .hljs-template-variable,
            .hljs-link,
            .hljs-selector-attr,
            .hljs-selector-pseudo {
                color: #005cc5;
            }
        }
    }
}

.tab-menu-box {
    position: fixed;
    right: 0px; top: 80px;
    z-index: 100;
}

.tab-menu {
    position: relative;
    .tab {
        position: absolute;
        top: 0;
        right: 0;
        .button:hover {
            background: #ddd;
            cursor: pointer;
        }
    }
    .menu {
        position: absolute;
        background: #fff;
        border: 1px solid #ccc;
        right: 40px;
        top: 0;
        width: 250px;

        .link-div {
            color: #428bca;
            padding: 3px;
            &:hover {
                background: #DDEEFF;
                cursor: pointer;
            }
        }
    }
}
}
</style>