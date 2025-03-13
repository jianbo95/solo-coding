<template>
        <!-- 带 popover 实现，方便复制粘贴 -->
        <el-table-column :type="type" 
        :fixed="fixed" :prop="prop" 
        :sortable="sortable" 
        :align="align"
        :visible-arrow="false"
        :label="label" :width="width" :min-width="minWidth">

        <template slot-scope="scope">
            <el-popover trigger="click" placement="top" :width="innerWidth">
                <div :style="style">
                    <!-- 表格 -->
                    <el-table :data="buildRows(scope)" style="width:100%;">
                        <slot></slot>
                    </el-table>
                </div>
                
                <div :style="'width:' + (width - 20) + 'px;overflow:hidden;'" slot="reference" class="name-wrapper">
                    <!-- <nobr>{{ popoverValue(scope) }}</nobr> -->
                    <el-tag>
                        <div style="font-size:20px; position:relative; top:-5px;">...</div>
                    </el-tag>
                </div>

            </el-popover>
        </template>

        </el-table-column>    
        

</template>

<script>
export default {
    data: function() {
        return {
            fieldMap: null,
            currMinWidth: null,
            style: null
        }
    },
    props: {
        format: Function,
        mapName: String,
        sortable: String,
        type: String,
        fixed: String,
        prop: String,
        label: String,
        align: String,
        width: String,
        minWidth:String,
        showPopover: Boolean,
        innerWidth: {
            default: 200,
            type: Number
        },
        showOverflowTooltip: {
            default: false,
            type: Boolean
        },
        // 值映射
        map: Object
    },
    created: function() {
        var $table = this.$parent.$parent;
        if($table != null) {
            this.fieldMap = $table.map;
        }
        this.style = "width:" + this.innerWidth + "px; height:auto;";
    },
    
    methods: {
        buildRows: function(scope) {
            return [scope.row];
        }
    }
}
</script>