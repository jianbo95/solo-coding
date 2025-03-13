<template>
	<div class="cc-frame">
		<slot></slot>
	</div>
</template>
<script type="text/javascript">
	export default {
		methods: {
			test: function() {
				console.log(this.$title);
			},
			setFrameTitle: function(title) {
				this.$title.setTitle(title);
			},
			initMenu: function($menu) {
				this.$menu = $menu;
			},
			initTitle: function($title) {
				this.$title = $title;
				// $title.setTitle(this.$menu.title);
			}
		}
	}	
</script>
<style type="text/css">
	.cc-content {
		margin-left: 160px;
	}
</style>