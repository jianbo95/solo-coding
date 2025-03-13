<template>
    <span style="display:inline-block; margin-left:10px;">
        <el-button :type="type" :size="size" @click="showData()">
            <slot></slot>
        </el-button>

        <cc-packet-ace-dialog width="800px"
            request-title="数据"
            request-field="data"
            response-title=""
            ref="packet"></cc-packet-ace-dialog>
    </span>
</template>

<script>
export default {
    data: function() {
        return {       
            size: 'small'
        }
    },
    props: {
        type: {
            default: 'primary',
            type: String
        },
        data: ''
    },
    methods: {
        showData() {
            console.log('this.data', this.data);
            this.$refs.packet.open({
                data: JSON.stringify( this.data )
            });
        }
    }
}
</script>