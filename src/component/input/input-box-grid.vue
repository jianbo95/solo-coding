<template>
    <div :style="style.box">
        <el-col :span="titleSpan">
            {{title}}
        </el-col>
        <el-col :span="inputSpan">
            <slot></slot>
        </el-col>
        <div style="clear:both;"></div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            style: {
                box: ""
            }
        }
    },
    props: {
        titleSpan: {
            default: 5,
            type: Number
        },
        inputSpan: {
            default: 19,
            type: Number
        },
        title: String
    }
}
</script>