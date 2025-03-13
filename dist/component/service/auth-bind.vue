<template>
    <span v-if="show">
        <slot></slot>
    </span>
</template>

<script>
export default {
    data: function() {
        return {
            show: false
        }
    },
    created: function() {
        let authMap = DataInit.getUserAuth();
		if(authMap[this.url] == true) {
			this.show = true;
		} else {
			this.show = false;
		}
    },
    props: {
        url: String
    }
    
}
</script>