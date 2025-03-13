<template>
    <div style="position:relative;">
        <el-select :size="size" :collapse-tags="collapseTags" style="width:100%;" 
            v-model="selectArray" multiple placeholder="请选择" @input="input">
            <el-option v-for="item in currentOptions" :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-select>
        
        <template v-if="external">
            <span style="position:absolute;z-index:2;right:-20px; top: 5px;" @click="addItem">+</span>

            <cc-dialog title="添加自定义项" :visible.sync="visible" show-confirm @on-confirm="onCustomConfirm">
                <div style="padding:1rem;">
                    <el-form>
                        <el-form-item label="名" label-width="70px">
                            <el-input v-model="customName"  :size="size" />
                        </el-form-item>
                        <el-form-item label="值" label-width="70px">
                            <el-input v-model="customValue"  :size="size" />
                        </el-form-item>
                    </el-form>
                </div>
            </cc-dialog>
        </template>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            customName: null,
            customValue: null,
            visible: false,
            selectArray: [],
            currentOptions: []
        }
    },
    props: {
        external: {
            default: false,
            type: Boolean
        },
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
            this.currentOptions = this.fromMap();
        } else {
            console.error("异常，缺少 options 或 map");
        }
        // console.log('currentOptions', this.currentOptions);
        this.loadValue();
    },
    methods: {
        onCustomConfirm: function() {
            // 添加到选项中
            this.currentOptions.push({
                value: this.customValue,
                label: this.customName
            });
            var arr = this.selectArray;
            arr.push(this.customValue);
            this.selectArray = arr;
        },
        addItem: function() {
            this.customValue = null;
            this.customName = null,
            this.visible = true;
        },
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
        }
    },
    watch: { // 尽量只监听外部进入内部的值，用于重新加载数据

        // 双向绑定，数据流入，显示
        value: function(v) {
            this.loadValue();
        },
        
        map: function() {
            this.currentOptions = this.fromMap();
        }
    },
}
</script>