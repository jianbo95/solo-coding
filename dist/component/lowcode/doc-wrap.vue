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

                <!-- <div style="background: #eee; padding: 5px; font-size:0.8rem; font-weight: bold;">代码</div> -->

                <multi-file-editor v-if="init" :file-list="fileList"></multi-file-editor>
            </div>

            <!-- <div v-show="showCodeByDiv" style="text-align:right; border-top:1px solid #aaa; padding: 5px;">
                <el-button size="small" type="primary" @click="onShowCode(false)">隐藏</el-button>
                <el-button size="small" type="success" @click="saveCode">保存</el-button>
            </div> -->
            <!-- End showCode -->
        </div>

        <!-- 增加弹框展示代码 -->
        <cc-dialog :visible="showCodeByDialog" min-height="80%" width="80%" title="代码查看"
            cancel-text='关闭' @on-close="onShowCode(false)" show-close>
            <div style="width: 100%; height: 100%; " >
                <multi-file-editor v-if="init" :file-list="fileList"></multi-file-editor>
            </div>
        </cc-dialog>

        <!-- <div :style="`height:${marginBottom}px;background:#eee;`"></div> -->
    </div>
</template>

<script>
import MultiFileEditor from './multi-file-editor.vue';
export default {
    components: {
        MultiFileEditor
    },
    data: function() {
        return {      
            init: false,
            currentDebug: false, 
            currentShowCode: null,
            parentBase: null,
            fileList: []
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
            }
            style += `border:1px solid #ddd; border-radius: 3px; width: calc(${this.width} - 22px); padding:10px;`;
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
        var auto = this.$parent.auto;
        if(auto != null) {
            var parentFullUrl = this.$parent.auto.fullUrl;
            this.parentBase = parentFullUrl.substring(0, parentFullUrl.lastIndexOf('/'));
        }

        this.currentShowCode = this.showCode;
        if(this.multiCode != null) {
            this.loadMultiCode();
        } else {

            if(this.src != null) {
                this.loadBySrc();
                return;
            }
            this.loadBySlot(auto => {
                var file = this.buildFile(null, auto.fullUrl);
                this.loadFileList([file]);
            });
        }
    },
    methods: {
        debugLog() {
        },
        loadFileList(list) {
            this.fileList = list;
            this.init = true;
        },
        buildFile(relativePath, requestPath) {
            if(relativePath != null) {
                return this.buildFile1(relativePath);
            } else {
                return this.buildFile2(requestPath);
            }
        },
        buildFile2(requestPath) {
            var basePath = Conf.frontPath;
            var baseUrlPath = location.origin;
            var relativePath = requestPath.replace(baseUrlPath, '');
            var fullPath = basePath + '/src' + relativePath;

            var file = {};
            file.path = requestPath;
            file.fullPath = fullPath;

            this.richFile(file);

            return file;
        },
        buildFile1(relativePath) {
            
            var file = {};
            var dir = this.parentBase;
            var trueUrl = dir + '/' + relativePath;
            trueUrl = CommonUtil.shortUrl(trueUrl);
            file.path = trueUrl;

            var basePath = Conf.frontPath;
            var baseUrlPath = location.origin;
            var relativePath = trueUrl.replace(baseUrlPath, '');
            var fullPath = basePath + '/src' + relativePath;
            file.fullPath = fullPath;

            this.richFile(file);

            return file;
        },
        richFile(file) {
            var path = file.path;
            var suffix = path.substring(path.lastIndexOf('.') + 1);
            var langModeMap = {
                'js': 'javascript',
                'vue': 'vue'
            };
            var filename = path.substring(path.lastIndexOf('/') + 1);
            file.langMode = langModeMap[suffix];
            file.filename = filename;
        },
        loadMultiCode() {
            var multiCode = this.multiCode;
            var files = [];
            for(var name in multiCode) {
                var relativePath = multiCode[name];
                var file = this.buildFile(relativePath);
                files.push(file);
            }
            this.loadFileList(files);
        },
        onShowCode(isShow) {
            this.currentShowCode = isShow;
            this.$emit('update:showCode', isShow);
        },
        loadBySrc() {
            var file = this.buildFile(this.src);
            this.loadFileList([file]);
        },
        loadBySlot(_call) {

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
    }
}
</script>

