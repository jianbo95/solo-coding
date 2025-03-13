<template>
	<div class="cc-tab-items">
		<slot></slot>
	</div>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			
		},
		methods: {
			finish: function() {
				var childs = this.$children;
				for (var i = 0; i < childs.length - 1; i++) {

					if(i != 0) {
						childs[i].$el.style.display = 'none';
					}
					
				}
			}
		}
	} 
</script>
<style type="text/css">
	.cc-tab-items {
	}
</style>
