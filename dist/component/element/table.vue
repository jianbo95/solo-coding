<template>
    <div style="width:100%;" ref="div">
        <div class="title-left">
            {{title}}
        </div>
        <div style="margin-top:10px;"></div>
        <el-table v-if="init" :height="tableHeight" max-height="auto" style="width:100%;" ref="table" :load="load"
            :empty-text="emptyText"
            :data="rows" :row-key="idName" border :lazy="lazy"
            :expand-row-keys="expandKeys"
             :size="size" :default-expand-all="false"
            @sort-change="sortChange"
            @current-change="currentChane" :current-row-key="currentKey"
            @select="select" @select-all="selectAll"
            @selection-change="handleSelectionChange" @cell-click="cellClick" stripe>
            <slot></slot>
            <!-- <div style="height:20px">test</div> -->
        </el-table>
        <div style="height:30px;">&nbsp;</div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            currentKey: null,
            init: false,
            expandKeys: []
        }
    },
    computed: {
        
    },
    props: {
        mode: {
            default: null,
            type: String
        },
        expandLevel: {
            type: Number,
            default: 0
        },
        lazy: Boolean,
        value: Object,
        rows: Array,
        name: String,
        idName: {
            default: 'id',
            type: String
        },
        emptyText: {
            default: null,
            type: String
        },
        size: {
            default: 'mini',
            type: String
        },
        maxHeight: Number,
        // load: Function,
        map: Object,
        tableHeight:Number,
        title:{
            default:'查询结果',
            type:String
        }
    },
    created: function() {
        var _this = this;
        Core.waitRef(this.$refs, 'div', function(ref, key) {
            _this.init = true;
        });
        // console.log('table created ', this.idName);
        // this.debugCheckId();
        if(this.value != null) {
            // 初始化选择项功能
            // this.currentKey = this.value.id;
        }
    },
    watch: {
        // rows: function(value) {
        //     console.log('rows watch', rows);
        //     if(this.$refs.table != null) {
        //         this.$refs.table.setCurrentRow(); // 取消选中
        //     }
        // },
        rows:{
            handler: function (newVal) {
                // console.log('数组',newVal)
                if(this.$refs.table != null) {
                    this.$refs.table.setCurrentRow(); // 取消选中
                }

                let keys = [];
                if(this.expandLevel != 0) {
                    for(let i in this.rows) {
                        let row = this.rows[i];
                        keys.push(row.name);

                        if(this.expandLevel == 2) {
                            let rows2 = row.children;
                            for(let i in rows2) {
                                let row2 = rows2[i];
                                keys.push(row2.name);
                            }
                        }
                    }
                }
                this.expandKeys = keys;
                console.log('expandKeys', keys);
            },      
            deep: true,    //深度监听
            immediate: true, // 初次监听即执行  
        },
        idName: function(val){
            console.log('idName',val);
        }
    },
    methods: {
        // 点击单元格
        cellClick(row, column, cell, event){
            this.$emit('cell-click',row, column, cell, event)
        },
        handleSelectionChange(selection){
            // console.log('table选择',selection);
            this.$emit('select-change',selection)
        },
        //复选框只能选中一个
        select(selection, row) {
            this.$emit('select',selection, row)
            // if (selection.length > 1) {
            //     let del_row = selection.shift()
            //     this.$refs.table.toggleRowSelection(del_row, false)
            // }
        },
        selectAll(selection){
            this.$emit('select-all',selection)
            // if (selection.length > 1) {
            //     selection.length = 1
            // }
        },
        currentChane: function(row, oldRow) {
            // console.log('current change ', row);
            this.$emit('input', row);
        },
        debugCheckId: function() {
            if(this.rows != null) {
                if(this.rows.length > 0) {
                    var row = this.rows[0];
                    if(row[this.idName] == null) {
                        console.error("表格Id设置可能不正确");
                    }
                }
            }
        },
        sortChange: function(sortInfo) {
            // console.log('sortInfo', sortInfo);
            var order = null;
            if(sortInfo.order == 'ascending') {
                order = 'asc';
            } else if(sortInfo.order == 'descending') {
                order = 'desc';
            }
            var sortConfig = {
                sortField: sortInfo.prop,
                sortOrder: order
            }
            console.log('sortConfig', sortConfig);
            this.$emit('sort-change', sortConfig);
        },
        load: function(tree, treeNode, resolve) {
            this.$emit('load', tree, treeNode, resolve)
        },
        // 计算最大高度，用于表格高度自适应
        calcMaxHeight: function() {
            if(this.maxHeight != null) {
                return this.maxHeight;
            }
            var $div = this.$refs.div;
            if($div != null) {
                // 获取上方高度
                var top = $div.offsetTop;
                var height = Core.getClientHeight() - top - 120 - 40;
                // console.log('from top height', Core.getClientHeight(), top, height);
                return height;
            }
            var height = Core.getClientHeight() - 300 ;
            // console.log('from total height', height);
            return height;
        }
    },
    
}
</script>