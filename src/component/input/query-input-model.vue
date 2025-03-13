<template>
    <div>
        <!--
            :value 和 v-model 的区别，:value是单向的，不会改变 value 的值
            v-model 会改变 value 的值
         -->
        <el-col :span="cSpan" :xs="xs" :sm="sm" :md="md" :lg="lg">
            <el-form-item style="padding-left:10px;" :label="name" :label-width="currentLabelWidth" :prop="prop">
                
                <template v-if="currentMode == 'multi'">
                    <cc-select-multi :collapse-tags="collapseTags" :value="currentValue" @input="input" :map="map" :size="size">
                    </cc-select-multi>
                </template>

                <template v-if="currentMode == 'custom'">
                    <slot></slot>
                </template>

                <template v-if="currentMode == 'select'">    
                    <cc-select-single :value="currentValue" @input="input" :map="map" :size="size" :filterable="filterable">
                    </cc-select-single>
                </template>

                <template v-if="currentMode == 'query'">    
                    <el-input :placeholder="placeholder" v-model="currentValue" @input="input" :size="size" :disabled="disabled"/>
                </template>

                <template v-if="currentMode == 'date'">    
                    <el-date-picker style="width:100%;" :format="format" :value-format="valueFormat" type="date" :value="currentValue" @input="input" :size="size" :disabled="disabled">
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
            currentValue: this.value,
            currentMode: 'query',
            currentLabelWidth: this.labelWidth,
            cSpan: 8,
            xs: 10,
            sm: 8,
            md: 8,
            lg: 8
        }
    },
    props: {
        span: Number,
        labelWidth: {
            // default: '80px',
            type: String
        },
        placeholder: String,
        mode: String,
        name: '',
        value: '',
        map: Object,
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
        prop:{
            type: String
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
        this.initSpan();
        // this.currentlabel-width=this.labelWidth
    },
    methods: {    
        initFromParent: function() {
            var $group = this.$parent.$parent;
            if($group != null && this.span == null) {
                this.span = $group.span;
                // console.log('this.span', this.span);
                if($group.labelWidth != null && this.currentLabelWidth == null) {
                    this.currentLabelWidth = $group.labelWidth;
                }
            }
        },
        initSpan: function() {
            if(this.span != null) {
                this.cSpan = this.span;
                this.xs = this.span;
                this.sm = this.span;
                this.md = this.span;
                this.lg = this.span;
            }
            console.log('this.cSpan', this.cSpan);
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

