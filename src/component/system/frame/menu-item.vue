<template>
	<dd>
		<a v-bind:href="'#' + to" v-text='name' @click='clickMenu()'>
		</a>
	</dd>
</template>
<script type="text/javascript">
	export default {
		created: function() {
			this.$parent.addItem(this.name);
		},
		props : {
			to: '',
			name: ''
		},
		methods: {
			clickMenu: function() {
				this.$parent.$parent.clickMenu(this.name);
			}
		}
	}
</script>
