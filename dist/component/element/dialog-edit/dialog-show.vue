<template>
    <div>
        <el-dialog append-to-body title="详细" :top="top" :visible.sync="currentVisible" :width="width">

            <div class="dialog-edit-s1 scroll-y" :style="style.scroll">
            
            <div class="content">
                <slot name="content-header">
                </slot>
                <template v-for="(item, i) in editField">
                    <!-- {{item.name}} -->
                    <div style="margin-bottom:10px;">
                        <!-- 输入框 -->
                        <template v-if="getItemType(item) == null || true">
                            <div class="title" :style="style.title">{{item.name}}</div>
                            <div class="input" :style="style.input">
                                <!-- {{form[item.field]}} -->
                                {{formValue(item)}}
                            </div>
                        </template>
                    </div>
                </template>
                
                <slot></slot>
                
            </div>

            </div>

            <template v-slot:footer>
                <span style="float:left;">
                    <slot name="footer-left">
                    </slot>
                </span>
                
                <span class="dialog-footer">
                    <el-button size="mini" type="primary" @click="onConfirm">关 闭</el-button>
                </span>
            </template>

        </el-dialog>
        
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            style: {
                title: 'width:' + this.textWidth,
                input: 'width:' + this.inputWidth(),
                scroll: 'max-height:' + this.calcMaxHeight()
            },
            currentVisible: false,
            currentTitle: '',
            options: null,
            form: {}
        }
    },
    props: {
        width: {
            default: '600px',
            type: String
        },
        value: Object,
        textWidth: {
            default: '150px',
            type: String
        },
        height: {
            default: '70%',
            type: String
        },
        top: {
            default: '40px',
            type: String
        },
        title: String,
        visible: Boolean,
        map: Object,
        editField: Array
    },
    created: function() {
        // console.log('editField', this.editField);
        this.form = this.value;
        // console.log('load data', this.value);
        this.currentTitle = this.title;
        
        this.currentVisible = this.visible;
        // console.log('maxHeight', this.calcMaxHeight());
    },
    watch: {
        // data: function() {
        //     this.form = this.data;
        // },
        value: function(v) {
            // console.log('v-model value change');
            this.form = v;
        },
        title: function(value) {
            this.currentTitle = value;
        },
        visible: function(value) {
            this.currentVisible = this.visible;
        },
        currentVisible: function(value) {
            // 实现 visible 与 currentVisible 双向绑定
            this.$emit('update:visible', this.currentVisible);
        }
    },
    methods: {
        inputWidth: function() {
            var totalWidth = this.widthNumber(this.width);
            var titleWidth = this.widthNumber(this.textWidth);
            var inputWidth = totalWidth - titleWidth - 60 + 'px';
            return inputWidth;
        },
        widthNumber: function(width) {
            return Number(width.replace('px', ''));
        },
        open: function(title) {
            if(title == '新增') {
                this.form = {};
            }
            this.currentTitle = title;
            this.currentVisible = true;
        },
        onConfirm: function() {
            // console.log('on dialog confirm');
            this.currentVisible = false;
        },
        testInput: function(v) {
            console.log('testInput', v);
        },
        calcMaxHeight: function() {
            var value = this.calcMaxHeightValue();
            console.log('calcMaxHeight', value);
            return value;
        },
        calcMaxHeightValue: function() {
            var height;
            if(this.height.indexOf('%') != -1) {
                var rate = Number( this.height.replace('%', '') ) / 100;
                height = document.body.clientHeight * rate + 'px'
            } else if(this.height.indexOf('px') != -1) {
                height = this.height;
            } else {
                height = this.height + 'px';
            }
            if(height === '0px') {
                height = '500px';
            }
            // TODO 高度动态设置
            return height;
        },
        getItemType: function( item ) {
            if(item.type != null) {
                return item.type;
            }
            if(item.map != null) {
                return 'selectOne';
            }
            if(item.mapName != null) {
                return 'selectOne';
            }
            return null;
        },
        getMap: function( item ) {
            if(item.map != null) {
                return item.map;
            }
            var field = item.field;
            if(item.mapName != null) {
                field = item.mapName;
            }
            if(this.map != null && this.map[field] != null) {
                return this.map[field];
            }
            return null;
        },
        formValue(item) {
            let map = this.getMap(item);
            let value = this.form[item.field];
            if(map == null) {
                return value;
            } else {
                return map[value];
            }
        }
    },
    
}
</script>

<style>
    .input-select {
        /* display: table-cell; */
        width:100%;
    }
    .dialog-edit-s1 .content {
        padding:10px 10px 10px 20px;
    }
    .dialog-edit-s1 .title {
        display: inline-block;
    } 
    .dialog-edit-s1 .input {
        display: inline-block;
    }
</style>