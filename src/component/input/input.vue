<template>
    <div style="display:inline-block">
        
        <template v-if="currentMode == 'multi'">
            <cc-select-multi :collapse-tags="collapseTags" :value="currentValue" @input="input" :map="map" :size="size" :external="external">
            </cc-select-multi>
        </template>

        <template v-if="currentMode == 'text'">
            <cc-show-text :value="currentValue" @input="input" :map="map" :size="size">
            </cc-show-text>
        </template>

        <template v-if="currentMode == 'json'">
            <cc-input-json :value="currentValue" @input="input" :map="map" :size="size" :fields="[]">
            </cc-input-json>
        </template>

        <template v-if="currentMode == 'select'">    
            <cc-select-single :value="currentValue" @input="input" :map="map" :size="size" :filterable="filterable" :placeholder="placeholder">
            </cc-select-single>
        </template>

        <!-- 级联选择 -->
        <template v-if="currentMode == 'selectLevel'">
            <cc-select-level :size="size" @input="input" value-field='id' label-field='text' :options="options" v-model="currentValue">
            </cc-select-level>
        </template>

        <template v-if="currentMode == 'radio'">
            <cc-select-radio :value="currentValue" @input="input" :map="map" :size="size" ></cc-select-radio>
        </template>

        <template v-if="currentMode == 'checkbox'">
            <cc-checkbox :value="currentValue" @input="input" :map="map" :size="size" ></cc-checkbox>
        </template>

        <template v-if="currentMode == 'query'">    
            <el-input :placeholder="placeholder" :value="currentValue" @input="input" :size="size" :disabled="disabled" 
                :type="inputType" :rows="rows"/>
        </template>

        <template v-if="currentMode == 'date'">    
            <el-date-picker style="width:100%;" :format="format" :value-format="valueFormat" type="date" :value="currentValue" @input="input" :size="size" :disabled="disabled">
            </el-date-picker>
        </template>

        <template v-if="currentMode == 'datetime'">    
            <el-date-picker style="width:100%;" :format="dateFormat" :value-format="dateValueFormat" type="datetime" :value="currentValue" @input="input" :size="size" :disabled="disabled">
            </el-date-picker>
        </template>

    </div>
</template>

<script>
export default {
    data: function() {
        return {
            currentValue: this.value,
            currentMode: 'query',
            currentLabelWidth: this.labelWidth,
        }
    },
    computed: {
        itemStyle() {
            let str = '';
            if(this.height != null) {
                str += 'height:' + this.height + ';';
            }
            return str;
        },
    },
    props: {
        height: {
            default: null,
            type: String
        },
        external: Boolean,
        placeholder: String,
        mode: String,
        name: '',
        value: '',
        map: [Object, Array],
        options: Array,
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
        rows: {
            type: Number
        },
        inputType:{
            default:'text',
            type:String
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
    },
    methods: {    
        input: function(inputValue) {
            // 实现双向绑定
            // console.log('input.vue input event', inputValue);
            this.currentValue = inputValue; // 避免多余的 watch 
            this.$emit('input', inputValue);
        },
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