<template>
    <div class="cc-finish"><!-- 通知父组件渲染完成 --></div>
</template>

<script>
export default {
    created: function() {
    	// console.log("cc-finish created");
        this.$parent.finish(this.name);
    },
    mounted: function() {
    	// console.log("cc-finish mounted");
    	// this.$parent.finish(this.name);
    },
    props: {
        name : ''
    }
}
</script>
