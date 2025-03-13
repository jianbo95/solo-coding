<template>
	<a class="cc-page-link" @click="active">
		<slot></slot>
	</a>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			this.$parent.addItem(this);
		},
		data: function() {
			return {
				id: 0
			}
		},
		methods: {
		    active: function() {
		        // 将数据传递给父组件
		        this.$parent.clickItem(this.id); 
		    }
 		}
	} 
</script>
<style type="text/css">
	.cc-page-link{
		cursor: pointer;
	}
</style>
