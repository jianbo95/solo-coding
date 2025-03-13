<template>
    <div>
        <el-cascader style="width:100%;"
            :size="size"
            v-model="selectArray"
            :options="options"
            :show-all-levels="true"
            :props="{ checkStrictly: true, value:valueField, label:labelField, children:childrenField}"
            @change="onChange">
        </el-cascader>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            selectArray: [],
            currentValue: null,
            optionsWrap: null
        }
    },
    props: {
        value: '',
        valueField: {
            type: String,
            default: 'value'
        },
        size: {
            type: String,
            default: 'small'
        },
        labelField: {
            type: String,
            default: 'label'
        },
        childrenField: {
            type: String,
            default: 'children'
        },
        options: Array
    },
    created: function() {
        var treeWrap = TreeWrap(this.options, this.valueField, 'parentId');
        treeWrap.loop(item => {
            item.id = item[this.valueField];
        });
        this.optionsWrap = treeWrap;
        this.loadValue();
    },
    methods: {
        loadValue: function() {
            if(this.value != null) {
                var list = this.getLinked(this.value);
                this.selectArray = list;
            }
        },
        // 双向绑定 input 事件
        onChange: function(selectArray) {
            // console.log('onChange');
            var length = selectArray.length;
            if(length == 0) {
                this.$emit('input', null);    
                this.currentValue = null;
            } else {
                // console.log('selectArray', selectArray);
                // console.log('selectArrayOne', selectArray[length - 1]);
                // 触发 value watch ?
                this.$emit('input', selectArray[length - 1]);
                this.currentValue = selectArray[length - 1];
            }
            console.log('selectArray', this.selectArray);
        },
        // 递归获取所有选项
        getLinked: function(value) {
            if(value == null) {
                return;
            }
            // console.log('this.optionsWrap', this.optionsWrap);
            var node = this.optionsWrap.findNode(value);
            var values = [];
            
            if(node != null) {
                var parents = this.optionsWrap.findParent(node, null, 'getLinked' /*flg*/);
                parents = parents.reverse();
                for(var i in parents) {
                    var p = parents[i]
                    values.push(p[this.valueField]);
                }
                values.push(node[this.valueField]);
            }
            return values;
        }
        
    },
    watch: {
        // 双向绑定 对于 props 流入的数据需要显示
        value: function(v) {
            // this.selectArray = [ this.value ];
            if(this.currentValue == v) {
                return;
            }
            // console.log('From value ', v);
            var list = this.getLinked(v);
            // console.log('Parse value ', list);
            // 判断list是否和selectArray相等
            if(!Util.isArrayEqual(list, this.selectArray)) {
                this.selectArray = list;
            } else {
                // 通常是 select-level 组件内部的操作导致的变化
                // console.log('is equal not need update son component');
            }
            // console.log('list', list);
        }
    },
}
</script>