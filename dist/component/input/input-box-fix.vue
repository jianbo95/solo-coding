<template>
    <div :style="boxStyle">
        <div :style="titleStyle">{{title}}</div>
        <div :style="inputStyle">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
        }
    },
    props: {
        title: String,
        bottom: {
            default: 10,
            type: Number
        },
        titleWidth: {
            default: 100,
            type: Number
        },
        inputWidth: {
            default: 300,
            type: Number
        }
    },
    computed: {
        boxStyle: function() {
            return "margin-bottom:" + this.bottom + "px;"
        },
        titleStyle: function() {
            return "width:" + this.titleWidth + "px; display:inline-block;";
        },
        inputStyle: function() {
            return "width:" + this.inputWidth + "px; display:inline-block;";
        }
    }
}
</script>