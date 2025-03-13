<template>
    <el-table-column v-if="label != '主键ID' && init" :formatter="formatter" :type="type" 
        :fixed="currFixed" :prop="prop" 
        :sortable="sortable" 
        :show-overflow-tooltip="showOverflowTooltip"
        :align="align"
        :header-align="headerAlign"
        :label="label" 
        :min-width="currMinWidth"
        :width="currWidth">
    </el-table-column>
</template>

<script>
export default {
    data: function() {
        return {
            init: false,
            fieldMap: null,
            currMinWidth: null,
            currWidth: null,
            currFixed: null
        }
    },
    props: {
        useSlot: Boolean,
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
        minWidth: {
            default: null,
            type: String
        },
        showPopover: Boolean,
        showOverflowTooltip: {
            default: true,
            type: Boolean
        },
        // 值映射
        map: Object
    },
    computed: {
        hasDefaultSlot() {
            return !!this.$slots.default;
        }
    },
    created: function() {
        var $table = this.$parent.$parent;
        if($table != null) {
            this.fieldMap = $table.map;
            this.calcTotalWidth($table);
            this.initMinWidth($table);
            // console.log('width', this.currWidth, this.currMinWidth);
            // this.row = 
        }
        this.init = true;

        var debugInfo = {

        };
        // console.log(this.prop + ' currMinWidth', this.currMinWidth);
        // console.log(this.prop + ' width', this.width);
        // console.log();
        // console.log(this.$slots);
        // console.log('parent idName', this.$parent.idName);
    },
    methods: {
        initMinWidth($table) {
            this.currFixed = this.fixed;
            var totalWidth = $table.totalWidth || 1300;
			
            var tableMode =  StyleConfig.tableMode; 
            if($table.mode != null) {
                tableMode = $table.mode;
            }
            // console.log('tableMode', tableMode);

            var minWidth = this.minWidth;
            if(this.minWidth == null) {
                minWidth = this.width
            }
            
			// 固定模式
			if(tableMode == 'fix') {
				this.currWidth = minWidth;
				return;
			}
            // 自适应模式
            if(totalWidth == null) {
                this.currMinWidth = minWidth;
                return;
            } 
            if(minWidth.indexOf('%') != -1) {
                this.currMinWidth = minWidth;
                return;
            }

            this.currMinWidth = (minWidth / totalWidth * 100) + '%';
            this.currFixed = false;
        },
        calcTotalWidth($table) {
            // if($table.totalWidth != null) {
            //     return;
            // }
            if($table.widthMap == null) {
                $table.widthMap = {};
            }
            $table.widthMap[this.prop] = this.minWidth;
            // console.log('widthMap', $table.widthMap);
            var widthMap = $table.widthMap;
            var total = 0;
            for(var key in widthMap) {
                var width = widthMap[key];
                total = Number(width) + total;
            }
            // console.log('total width', total);
        },
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
                    return '否';
                }

                return cellValue;
            }
            // 存在映射的则返回映射
            return this.getValueByFieldMap(fieldMap, cellValue);
        },
        getValueByArray: function(fieldMap, cellValue) {
            for (let i = 0; i < fieldMap.length; i++) {
                const element = fieldMap[i];
                var key = element.value;
                var label = element.label;
                if(cellValue == key) {
                    return label;
                }
            }
            return cellValue;
        },
        getValueByFieldMap: function(fieldMap, cellValue) {
            // 存在数组格式的映射，格式为 [ {value: 0, label: '零'}, {value: 1, label: '一'} ]
            if(Util.isArray(fieldMap)) {
                return this.getValueByArray(fieldMap, cellValue);
            }

            if(fieldMap[cellValue] != null) {
                // console.log('fieldMap[cellValue]', fieldMap[cellValue]);
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