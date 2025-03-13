<template>
    <div>
        <el-checkbox-group v-model="selectArray" @input="input">
            <template v-for="(item) in currentOptions">
            <el-checkbox :label="item.label" :key="item.value"></el-checkbox>
            </template>
        </el-checkbox-group>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            currentInput: '',
            selectArray: [],
            currentOptions: [],
            valueMap: {}
        }
    },
    props: {
        size: {
            default: 'mini',
            type: String
        },
        value: String,
        options: Array,
        map: Object,
        collapseTags: {
            default:true,
            type: Boolean
        }
    },
    created: function() {
        if(this.options != null) {
            this.currentOptions = this.options;
        } else if(this.map != null){
            if(Util.isArray(this.map)) {
                this.currentOptions = this.map;
            } else {
                this.currentOptions = this.fromMap();
            }
        } else {
            console.error("异常，缺少 options 或 map");
        }
        // console.log('currentOptions', this.currentOptions);
        this.loadValue();
        // console.log('load value', this.selectArray);
    },
    methods: {
        input: function(array) {
            // console.log('input', array);
            // var arr = array.join(',');
            // var labelMap = []
            var labelMap = {};
            for(let i in this.currentOptions) {
                let item = this.currentOptions[i];
                labelMap[item.label] = item.value;
            }

            var keys = [];
            for(let i in array) {
                let value = array[i];
                let key = labelMap[value];
                if(key != null) {
                    keys.push(key);
                }
            }
            // console.log('keys', keys);
            this.currentInput = keys.join(',');
            this.$emit('input', this.currentInput);
        },
        fromMap: function() {
            var arr = [];
            var valueMap = {};
            for(var key in this.map) {
                var value = this.map[key];
                arr.push({
                    value: key,
                    label: value
                });
                valueMap[value] = key;
            }
            this.valueMap = valueMap;
            return arr;
        },
        loadValue: function() {
            var valueMap = {};
            for(let i in this.currentOptions) {
                let item = this.currentOptions[i];
                valueMap[item.value] = item.label;
            }

            if(this.value != null && this.value != '') {
                var arr = this.value.split(',');
                let selectArray = [];
                for(let i in arr) {
                    let key = arr[i];
                    let value = valueMap[key];
                    selectArray.push(value);
                }
                this.selectArray = selectArray;
            } else {
                // 传入为空则清空数据
                this.selectArray = [];
            }
        }
    },
    watch: {
        // 双向绑定，数据流入，显示
        value: function(v) {
            if(this.currentInput == v) {
                return;
            }
            this.loadValue();
        },
        map: function() {
            this.currentOptions = this.fromMap();
        }
    },
}
</script>