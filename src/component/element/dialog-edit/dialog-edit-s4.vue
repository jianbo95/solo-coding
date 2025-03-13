<template>
    <div v-if="init && currentVisible">
        <el-dialog append-to-body :title="currentTitle" :top="top" 
            :visible.sync="currentVisible" :width="width" ref="dialog" 
            v-dialog-drag 
            :modal="true" 
            :fullscreen="fullScreen" 
            @close="onClose"
            :close-on-click-modal="false">
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
            <el-form :model="form" ref="ruleForm" :rules="rules" label-position="left" :label-width="textWidth">
                <div class="dialog-edit-s1 scroll-y" :style="style.scroll">
                    <div class="content">
                        <slot name="content-header">
                        </slot>
                        <template v-for="(item, i) in currentEditField">
                            <!-- 左对齐 -->
                            <el-col :span="item.span" :key="i">
                                <el-form-item :prop="item.field" :label="item.name" v-if="item.hidden != true">
                                    <div class="input" :style="style.input">

                                        <div v-if="item.clickInput" style="position:absolute; left: 0px; top: 0px; z-index:1000; width:calc(100% - 35px); height: 100%;" 
                                            @click="clickInput(item)">
                                        </div>

                                        <div v-if="item.clickInput" style="position:absolute; right: 10px; top: 1px; z-index:1001; cursor:pointer;"
                                            @click="closeData(item)">
                                            <i class="el-icon-circle-close"></i>
                                        </div>

                                        <div class="input-select">
                                            <cc-input :size="item.size" 
                                                :mode="item.mode" 
                                                :map="getMap(item)" 
                                                :rows="item.rows"
                                                v-model="form[item.field]" 
                                                :placeholder="item.placeholder"
                                                :collapse-tags="item.collapseTags"
                                                :disabled="item.disabled"
                                                :options="item.options"
                                                :input-type="item.inputType"
                                                style="width:100%;"></cc-input>
                                        </div>
                                    </div>
                                </el-form-item>
                            </el-col>
                        </template>
                        
                        <slot></slot>

                        <template v-if="currentMode == 'add'">
                            <slot name="add"></slot>
                        </template>

                        <template v-if="currentMode == 'edit'">
                            <slot name="edit"></slot>
                        </template>

                        <div style="clear:both;"></div>
                    </div>
                </div>
            </el-form>
            <template v-slot:footer>
                <span style="float:left;">
                    <slot name="footer-left">
                    </slot>
                </span>
                
                <span class="dialog-footer">
                    <el-button size="mini" @click="onClose">取 消</el-button>
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
            init: false,
            style: {
                title: 'width:' + this.textWidth,
                input: 'width:' + this.inputWidth(),
                scroll: 'height:' + this.calcMaxHeight()
            },
            currentVisible: false,
            currentTitle: '',
            currentMode: '',
            options: null,
            form: {},
            fullScreen:false,
            rules: {}
        }
    },
    props: {
        span: {
            default: 24,
            type: Number
        },
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
        mode: {
            default: 'add', // add/edit 新增/编辑
            type: String
        },
        size: {
            default: 'small',
            type: String
        },
        title: {
            default: null,
            type: String
        },
        visible: Boolean,
        map: Object,
        editField: {
            default: function() { return [] },
            type: Array
        }
    },
    created: function() {
        console.log('created dialog-edit ' + this.title);
        // console.log('editField', this.editField);
        this.initRule();
        this.form = this.value;
        // console.log('load data', this.value);
        this.currentVisible = this.visible;
        this.currentTitle = this.title;
        this.currentMode = this.mode;
        this.init = true;
    },
    computed: {
        currentEditField() {
            let fields = [];
            let typeToMode = {
                'selectOne': 'select', // 单选
                'select': 'multi', // 多选(该写法已废弃)
                'selectMulti': 'multi', // 多选
                'selectRadio': 'radio', // 单选框
                'dateTime': 'dateTime', 
                'date': 'date',
                'selectLevel': 'selectLevel' // 多级选
            };
            for (let i = 0; i < this.editField.length; i++) {
                const element =  Util.clone(this.editField[i]);
                if(element.size == null) {
                    element.size = this.size;
                }
                var mode = typeToMode[element.type];
                if(mode != null) {
                    element.mode = mode;
                }
                fields.push(element);
            }
            return fields;
        }
    },
    watch: {
        mode: function() {
            this.currentMode = this.mode;
        },
        value: function(v) {
            this.form = v;
        },
        visible: function(value) {
            this.currentVisible = this.visible;
        }
    },
    methods: {
        initRule: function () {
            let rules = {};
            let getRule = function (field) {
                if (rules[field] == null) {
                    rules[field] = [];
                }
                return rules[field];
            };
            for (let i in this.editField) {
                let item = this.editField[i];
                if (item.require) {
                    let ruleArray = getRule(item.field);
                    if (item.type != undefined) {
                        ruleArray.push({
                            required: true, message: '请输入' + item.name, trigger: 'change'
                        })
                    } else {
                        ruleArray.push({
                            required: true, message: '请输入' + item.name, trigger: 'blur'
                        })
                    }
                }
            }
            this.rules = rules;
        },
        inputWidth: function() {
            var maxSpan = 24;
            var span = this.span;
            var rate = maxSpan / span; // 2:1

            var totalWidth = this.widthNumber(this.width);
            totalWidth = totalWidth / rate;
            var titleWidth = this.widthNumber(this.textWidth);
            // var inputWidth = totalWidth - titleWidth - 90 + 'px';
            var inputWidth = totalWidth - titleWidth - 100 + 'px';
            return inputWidth;
        },
        widthNumber: function(width) {
            width = Core.calcMaxWidth(width);
            return Number(width.replace('px', ''));
        },
        open: function(title) {
            if(title == '新增') {
                this.form = this.buildAdd();
                this.currentMode = 'add';
            } else {
                this.currentMode = 'edit';
            }
            if(title != null) {
                this.currentTitle = title;
            }
            this.setVisible(true);
        },
        onClose() {
            this.currentVisible = false;
            this.$emit('update:visible', false);
        },
        setVisible(visible) {
            this.currentVisible = visible;
            this.$emit('update:visible', this.currentVisible);
        },
        buildAdd: function() {
            let form = {};
            for (let i in this.editField) {
                let item = this.editField[i];
                if(item.default != null) {
                    form[item.field] = item.default;
                }
            }
            return form;
        },
        onConfirm: function() {
            var doConfirm = () => {
                // console.log('on dialog confirm');
                if(this.autoClose) {
                    this.setVisible(false);
                }
                this.$emit('input', this.form);
                // console.log('input', this.form);

                this.$emit('on-confirm');
                if(this.currentTitle == '新增') {
                    this.$emit('on-add-confirm');
                } else if(this.currentTitle == '修改' || this.currentTitle == '编辑') {
                    this.$emit('on-edit-confirm');
                } else if(this.currentMode == 'add') {
                    this.$emit('on-add-confirm');
                } else if(this.currentMode == 'edit') {
                    this.$emit('on-edit-confirm');
                }
            };
            // console.log('on cofirm', this.form);
            if(this.rules > 0) {
                this.$refs.ruleForm.validate((valid) => {
                    // console.log('validate', valid);
                    if (valid) {
                        doConfirm();
                    }
                });
            } else {
                doConfirm();
            }
        },
        testInput: function(v) {
            console.log('testInput', v);
        },
        calcMaxHeight: function() {
            if(this.height.indexOf('%') != -1) {
                var rate = Number( this.height.replace('%', '') ) / 100;
                return (document.body.clientHeight * rate - 100) + 'px'
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