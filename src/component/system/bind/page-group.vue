<template>
	<div class="cc-page-group">
		<slot></slot>
	</div>
</template>
<script type="text/javascript">
	export default {
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
