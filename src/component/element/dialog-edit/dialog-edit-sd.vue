<template>
    <div>
        <el-dialog :title="currentTitle" top="40px" :visible.sync="currentVisible" width="400px">

            <div style="padding:10px;">
                <template v-for="(obj, i) in editField">
                    <!-- {{obj.name}} -->
                    <div style="margin-bottom:0px;">
                        <!-- 输入框 -->
                        <template v-if="obj.type == null">
                            <el-input size="small" placeholder="请输入内容" v-model="form[obj.field]">
                                <template slot="prepend">
                                    <div :style="'width:'+textWidth+';'">{{obj.name}}</div>
                                </template>
                            </el-input>
                        </template>

                        <!-- 多选框 -->
                        <template v-if="obj.type == 'select'">
                            <div class="el-input-group__prepend">
                                <div style="width: 50px;">{{obj.name}}
                                </div>
                            </div>
                            <div class="input-select">
                                <!-- <el-select style="width:100%;" v-model="form[obj.field]" multiple placeholder="">
                                    <el-option v-for="item in obj.options"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                    </el-option>
                                </el-select> -->
                                <cc-select-multi :options="obj.options" v-model="form[obj.field]">
                                </cc-select-multi>
                            </div>
                        </template>

                        <!-- 单选框 -->
                        <template v-if="obj.type == 'selectOne'">
                            <div class="el-input-group__prepend">
                                <div style="width: 50px;">{{obj.name}}
                                </div>
                            </div>
                            <div class="input-select">
                                <el-select v-model="form[obj.field]" placeholder="请选择">
                                    <el-option
                                        v-for="item in obj.options"
                                        :key="item.id"
                                        :label="item.text"
                                        :value="item.id">
                                    </el-option>
                                </el-select>
                            </div>
                        </template>

                        <!-- 级联选择 -->
                        <template v-if="obj.type == 'selectLevel'">
                            <div class="el-input-group__prepend">
                                <div style="width: 50px;">{{obj.name}}
                                </div>
                            </div>
                            <div class="input-select">
                                <cc-select-level @input="testInput" value-field='id' label-field='text' :options="obj.options" v-model="form[obj.field]">
                                </cc-select-level>
                            </div>
                        </template>
                    </div>
                </template>
            </div>

            <template v-slot:footer>
                <span class="dialog-footer">
                    <el-button size="mini" @click="currentVisible = false">取 消</el-button>
                    <el-button size="mini" type="primary" @click="onConfirm">确 定</el-button>
                </span>
            </template>

        </el-dialog>
        
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            currentVisible: false,
            currentTitle: '',
            form: {}
        }
    },
    props: {
        value: Object,
        textWidth: {
            default: '50px',
            type: String
        },
        title: String,
        visible: Boolean,
        editField: Array
    },
    created: function() {
        // console.log('editField', this.editField);
        this.form = this.value;
        // console.log('load data', this.value);
        this.currentTitle = this.title;
    },
    watch: {
        // data: function() {
        //     this.form = this.data;
        // },
        value: function(v) {
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
        open: function(title) {
            if(title == '新增') {
                this.form = {};
            }
            this.currentTitle = title;
            this.currentVisible = true;
        },
        onConfirm: function() {
            console.log('on dialog confirm');
            this.currentVisible = false;
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
        }
    },
    
}
</script>

<style>
    .input-select {
        display: table-cell;
        width:100%;
    }
</style>