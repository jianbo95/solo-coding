<template>
    <div :style="`width:${width};`" class="cc-layout">
        <slot></slot>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       

        }
    },
    props: {
        width: {
            type: String,
            default: '100%'
        },
    },
}
</script>

<style lang="less">
.cc-layout {
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
}
</style>