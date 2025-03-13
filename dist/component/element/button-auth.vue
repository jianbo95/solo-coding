<!--
-- 带权限控制显示的单个按钮
-->
<template>
    <el-button v-if="show" :size="size" :type="type" :icon="icon" @click="click()">
        <slot></slot>
    </el-button>
</template>

<script>
export default {
    data: function() {
        return {
            show: false
        }
    },
    created: function() {
        if(this.auth.length == 0) {
            this.show = true;
            return;
        }
        for(var i in this.auth) {
            var button = this.auth[i];
            if(button == this.button) {
                this.show = true;
            }
        }
    },
    props: {
        auth: Array,
        type: String,
        size: String,
        icon: String,
        button: String
    },
    methods: {
        click: function() {
            this.$emit("click");
        }
    },
}
</script>