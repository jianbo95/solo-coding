<template>
    <div :style="`width:${currentWidth}`">
        <slot></slot>
    </div>
</template>

<script>
import LabelData from './label-data.js';
export default {
    data: function() {
        return {       
            currentWidth: null
        }
    },
    props: {
        span: {
            type: Number,
            default: null
        },
        width: {
            type: String,
            default: '400px'
        },
    },
    created() {
        var currentWidth = this.width;
        if(this.span != null) {
            var spanWidth = LabelData.spanMap['' + this.span];
            if(spanWidth != null) {
                currentWidth = spanWidth;
            }
        }
        this.currentWidth = currentWidth;
    }
}
</script>