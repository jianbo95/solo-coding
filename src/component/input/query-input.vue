<template>
    <div v-if="init">
        <!--
            :value 和 v-model 的区别，:value是单向的，不会改变 value 的值
            v-model 会改变 value 的值
         -->
        <el-col :span="cSpan">
            <el-form-item :style="itemStyle" :class="itemClass" :label="name" :label-width="currentLabelWidth" :prop="prop">
                
                <template v-if="currentMode == 'multi'">
                    <cc-select-multi :collapse-tags="collapseTags" :value="currentValue" @input="input" :map="map" :size="size">
                    </cc-select-multi>
                </template>

                <template v-if="currentMode == 'custom'">
                    <slot></slot>
                </template>

                <template v-if="currentMode == 'select'">    
                    <cc-select-single :value="currentValue" @input="input" :map="map" :size="size" :filterable="filterable" :placeholder="placeholder">
                    </cc-select-single>
                </template>

                <template v-if="currentMode == 'radio'">
                    <cc-select-radio :value="currentValue" @input="input" :map="map" :size="size" ></cc-select-radio>
                </template>

                <template v-if="currentMode == 'switch'">
                    <el-switch
                        v-model="currentValue"
                        @input="input">
                    </el-switch>
                </template>

                <template v-if="currentMode == 'query'">    
                    <el-input :placeholder="placeholder" :value="currentValue" @input="input" :size="size" :disabled="disabled" :type="inputType"/>
                </template>

                <template v-if="currentMode == 'date'">    
                    <el-date-picker style="width:100%;" :format="format" :value-format="valueFormat" type="date" :value="currentValue" @input="input" :size="size" :disabled="disabled">
                    </el-date-picker>
                </template>

                <template v-if="currentMode == 'datetime'">    
                    <el-date-picker style="width:100%;" :format="dateFormat" :value-format="dateValueFormat" type="datetime" :value="currentValue" @input="input" :size="size" :disabled="disabled">
                    </el-date-picker>
                </template>

            </el-form-item>
        </el-col>
        
        <template v-if="currentMode == 'dialog'">
            <el-col :span="12">
                <el-form-item :label="name">
                    <el-input :model="currentValue" @input="input" :size="size" />
                </el-form-item>
            </el-col>
        </template>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            init: false,
            currentValue: this.value,
            currentMode: 'query',
            currentLabelWidth: this.labelWidth,
            cSpan: 8
        }
    },
    computed: {
        itemStyle() {
            let str = '';
            if(this.pl10==true) {
                str += 'padding-left:10px;';
            }
            if(this.height != null) {
                str += 'height:' + this.height + ';';
            }
            return str;
        },
        itemClass() {
            let str = '';
            if(this.pr20 == true) {
                str += 'noPr20 ';
            }
            if(this.noLineHeight==true) {
                str += 'noLineHeight ';
            }
            if(this.red == true) {
                str += 'colorRed ';
            }
            return str;
        }
    },
    props: {
        span: Number,
        labelWidth: {
            // default: '80px',
            type: String
        },
        height: {
            default: null,
            type: String
        },
        placeholder: {
            // default 为 null 会让子组件的 default 失效
            // default: null, 
            type: String
        },
        mode: String,
        name: {
            default: '',
            type: String
        },
        value: {
            default: '',
            type: [String, Number, Boolean]
        },
        map: [Object, Array],
        size: {
            default: "mini",
            type: String
        },
        // 单选框有效
        filterable: {
            default: false,
            type: Boolean
        },
        // 仅多选框该参数有效
        collapseTags: {
            default:true,
            type: Boolean
        },
        disabled:{
            default:false,
            type: Boolean
        },
        // 仅对日期组件有效
        format: {
            default: 'yyyy-MM-dd',
            type: String
        },
        valueFormat: {
            default: 'yyyy-MM-dd',
            type: String
        },
        dateFormat:{
            default: 'yyyy-MM-dd HH:mm:ss',
            type: String
        },
        dateValueFormat:{
            default: 'yyyy-MM-dd HH:mm:ss',
            type: String
        },
        prop:{
            type:String
        },
        inputType:{
            default:'text',
            type:String
        },
        pl10:{
            default:true,
            type:Boolean
        },
        pr20:{
            default:true,
            type:Boolean
        },
        noLineHeight: {
            default:false,
            type:Boolean
        },
        red: {
            default:false,
            type:Boolean
        }
    },
    created: function() {
        if(this.mode != null) {
            this.currentMode = this.mode;
        } else {
            // console.log('this.map', this.map);
            if(this.map != null) {
                this.currentMode = 'select'
            }
        }
        this.initFromParent();
        this.calcLabelWidth(); // 自动设置label宽度
        if(this.name == '') {
            this.labelLength = 0;
        }
        this.initSpan();
        this.init = true;
        // this.currentlabel-width=this.labelWidth
    },
    methods: {    
        initFromParent: function() {
            var $group = this.$parent.$parent;
            if($group != null && this.span == null) {
                this.cSpan = $group.span;
                // console.log('this.span', this.span);
                if($group.labelWidth != null && this.currentLabelWidth == null) {
                    this.currentLabelWidth = $group.labelWidth;
                }
            } else if(this.labelWidth == null) {
                if($group.labelWidth != null && this.currentLabelWidth == null) {
                    this.currentLabelWidth = $group.labelWidth;
                }
            }
        },
        initSpan: function() {
            if(this.span != null) {
                this.cSpan = this.span;
            }
            Logger.log('this.cSpan', this.cSpan);
        },
        input: function(inputValue) {
            // 实现双向绑定
            // console.log('input event', inputValue);
            this.$emit('input', inputValue);
        },
        calcLabelWidth: function() {
            if(this.currentLabelWidth != null) {
                return;
            }
            if(this.name == null) {
                this.currentLabelWidth = null;
                return;
            }
            var labelLength = this.name.length;
            
            if(labelLength >= 5 && labelLength <= 7) {
                // this.currentLabelWidth = '130px';
                this.currentLabelWidth = '90px'; 
                // this.cSpan = this.cSpan + 2;
                // this.xs = this.xs + 2;
                // this.sm = this.sm + 2;
                // this.md = this.md + 2;
                // this.lg = this.lg + 2;
            } else if(labelLength > 7) {
                this.currentLabelWidth = '130px';
            } else {
                if(this.labelLength != null) {
                    this.currentLabelWidth = this.labelWidth;
                } else {
                    this.currentLabelWidth = '80px';
                }
            }
            
        }
    },
    watch: {
        // 实现组件显示
        value: function() {
            // console.log('watch value ' + this.value)
            if(this.currentValue != this.value) {
                this.currentValue = this.value;
            }
        }
    }
}
</script>

<style lang="less">
.ss{
    .noPr20{
        .el-form-item__content{
            padding-right: 0px!important;
        }
    }
    .noLineHeight {
        .el-form-item__content{
            line-height: inherit;
        }
    }
    .colorRed {
        .el-form-item__label {
            color: red;
        }
        .el-radio__input.is-checked+.el-radio__label {
            color: red;
        }
        .el-radio__input.is-checked .el-radio__inner {
            border-color: red;
            background: red;
        }
    }

}
</style>