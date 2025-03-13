<template>
    <div v-if="init" :style="style">
        <div v-if="currentDebug">
            id:{{id}} <el-button @click="debug">debug</el-button>
            <div v-if="exitError">错误信息：{{errorInfo}}</div>
        </div>
        <div v-if="initEditor" ref="ace" :id="id" style="width:100%;height:100%;position:absolute;">{{currentValue}}</div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {     
            currentDebug: false,
            exitError: false,
            errorInfo: '',

            init: false,
            initEditor: false,
            id: 'wait',
            editor: null,
            self: null,
            currentValue: null,
            listenEvent: true,
        }
    },
    props: {
        width: {
            default: '100%',
            type: String
        },
        height: {
            default: '100%',
            type: String
        },
        value: {
            default: '',
            type: String
        },
        fontSize: {
            default: 14,
            type: Number
        },
        theme: {
            type: String,
            description: '主题',
            default: 'github' // monokai/github
        },
        mode: {
            type: String,
            default: 'json'
        },
        useWrap: {
            type: Boolean,
            default: true
        }
    },
    created() {
        // console.log('init js created', this.mode);
        // 创建id
        this.id = Util.UUID();
        // if(this.value == null) {
        //     this.currentDebug = true;
        //     this.exitError = true;
        //     this.errorInfo = '初始值不存在';
        //     this.init = true;
        //     return;
        // }
        // console.log('this.id', this.id);
        this.initJs(() => {
            // console.log('init js finish');
            this.loadEditor();
        });
    },
    computed: {
        style() {
            var height = this.height;
            if(height == 'auto') {
                if(this.value != null) {
                    var lines = this.value.split('\n');
                    var size = lines.length;
                    height = 18.3 * size + 'px';
                    // console.log('auto height', height, size);
                }
            }
            var style = 'width:' + this.width + ';height:' + height + ';position:relative;';
            return style;
        }
    },
    methods: {
        loadEditor() {
            this.initEditor = true;
            this.init = true;
            Core.waitDom('#' + this.id, () => {
                // console.log('load input-ace.vue', window);
                var editor = ace.edit(this.id);
                this.editor = editor;
                editor.setTheme("ace/theme/" + this.theme);
                editor.session.setMode("ace/mode/" + this.mode);
                editor.session.setUseWrapMode(this.useWrap);
                // use setOptions method to set several options at once
                // editor.setOptions({
                //     autoScrollEditorIntoView: true,
                //     copyWithEmptySelection: true,
                // });
                editor.setFontSize(this.fontSize);
                
                editor.setValue(this.value);
                editor.gotoLine(1);

                this.currentValue = this.value;

                // TODO 这里频繁调用？
                editor.session.on('change', (delta) => {
                    // delta.start, delta.end, delta.lines, delta.action
                    // console.log('data change', delta);
                    // 取编辑器内文本内容
                    // console.log(editor.getValue()); 
                    if(this.listenEvent) {
                        if(this.currentValue != editor.getValue()) {
                            this.currentValue = editor.getValue();
                            this.$emit('input', editor.getValue());
                        }
                    }
                });
            }, 2000, () => {
                console.error('this.id', this.id);
                console.error('this.value', this.value);
                console.error('ref', this.$refs.ace);
            });
        },
        initJs(_call) {
            ModuleDefine.load('loadAce', () => {
                // console.log('load finish');
                _call();
            });
        },
        debug() {
            this.id = 'debug';
        }
    },
    watch: {
        value(value) {
            // console.log('props value change', value);
            // console.log('props current value', this.currentValue);
            if(value == this.currentValue) {
                return;
            }
            
            // if(this.editor == null) {
            //     console.error('this.editor is null', this.editor);
            // }

            this.currentValue = value;

            if(this.editor != null) {
                this.listenEvent = false;
                this.editor.setValue(value);

                setTimeout(() => {
                    // 光标优化
                    this.editor.gotoLine(1);
                    this.listenEvent = true;
                }, 100);
            }
        }
    }
}
</script>

<style lang="less">
.ace_editor, .ace_editor *{
font-family: "Monaco", "Menlo", "Ubuntu Mono", "Droid Sans Mono", "Consolas", monospace !important;
font-weight: 400 !important;
letter-spacing: 0 !important;
}
</style>