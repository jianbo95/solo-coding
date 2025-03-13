<template>
    <div v-if="debug">
        {{prop}} {{label}} {{width}} {{mode}}
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
        }
    },
    computed: {
        debug() {
            return this.$parent.debug;
        }
    },
    mounted() {
        let parent = this.$parent;
        let field = {
            prop: this.prop,
            label: this.label,
            width: this.width,
            mode: this.mode,
            map: this.map
        };
        parent.insert(field);
    },
    props: {
        prop: '',
        label: '',
        width: '',
        mode: '',
        map: ''
    }
}
</script>