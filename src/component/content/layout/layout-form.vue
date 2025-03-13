<template>
    <div :style="`width:${width};`">
        <el-form ref="ruleForm" :rules="rules" :model="model" :label-width="labelWidth" 
            style="width:100%;"
            class="form">
            <cc-row>
                <slot></slot>
            </cc-row>
        </el-form>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       

        }
    },
    props: {
        rules: {
            type: Object,
            default: null
        },
        width: {
            type: String,
            default: '100%'
        },
        labelWidth: {
            type: String,
            default: '100px'
        },
        model: {
            type: Object,
            default: null
        }
    },
    methods: {
        validate(_call) {
            if(this.model == null) {
                console.error('表单model属性为空，不支持验证');
            }
            if(_call == null) {
                _call = () => {};
            }
            this.$refs.ruleForm.validate(_call);
        }
    }
}
</script>
