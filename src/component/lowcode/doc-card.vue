<template>
    <el-card class="box-card" style="width:100%; position:relative;">
        <div slot="header" class="clearfix">
            <div style="height:21px;overflow:hidden;">
            {{title}}
            </div>
        </div>
        <div :style="style">
            <doc-wrap code-mode="dialog" width="100%" :margin-bottom="0" :margin-top="0" content-width="100%">
                <slot></slot>
            </doc-wrap>
        </div>
        
        <div style="position:absolute; right: 10px; top: 10px; ">
            <div style="font-weight: 500; cursor: pointer;">
            ☷
            </div>
        </div>
    </el-card>
</template>

<script>
export default {
    props: {
        title: '',
        height: {
            default: '110px'
        }
    },
    computed: {
        style() {
            return `height:${this.height}`;
        }
    },
    data: function() {
        return {       
        }
    }
}
</script>

<style lang="less">
.box-card {
    .el-card__body {
        padding: 0 20px 20px 20px;
    }
    margin-bottom:20px;
}
</style>