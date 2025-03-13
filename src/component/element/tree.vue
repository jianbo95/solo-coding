<template>
    <div>
        <slot></slot>
        <el-tree ref="eltree"
            check-strictly
            :data="data"
            :show-checkbox="showCheckbox"
            :node-key="nodeKey"
            :props="props"
            @check="onCheck">
        </el-tree>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            $tree: null
        };
    },
    props: {
        value: Array,
        data: Array,
        props: Object,
        nodeKey: String,
        showCheckbox: Boolean
    },
    mounted: function() {
        this.$tree = this.$refs.eltree;
        this.refreshCheckedKeys() ;
    },
    methods: {
        refreshCheckedKeys: function() {
            this.$tree.setCheckedKeys(this.value);
        },
        onCheck: function() {
            var keys = this.$tree.getCheckedKeys();
            this.$emit('input', keys);
        }
    },
    watch: {
        value: function(value) {
            // console.log('watch', this.value);
            this.$tree.setCheckedKeys(this.value);
        }
    }
}
</script>