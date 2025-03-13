<template>
	<div>
		正在跳转接口。。。
	</div>
</template>

<script>
export default {
	data: function() {
		return {
		}
	},
	created() {
		// 保证执行顺序！
		DataInit.waitInitAll(() => {
			console.log('DataInit.waitInitAll success');
			this.toApiPage();
		});
	},
	methods: {
		toApiPage() {
			let param = this.$route.query;
			if(param.type == 'pending') {
				this.$router.push({
					name: '/apiOrderHandle',
				});
			} else if(param.type == 'review') {
				this.$router.push({
					name: '/apiOrderCheck',
				});
			} else if(param.type == 'reviewsecond') {
				this.$router.push({
					name: '/apiOrderCheckSecond',
				});
			} else {
				this.$router.push({
					name: '/apiOrderAdd',
					params: param
				});
			}
		}
	}
}
</script>

