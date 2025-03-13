<template>
	<div class="cc-page-bind">
		<slot></slot>
	</div>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			this.$nextTick(function() {
				this.clickItem(1);
			});
		},
		data: function() {
			return {
				active: 1,
				size: 0
			};
		},
		methods: {
			// bar-item 调用
			addItem : function(item) {
				this.size ++;
				item.id = this.size;
			},
			// bar 组件调用
			clickItem: function(itemId) {
				for(var i in this.$children) {
					var pages = this.$children[i];
					var tagName = pages.$options._componentTag;
					if(tagName == "cc-page-group") {
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
