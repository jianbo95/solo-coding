<template>
    <el-form-item :style="`width:${currentWidth};`" 
        :label="label" 
        :prop="prop"
        :label-width="labelWidth" 
        :required="required">
        <template v-if="mode == 'custom'">
            <slot></slot>        
        </template>
        <template v-else>
                    
            <cc-input v-model="currentValue" @input="inputValue" :size="currentSize"
                :style="`width:${currentInputWidth};`"
                :height="height"
                :external="external"
                :placeholder="placeholder"
                :mode="mode"
                :map="map"
                :options="options"
                :filterable="filterable"
                :collapseTags="collapseTags"
                :disabled="disabled"
                :format="format"
                :valueFormat="valueFormat"
                :dateFormat="dateFormat"
                :dateValueFormat="dateValueFormat"
                :rows="rows"
                :inputType="inputType">
            </cc-input>

        </template>
    </el-form-item>
</template>

<script>
import LabelData from './label-data.js';
export default {
    data: function() {
        return {     
            init: false, 
            currentSize: 'small',
            currentWidth: null,
            currentValue: null
        }
    },
    computed: {
        currentInputWidth() {
            if(this.inputWidth != null) {
                return this.inputWidth;
            }
            var width = `100%;`;
            // console.log('width', width);
            return width;
        }
    },
    props: {
        value: {
            type: null,
            default: null
        },
        label: {
            type: String,
            default: ''
        },
        prop: {
            type: String,
            default: null
        },
        labelWidth: {
            type: String,
            default: '100px'
        },
        inputWidth: {
            type: String,
            default: null
        },
        span: {
            type: Number,
            default: null
        },
        width: {
            type: String,
            default: '400px'
        },
        size: {
            type: String,
            default: null
        },
        height: {
            default: null,
            type: String
        },
        required: {
            default: false,
            type: Boolean
        },
        external: Boolean,
        placeholder: String,
        mode: String,
        map: [Object, Array],
        options: Array,
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
        rows: {
            type: Number
        },
        inputType:{
            default:'text',
            type:String
        }
    },
    created() {
        this.currentValue = this.value;
        this.currentWidth = this.width;
        if(this.span != null) {
            var spanWidth = LabelData.spanMap['' + this.span];
            if(spanWidth != null) {
                this.currentWidth = spanWidth;
            }
        }

        if(StyleConfig.buttonSize != null) {
            this.currentSize = StyleConfig.buttonSize;
        }

        if(this.size != null) {
            this.currentSize = this.size;
        }

        this.init = true;
    },
    methods: {
        inputValue() {
            this.$emit('input', this.currentValue);
        }
    },
    watch: {
        // 实现组件显示
        value: function() {
            if(this.currentValue != this.value) {
                // console.log('input.value this.currentValue = ' + this.value);
                this.currentValue = this.value;
            }
        }
    }
}
</script>