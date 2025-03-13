<!--
-- 带权限控制显示的单个按钮
-->
<template>
    <el-button v-if="show" :size="size" :type="type" :icon="icon" @click="click()" :plain="plain">
        <slot></slot>
    </el-button>
</template>

<script>
export default {
    data: function() {
        return {
        }
    },
	computed: {
		show() {
			if(this.url == null) {
				return true;
			}
			// 依赖与 userInfo
			let userInfo = this.$store.getters.userInfo;
			let authMap = userInfo.userData.authUrl;
			// let authMap = DataInit.getUserAuth();
			if(authMap[this.url] == true) {
				return true;
			} else {
				return false;
			}
		}
	},

    props: {
        type: String,
        size: String,
        icon: String,
        button: String,
		plain: Boolean,
		url: String
    },
    methods: {
        click: function() {
            this.$emit("click");
        }
    },
}
</script>