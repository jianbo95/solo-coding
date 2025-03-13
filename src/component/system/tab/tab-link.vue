<template>
	<a class="cc-tab-link" @click="active">
		<slot></slot>
	</a>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			// 添加的同时回写id
			this.$parent.addItem(this);
		},
		data: function() {
			return {
				id: 0
			}
		},
		methods: {
			active: function() {
				this.$parent.clickItem(this.id); 
			}
		}
	} 
</script>
<style type="text/css">
	.cc-tab-link{
		cursor: pointer;
	}
</style>
