<template>
	<dl :class="{active: isActive}">
		<dt @click='clickItems()'>
			<span v-text='name'></span>
			<span class="arrow"></span>
		</dt>
		<slot></slot>
	</dl>
</template>
<script type="text/javascript">
	export default {
		created: function() {

		},
		data: function() {
			return {
				isActive : this.active
			}
		},
		props: {
			name: '',
			icon: '',
			active: ''
		},
		methods: {
			addItem: function(name) {
				this.$parent.addItem(this.name, name);
			},
			clickItems: function() {
				this.isActive = !this.isActive;
			}
		}
	}
</script>
