<template>
    <div>
        <el-button size="mini" style="margin-top:10px;" @click="showCode = !showCode">展示代码</el-button>
        <div v-show="showCode" style="border:1px solid #aaa;">
            <div style="background: #eee; padding: 5px; font-size:0.8rem; font-weight: bold;">代码</div>
            <div style="height:500px; width: 100%;">
                <cc-input-ace v-model="code" mode="vue"></cc-input-ace>
            </div>
        </div>

        <div v-show="showCode" style="text-align:right; border-top:1px solid #aaa; padding: 5px;">
            <el-button size="small" type="success" @click="saveCode">保存</el-button>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
        }
    }
}
</script>