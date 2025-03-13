<template>
    <div>
        <el-autocomplete  style="width:100%" 
            :size="size"
            class="inline-input"
            v-model="currentValue"
            :fetch-suggestions="querySearch"
            :placeholder="placeholder"
            @select="handleSelect"
            @blur="blur"
            @input="input"
            ></el-autocomplete>
    </div>
</template>

<script>
export default {
    data: function() {
        return {       
            valueArray: [],
            error: '',
            currentValue: this.value,
        }
    },
    props: {
        value: '',
        size: {
            type: String,
            default: 'mini'
        },
        disabled: {
            type: Boolean,
             default: false
        },
        placeholder: {
			default: "请选择",
			type: String
		},
        values: []
    },
    mounted() {
        var arr = [];
        for(var key in this.values) {
            arr.push({
                value: this.values[key]
            });
        }
        this.valueArray = arr;
    },
    methods: {
        input: function(inputValue) {
            // 实现双向绑定
            this.$emit('input', inputValue);
        },
        handleSelect(item) {
            console.log('handleSelect',item);
            // this.$emit('input', item.value);
        },
        querySearch(queryString, cb) {
            var valueArray = this.valueArray;
            var results = queryString ? valueArray.filter(this.createFilter(queryString)) : valueArray;
            // 调用 callback 返回建议列表的数据
            cb(results);
        },
        createFilter(queryString) {
            return (restaurant) => {
            return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
            };
        }
    }
}
</script>