<template>
    <div style="width:100%;" >
        <template v-for="(value, i) in selectArray">
            <span :key="i">
                {{showValue(value)}}
            </span>
        </template>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            selectArray: [],
        }
    },
    props: {
        size: {
            default: 'mini',
            type: String
        },
        value: String,
        map: Object
    },
    created: function() {
        // console.log('currentOptions', this.currentOptions);
        this.loadValue();
    },
    methods: {
        fromMap: function() {
            var arr = [];
            for(var key in this.map) {
                var value = this.map[key];
                arr.push({
                    value: key,
                    label: value
                });
            }
            return arr;
        },
        loadValue: function() {
            if(this.value != null && this.value != '') {
                var arr = this.value.split(',');
                if(!Util.isArrayEqual(arr, this.selectArray) ) {
                    this.selectArray = arr;
                }
            } else {
                // 传入为空则清空数据
                this.selectArray = [];
            }
        },
        input: function(array) {
            console.log('change', array);
            var arr = array.join(',');
            this.$emit('input', arr);
        },
        showValue(value) {
            if(this.map != null && this.map[value] != null) {
                return this.map[value];
            } else {
                return value;
            }
        }
    },
    watch: { // 尽量只监听外部进入内部的值，用于重新加载数据

        // 双向绑定，数据流入，显示
        value: function(v) {
            this.loadValue();
        }
        
    },
}
</script>