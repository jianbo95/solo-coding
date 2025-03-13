<template>
    <div :style="style" class=".editor-ace">
        <iframe :src="src" frameborder="0" style="height:100%;width:100%;"></iframe>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            src: null,
            iframe: null,
            Editor: null,
            inputValue: null,
            id: null
        }
    },
    computed: {
        style() {
            var style = '';
            if(this.width != null) {
                style += 'width:calc(' + this.width + ' + 10px);';
            }
            if(this.height != null) {
                style += 'height:calc(' + this.height + ' - 10px)';
            }
            return style;
        }
    },
    props: {
        width: {
            type: String
        },
        height: {
            type: String
        },
        lang: {
            type: String
        },
        selection: {
            default: '',
            type: String
        },
        value: {
            default: '',
            type: String
        }
    },
    created() {
        this.initData();
        this.initEvent();
        this.onLoadEditor((iframe) => {
            this.loadEditor(iframe);
        });
        // this.initEditor(() => {
        //     this.loadEditor();
        // });
    },
    methods: {  
        initData() {
            var id = Math.random();
            this.id = id;
            var src = "./ace.html?id=" + id;
            if(this.width != null) {
                src += '&width=' + this.width;
            }
            if(this.height != null) {
                src += '&height=' + this.height;
            }
            if(this.lang != null) {
                src += '&lang=' + this.lang;
            }
            src += '#filename=memory';
            this.src = src;
        },  
        initEvent() {
            var id = this.id;
            GlobalEvent.addEventListener(id, (data) => {
                // 根据id监听事件
                this.input(data);
            });
        },
        onLoadEditor(_call) {
            var id = this.id;
            GlobalEvent.addEventListener('load' + id, (iframe) => {
                // 根据id监听load事件
                _call(iframe);
            });
        },
        loadEditorFinish() {
            var current = this.Editor.current();
            this.$emit('load-finish', current);
            // console.log('load editor finish', current);
            current.setValue(this.value);
            // console.log('setValue', this.value);
            
            var session = current.getSession();
            session.on('change', () => {
                var value = current.getValue(); 
                console.log('value', value);
                this.input(value);
            });

            session.selection.on('changeSelection', () => {
                // 同步到selection
                var text = session.getTextRange(current.getSelectionRange());
                this.$emit('update:selection', text);
            });
        },
        loadEditor(iframe) {
            this.iframe = iframe;
            
            var timer = setInterval(() => {
                if(iframe.Editor !=  null) {
                    if(iframe.Editor.current() != null) {
                        var current = iframe.Editor.current();
                        if(current.setValue != null) {
                            clearInterval(timer);
                            this.Editor = iframe.Editor;
                            this.loadEditorFinish();
                        }
                    }
                }
            }, 100);
        },

        input: function(inputValue) {
            // 实现双向绑定
            // console.log('input event', inputValue);
            this.inputValue = inputValue;
            this.$emit('input', inputValue);
        },
    },
    watch: {
        value() {
            var current = this.Editor.current();
            if(this.value == current.getValue()) {
                // 避免循环设置
                return;
            }
            current.setValue(this.value);
        }
    }
}
</script>

<style lang="less">
.editor-ace {
    .ace_content {
        background-color: #262628!important;
        color: #d8d9da!important;
        border: 1px solid rgba(0,0,0,.2)!important;
        width: 2024px!important;    
    }
}
</style>