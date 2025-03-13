<template>
	<div class="cc-title">
		<span v-text='title'></span>
	</div>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			// 传递 当前实例 给 frame
			this.$parent.initTitle(this);
			this.title = this.default;
		},
		props: {
			default: ''
		},
		data: function() {
			return {
				title: ''
			};
		},
		methods: {
			setTitle: function(title) {
				this.title = title;
			}
		}
	}
</script>
<style type="text/css">
	.cc-title {
		margin-left: 160px;
		background: #3992D0;
		color: #fff;
	}
	.cc-title span {
		display: inline-block;
		line-height: 30.8px;
		text-align: center;
		width: 100%;
	}
</style>