<template>
	<a class="cc-tab-links">
		<slot></slot>
	</a>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			
		},
		data: function() {
			return {
				active: 1,
				size: 0
			};
		},
		methods: {
			addItem : function(item) {
				this.size ++;
				item.id = this.size;
			},
			clickItem: function(itemId) {
				this.$parent.clickItem(itemId); 
			}
		}
	} 
</script>
<style type="text/css">
	.cc-tab-links {
	}
</style>
