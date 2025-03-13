<template>
    <div style="padding: 0 10px 10px 0;">
		<el-form label-position="left" :rules="rules" ref="ruleForm" :model="model">
            <slot></slot>
		</el-form>
		<div style="clear: both;"></div>
	</div>
</template>

<script>
export default {
    data: function() {
        return {
        }
    },
    props: {
        rules: null,
        model: null,
        span: {
            default: 8,
            type: Number
        },
        labelWidth: Number
    },
    created() {
        // console.log('query input group span', this.span);
        // console.log('query input group labelWidth', this.labelWidth);
    },
    methods: {
        validate(_call) {
            this.$refs.ruleForm.validate((valid) => {
                _call(valid);
            });
        }
    }
}
</script>
