<template>
    <div>
        <el-dialog append-to-body :title="currentTitle" :top="top" :visible.sync="currentVisible" :width="width" ref="dialog" v-dialog-drag :modal="false" :fullscreen="fullScreen" :close-on-click-modal="false">
            <template v-slot:title>
                <el-row  type="flex" justify="end">
                    <el-col :span="12"> {{currentTitle}}</el-col>
                    <el-col :span="12">
                        <div class="dialog-setwin">
                            <a href="javascript:;" class="dialog-ico dialog-min" v-show="fullScreen" @click="fullScreen=!fullScreen"></a>
                            <a href="javascript:;" class="dialog-ico dialog-max dialog-maxmin" v-show="!fullScreen" @click="fullScreen=!fullScreen"></a>
                        </div>
                    </el-col>
                </el-row>
            </template>
            <div class="dialog-edit-s1 scroll-y" :style="style.scroll">

            <div class="content">
                <slot name="content-header">
                </slot>
                <template v-for="(item, i) in currentEditField">
                    <!-- {{item.name}} -->
                    <div style="margin-bottom:10px;">
                        <!-- 输入框 -->
                        <template v-if="getItemType(item) == null">
                            <div class="title" :style="style.title">{{item.name}}</div>
                            <div class="input" :style="style.input" >
                                
                                <div v-if="item.clickInput" style="position:absolute; left: 0px; top: 0px; z-index:1000; width:calc(100% - 35px); height: 100%;" 
                                    @click="clickInput(item)">
                                </div>

                                <div v-if="item.clickInput" style="position:absolute; right: 10px; top: 7px; z-index:1001; cursor:pointer;"
                                    @click="closeData(item)">
                                    <i class="el-icon-circle-close"></i>
                                </div>

                                <el-input :size="item.size" :show-password="item.showPassword" :disabled="item.disabled" placeholder="请输入内容" 
                                    v-model="form[item.field]" 
                                    @blur="onBlur(event,item)"
                                    :clearable="item.clearable">
                                </el-input>
                            </div>
                        </template>

                        <!-- 多选框 -->
                        <template v-if="getItemType(item) == 'select'">
                            <div class="title" :style="style.title">{{item.name}}</div>
                            <div class="input" :style="style.input">
                                <div class="input-select">
                                    <!-- options 和 map 中必须有一项，options 不存在时根据map构建options -->
                                    <cc-select-multi :size="item.size" :collapse-tags="item.collapseTags" :options="item.options" :map="getMap(item)" v-model="form[item.field]">
                                    </cc-select-multi>
                                </div>
                            </div>
                        </template>

                        <!-- 单选框 -->
                        <template v-if="getItemType(item) == 'selectOne'">
                            <div class="title" :style="style.title">{{item.name}}</div>
                            <div class="input" :style="style.input">
                                <div class="input-select">
                                    <cc-select-single :size="item.size" :disabled="item.disabled" :map="getMap(item)" v-model="form[item.field]">
                                    </cc-select-single>
                                </div>
                            </div>
                        </template>

                        <!-- 级联选择 -->
                        <template v-if="getItemType(item) == 'selectLevel'">
                            <div class="title" :style="style.title">{{item.name}}</div>
                            <div class="input" :style="style.input">
                                <div class="input-select">
                                    <cc-select-level :size="item.size" @input="testInput" value-field='id' label-field='text' :options="item.options" v-model="form[item.field]">
                                    </cc-select-level>
                                </div>
                            </div>
                        </template>

                        <!-- Radio 单选框 -->
                        <template v-if="getItemType(item) == 'selectRadio'">
                            <div class="title" :style="style.title">{{item.name}}</div>
                            <div class="input" :style="style.input">
                                <div class="input-select" style="padding:5px 0">
                                    <cc-select-radio :disabled="item.disabled" v-model="form[item.field]" :map="getMap(item)" :size="item.size"></cc-select-radio>
                                </div>
                            </div>
                        </template>

                        <!-- 时间选择 -->
                        <template v-if="getItemType(item) == 'dateTime'">
                            <div class="title" :style="style.title">{{item.name}}</div>
                            <div class="input" :style="style.input">
                                <div class="input-select">
                                    <el-date-picker style="width:100%;" v-model="form[item.field]" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" type="datetime" :size="item.size" :disabled="item.disabled"></el-date-picker>
                                </div>
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
                    <el-button size="mini" @click="currentVisible = false">取 消</el-button>
                    <el-button size="mini" type="success" @click="onConfirm">确 定</el-button>
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
            form: {},
            fullScreen:false
        }
    },
    props: {
        autoClose: {
            default: true,
            type: Boolean
        },
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
        size: {
            default: 'small',
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
    computed: {
        currentEditField() {
            let fields = [];
            for (let i = 0; i < this.editField.length; i++) {
                const element =  Util.clone(this.editField[i]);
                if(element.size == null) {
                    element.size = this.size;
                }
                fields.push(element);
            }
            return fields;
        }
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
            // var inputWidth = totalWidth - titleWidth - 90 + 'px';
            var inputWidth = totalWidth - titleWidth - 100 + 'px';
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
            if(this.autoClose) {
                this.currentVisible = false;
            }
            this.$emit('input', this.form);
            this.$emit('on-confirm');
            if(this.currentTitle == '新增') {
                this.$emit('on-add-confirm');
            } else if(this.currentTitle == '修改' || this.currentTitle == '编辑') {
                this.$emit('on-edit-confirm');
            }
        },
        testInput: function(v) {
            console.log('testInput', v);
        },
        calcMaxHeight: function() {
            if(this.height.indexOf('%') != -1) {
                var rate = Number( this.height.replace('%', '') ) / 100;
                return document.body.clientHeight * rate + 'px'
            } else if(this.height.indexOf('px') != -1) {
                return this.height;
            } else {
                return this.height + 'px';
            }
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
        clickInput: function(item) {
            console.log('clickInput', item.field);
            this.$emit('field-click', item.field);
        },
        onBlur(val,item){
            this.$emit('blur',this.form,item)
        },
        closeData(item) {
            this.form[item.field] = '';
            this.$emit('input', this.form);
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
        background-color: #fff;
        width: calc(100% - 70px);
        margin: 0 auto;
    }
    .dialog-edit-s1 .title {
        display: inline-block;
    } 
    .dialog-edit-s1 .input {
        display: inline-block;
        position: relative;
    }
</style>