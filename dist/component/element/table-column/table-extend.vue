<template>
        <!-- 带 popover 实现，方便复制粘贴 -->
        <el-table-column :type="type" 
        :fixed="fixed" :prop="prop" 
        :sortable="sortable" 
        :align="align"
        :visible-arrow="false"
        :label="label" :width="width" :min-width="minWidth">

        <template slot-scope="scope">
            <el-popover trigger="hover" placement="top" :width="innerWidth">
                
                <div :style="'width:' + (width - 20) + 'px;overflow:hidden;'" slot="reference" class="name-wrapper">
                    <nobr>{{ popoverValue(scope) }}</nobr>
                    <el-tag>
                        <div style="font-size:20px; position:relative; top:-5px;">...</div>
                    </el-tag>
                </div>

                <table>
                    <tr>
                        <template v-for="(label, key) in prop">
                            
                            <td>{{label}}</td>
                            
                        </template>
                    </tr>
                    <tr>
                        <template v-for="(label, key) in prop">
                            
                            <td>{{value(scope, key)}}</td>
                            
                        </template>
                    </tr>
                </table>
                
            </el-popover>
        </template>

        </el-table-column>    
        

</template>

<script>
export default {
    data: function() {
        return {
            fieldMap: null,
            currMinWidth: null
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
        innerWidth: String,
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
            this.calcTotalWidth($table);
            this.initMinWidth($table);
            // this.row = 
        }
        // console.log(this.$slots);
        // console.log('parent idName', this.$parent.idName);
    },
    methods: {
        initMinWidth($table) {
            // 固定模式
            if(StyleConfig.tableMode == 'fix') {
                this.currMinWidth = this.minWidth;
                return;
            }
            // 自适应模式
            var totalWidth = $table.totalWidth || 1300;
            if(this.minWidth == null) {
                return '10%';
            }
            if(totalWidth == null) {
                this.currMinWidth = this.minWidth;
                return;
            } 
            if(this.minWidth.indexOf('%') != -1) {
                this.currMinWidth = this.minWidth;
                return;
            }

            this.currMinWidth = (this.minWidth / totalWidth * 100) + '%';
            // this.currMinWidth = '12%';
            this.fixed = false;
            
            console.log(this.prop, this.currMinWidth);
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
                return cellValue;
            }
            // 存在映射的则返回映射
            return this.getValueByFieldMap(fieldMap, cellValue);
        },
        getValueByFieldMap: function(fieldMap, cellValue) {
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
            for(var key in prop) {
                var label = prop[key];
            }
            return scope.row[prop];
        },
        value: function(scope, key) {
            return scope.row[key];
        }
        // popoverShowValue: function(scope) {
        //     var prop = scope.column.property;
        //     var value = scope.row[prop];
        //     return value;
        // }
    }
}

</script>