<template>
	<div class="cc-tab">
		<slot></slot>
	</div>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			
		},
		methods: {
			clickItem: function(itemId) {
				for(var i in this.$children) {
					var pages = this.$children[i];
					var tagName = pages.$options._componentTag;
					if(tagName == "cc-tab-items") {
						// this is page group
						for(var index in pages.$children) {
							var page = pages.$children[index];
							var pageId = Number(index) + 1;
							
							if(pageId == itemId) {
								page.$el.style.display = 'block';
							} else {
								page.$el.style.display = 'none';
							}
						}
					}
				}
			}
		}
	} 
</script>
<style type="text/css">
	.cc-tab {
	}
</style>
