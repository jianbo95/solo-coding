<template>
    <div :style="style" class="page-doc-wrap">
        
        <div v-if="title != ''">
            <h4 style="float:left; padding: 0px; margin: 0px; ">{{title}}</h4>
            <div style="clear:both;"></div>
        </div>
        
        <div>
            {{info}}
        </div>
        <div :style="contentStyle" class="doc-content">
            <div v-if="false" style="background:#eee; padding: 5px;">&nbsp;</div>
            
            <div :style="slotStyle" class="doc-slot" ref="slot-div">
                <slot></slot>
            </div>

            <div>
                <!-- <div>展示代码</div> -->
                <el-button size="mini" style="margin-top:0px;" @click="onShowCode(true)" v-if="currentShowCode == false">
                    展示代码
                </el-button>
                <el-button size="mini" style="margin-top:0px;" @click="onShowCode(false)" v-if="currentShowCode == true">
                    隐藏代码
                </el-button>
            </div>

            <!-- Start showCode -->
            <div v-show="showCodeByDiv" style="border:0px solid #aaa;">
                
                <div style="font-size:12px;" v-if="currentDebug">
                    <div>
                        文档组件地址 {{path}}
                    </div>
                    <div>
                        文档物理地址 {{fullPath}}
                    </div>
                    <div v-if="false">
                        <el-button size="mini" @click="debugLog">调试日志</el-button>
                    </div>
                </div>

                <div style="background: #eee; padding: 5px; font-size:0.8rem; font-weight: bold;">代码</div>

                <template v-if="multiCode == null">
                    <div style="width: 100%;">
                        <cc-input-ace v-if="init" v-model="code" :mode="langMode" height="auto" :use-wrap="false"></cc-input-ace>
                    </div>
                </template>
                <template v-else>
                    <el-tabs v-model="activeCode">
                        <!-- <template v-for="() in multiCode"></template> -->
                        <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
                        <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
                        <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
                        <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
                    </el-tabs>
                </template>
            </div>

            <div v-show="showCodeByDiv" style="text-align:right; border-top:1px solid #aaa; padding: 5px;">
                <el-button size="small" type="primary" @click="onShowCode(false)">隐藏</el-button>
                <el-button size="small" type="success" @click="saveCode">保存</el-button>
            </div>
            <!-- End showCode -->
        </div>

        <!-- 增加弹框展示代码 -->
        <cc-dialog :visible="showCodeByDialog" min-height="80%" width="80%" title="代码查看" show-confirm
            confirm-text='保存' cancel-text='关闭' @on-close="onShowCode(false)"
            @on-confirm="saveCode">
            <div style="width: 100%; height: 100%; " >
                <cc-input-ace v-if="init" v-model="code" :mode="langMode" height="auto" :use-wrap="false"></cc-input-ace>
            </div>
        </cc-dialog>

        <!-- <div :style="`height:${marginBottom}px;background:#eee;`"></div> -->
    </div>
</template>

<script>
import Constants from '../../app/data/Constants';
export default {
    data: function() {
        return {      
            init: false,
            currentDebug: false, 
            currentShowCode: null,
            path: null,
            fullPath: null,
            code: null,
            langMode: 'vue',
            activeCode: null
        }
    },
    props: {
        multiCode: {
            type: Object, 
            default: null
        },
        showCode: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        info: {
            type: String,
            default: ''
        },
        src: {
            type: String,
            default: null
        },
        codeMode: {
            type: String, // div/dialog
            default: 'div'
        },
        marginBottom: {
            type: Number,
            default: 40
        },
        marginTop: {
            type: Number,
            default: 50
        },
        contentWidth: {
            type: String,
            default: '300px'
        },
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: 'auto' // auto
        }
    },
    computed: {
        currentContentWidth() {
            if(this.contentWidth == '100%') {
                return 'calc(100% - 10px)';
            }
            return this.contentWidth;
        },
        contentStyle() {
            var style = 'padding: 0px; margin-top: 10px; overflow-y: auto;';
            if(this.height != 'auto') {
                style += 'height:calc(' + this.height + ' - 120px);';
            }
            if(this.currentDebug) {
                style += 'border:1px solid red;';
            }
            return style;
        },
        // slotStyle 上面一层是 contentStyle
        slotStyle() {
            var style = 'padding: 5px; width:' + this.currentContentWidth +';';
            if(this.height != 'auto') {
                style += 'height:calc(100% - 40px); overflow-y:auto;';
            }
            // console.log('slotStyle', style);
            return style;
        },
        style() {
            var style = '';
            // var style = `margin-bottom: ${this.marginBottom}px;`;
            style += `width: ${this.width}; margin-top:${this.marginTop}px;`;
            if(this.height != 'auto') {
                style += 'height:' + this.height + '; overflow-y: auto;';
            }
            if(this.currentDebug) {
                style += `border:1px solid black; width: calc(${this.width} - 2px;)`;
            }
            return style;
        },
        showCodeByDiv() {
            if(this.codeMode == 'div') {
                return this.currentShowCode;
            }
            return false;
        },
        showCodeByDialog() {
            if(this.codeMode == 'dialog') {
                return this.currentShowCode;
            }
            return false;
        }
    },
    created() {
        this.currentShowCode = this.showCode;
        if(this.multiCode != null) {
            this.loadMultiCode();
        } else {
            this.loadAuto(auto => {
                console.log('loadAuto', auto);
                this.path = auto.fullUrl;
                var basePath = Conf.frontPath;
                var baseUrlPath = location.origin;
                var relativePath = auto.fullUrl.replace(baseUrlPath, '');
                var fullPath = basePath + '/src' + relativePath;
                this.fullPath = fullPath;
                // console.log('UrlData', window.loader.UrlData);
                var code = window.loader.UrlData[this.path];
                if(code == null) {
                    $.get(this.path, {}, (result) => {
                        this.loadCode(result);
                    }, 'text');
                } else {
                    this.loadCode(code);
                }
            });
        }
    },
    methods: {
        debugLog() {
            console.log(this.$children);
        },
        loadCode(code) {
            this.code = code;
            if(this.path.endsWith('.js')) {
                this.langMode = 'javascript';
            }
            this.init = true;
        },
        onShowCode(isShow) {
            this.currentShowCode = isShow;
            this.$emit('update:showCode', isShow);
        },
        loadBySrc(_call) {
            // console.log(this.$parent.auto);
            var fullUrl = this.$parent.auto.fullUrl;
            var dir = fullUrl.substring(0, fullUrl.lastIndexOf('/'));
            var trueUrl = dir + '/' + this.src;
            trueUrl = CommonUtil.shortUrl(trueUrl);
            // console.log('loadBySrc', trueUrl);
            var auto = {
                fullUrl: trueUrl
            };
            _call(auto);
        },
        loadAuto(_call) {
            if(this.src != null) {
                this.loadBySrc(_call);
                return;
            }

            // 新方法，通过 slots
            Core.waitRef(this.$refs, 'slot-div', () => {

                Core.waitProducer( auto => {
                    _call(auto);
                }, () => {
                    // console.log('this.$slots', this.$slots);
                    var node = this.$slots.default[0];
                    if(node.componentInstance != null) {
                        return node.componentInstance.auto;
                    } else {
                        console.log('retry find');
                    }
                });

            });
        },
        saveCode() {
            var param = {
                filename: this.fullPath,
                data: this.code
            };
            // 保存代码
            var url = Constants.root + ApiPath.fileSave;
            Core.post(url, param, (result) => {
                UI.success('保存成功');
            });
        },
        loadMultiCode() {
            
        }
    }
}
</script>