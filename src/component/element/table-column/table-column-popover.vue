<template>
 
    <el-table-column :type="type" 
    :fixed="currentFixed" :prop="prop" 
    :sortable="sortable" 
    :align="align"
    :label="label" :width="width" >

    <template slot-scope="scope">
        
        <el-popover trigger="hover" placement="top" width="500">
            {{ popoverValue(scope) }}
            <div :style="'width:' + (width - 20) + 'px;overflow:hidden;'" slot="reference" class="name-wrapper">
                <nobr>{{ popoverValue(scope) }}</nobr>
            </div>
        </el-popover>
    </template>

    </el-table-column>
        
</template>

<script>
export default {
    data: function() {
        return {
            currentFixed: null,
            fieldMap: null
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
        align: {
            default:'left',
            type:String
        },
        headerAlign:{
            default:'left',
            type:String
        },
        width: String,
        showPopover: Boolean,
        showOverflowTooltip: {
            default: true,
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
        // console.log('parent idName', this.$parent.idName);
        if(this.type == 'index' && this.fixed == null) {
            this.currentFixed = true;
        } else {
            this.currentFixed = this.fixed;
        }
    },
    methods: {
        formatterList: function(row, column, cellValue, index) {
            var values = cellValue.split(",");
            var formatValues = [];
            for(var i in values) {
                var value = values[i];
                var formatValue = this.formatter(row, column, value, index);
                formatValues.push(formatValue);
            }
            return formatValues.join(",");
        },
        getFieldMap: function() {
            if(this.fieldMap == null) {
                return null;
            }
            if(this.map != null) {
                return this.map;
            }
            var fieldMap = this.fieldMap[this.prop];
            if(fieldMap == null) {
                fieldMap = this.map;
            }

            return fieldMap;
        },
        formatter: function(row, column, cellValue, index) {
            // if(this.fieldMap == null) {
            //     return cellValue;
            // } 
            // if(cellValue == null) {
            //     return null;
            // }
            if(this.format != null) {
                return this.format(row, column, cellValue, index);
            }
            
            if( Util.isString(cellValue) && cellValue.indexOf(",") != -1) {
                return this.formatterList(row, column, cellValue, index);
            }
            var fieldMap = this.getFieldMap();
            if(fieldMap == null) {

                if(cellValue === true) {
                    return '是';
                } else if(cellValue === false) {
                    return '否'
                }
                
                return cellValue;
            }
            // 存在映射的则返回映射
            var value =  this.getValueByFieldMap(fieldMap, cellValue);

            if(value === true) {
                return '是';
            } else if(value === false) {
                return '否'
            }

            return value;
        },
        getValueByFieldMap: function(fieldMap, cellValue) {
            if(fieldMap[cellValue] != null) {
                return fieldMap[cellValue];
            } else {
                if(fieldMap._ != null) {
                    // console.log('fieldMap._', fieldMap._);
                    return fieldMap._;
                } else {
                    // console.log('fieldMap._null', cellValue);
                    // 不存在则返回默认值
                    return cellValue;
                }
            }
        },
        popoverValue: function(scope) {
            var prop = scope.column.property;
            return scope.row[prop];
        },
        // popoverShowValue: function(scope) {
        //     var prop = scope.column.property;
        //     var value = scope.row[prop];
        //     return value;
        // }
    }
}
</script>