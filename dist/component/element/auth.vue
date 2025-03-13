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
        if(this.auth.length == 0) {
            this.show = true;
            return;
        }
        for(var i in this.auth) {
            var button = this.auth[i];
            if(button == this.button) {
                this.show = true
            }
        }
    },
    props: {
        auth: Array,
        button: String
    }
    
}
</script>