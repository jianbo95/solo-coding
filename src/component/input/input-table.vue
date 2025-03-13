<template>
    <div>
        <div v-show="debug">
            <slot></slot>
        </div>

        <div v-if="init">
            <template v-for="(cells, i) in currentValue">
                <div style="margin-top:5px;">
                    <template v-for="(cell, i) in cells">
                        
                        <cc-input 
                            v-model="cell.value" 
                            :mode="cell.mode"
                            :map="cell.map"
                            @input="changeValue"
                            :placeholder="'请输入' + cell.label" 
                            :style="'width:' + cell.width + ';margin-right:2px;'" 
                            :size="size"></cc-input>

                    </template>
                    <el-button :size="size" type='danger' @click="deleteRow(i)">删除</el-button>
                </div>
            </template>
        </div>

    </div>
</template>

<script>
export default {
    data: function() {
        return {     
            init: false,
            fields: [],
            currentValue: [],
            map: {},
            props: []
        }
    }, 
    props: {
        debug: {
            default: false,
            type: Boolean
        },
        size: {
            default: 'small',
            type: String
        },
        increment: {
            default: true,
            type: Boolean
        },
        value: []
    },
    created() {
        // console.log('created input table');
    },
    mounted() {
        // console.log('mouted input table', this.fields);
        let fieldMap = {};
        let props = [];
        for(let i in this.fields) {
            let field = this.fields[i];
            fieldMap[field.prop] = field;
            props.push(field.prop);
        }
        this.props = props;
        this.map = fieldMap;
        this.init = true;
        this.loadCurrentValue();
    },
    methods: {
        changeValue() {
            let rows = this.currentValue;
            let outputRows = [];
            console.log('rows', rows);
            for(let i in rows) {
                let cells = rows[i];
                let row = {};
                for(let j in cells) {
                    let cell = cells[j];
                    // console.log(cell);
                    row[cell.prop] = cell.value;
                }
            
                if(i == rows.length - 1) {
                    if(this.isBlankRow(row)) {
                        continue;
                    }
                }
                outputRows.push(row);
            }
            // console.log(JSON.stringify(outputRows))
            this.$emit('input', outputRows);
        },
        deleteRow(index) {
            let rows = this.currentValue;
            let rows2 = [];
            for(let i in rows) {
                let cells = rows[i];
                if(i != index) {
                    rows2.push(cells);
                }
            }
            this.currentValue = rows2;
            this.changeValue(); // 同步到v-model
        },
        loadCurrentValue() {
            let rows = this.value;
            let showRows = [];
            for(let i in rows) {
                let item = rows[i];
                let cells = [];
                for(let i in this.fields) {
                    let field = this.fields[i];
                    let prop = field.prop;
                    let value = item[prop];
                    let cell = Util.clone(field);
                    cell.value = value;
                    cells.push(cell);
                }
                showRows.push(cells);
            }
            
            // 最后一行是否为空行时自动增加一行
            if(rows.length > 0) {
                let end = rows[rows.length - 1];
                if(!this.isBlankRow(end) && this.increment) {
                    // console.log('最后一行不为空行', JSON.stringify(end));
                    showRows.push(this.blankCells());
                }
            }
            // console.log('end', end);
            console.log('load current value', showRows);
            this.currentValue = showRows;
        },
        isBlankRow(row) {
            let isBlank = true;
            for(let i in this.props) {
                let prop = this.props[i];
                if(row[prop] != null && row[prop] != '') {
                    // console.log('is not blank ' + row[prop]);
                    isBlank = false;
                }
            }
            return isBlank;
        },
        blankCells() {
            let cells = [];
            for(let i in this.fields) {
                let field = this.fields[i];
                let value = '';
                let cell = Util.clone(field);
                cell.value = value;
                cells.push(cell);
            }
            return cells;
        },
        insert(field) {
            this.fields.push(field);
        }
    },
    watch: {
        value(newValue) {
            // console.log('watch value change', newValue)
            this.loadCurrentValue();
        }
    }
}
</script>