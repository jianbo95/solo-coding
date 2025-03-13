<template>
    <div>
        <el-input v-model="currentValue" @input="input"></el-input>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            currentValue: null,
        }
    },
    created() {
        this.currentValue = this.value;
    },
    props: {
        value: null
    },
    watch: {
        value() {
            this.currentValue = this.value;
        }
    },
    methods: {
        input() {
            this.$emit('input', this.currentValue);
        }
    }
}
</script>