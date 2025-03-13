<template>
    <div :id="id" :style="style">
        <slot></slot>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
        }
    },
    computed: {
        style() {
            var style = '';
            style += 'min-height:1rem;'
            return style;
        }
    },
    props: {
        id: ''
    }
}
</script>