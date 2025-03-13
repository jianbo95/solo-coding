<template>
    <div>
        <el-radio-group @change="change" :size="size" v-model="myValue">
            <template v-for="(item,i) in options">
                <el-radio :label="item.value"  :disabled="disabled">{{item.label}}</el-radio>
            </template>
        </el-radio-group>
    </div>
</template>
<script>
export default {
    props:{
        value: String,
        map: Object,
        size: {
            default: "mini",
            type: String
        },
        disabled:{
            default:false,
            type:Boolean
        }
    },
    data(){
        return{
            myValue: '',
            options: []
        }
    },
    created(){
        this.myValue = this.value;
        this.build();
    },
    methods:{
        build() {
            if(Util.isObject(this.map)) {
                this.options = this.buildByMap();
            } else if(Util.isArray(this.map)) {
                this.options = this.map;
            }
        },
        buildByMap() {
            var options = [];
            var map = this.map;
            for(var key in map) {
                var value = map[key];
                options.push({
                    value: key,
                    label: value
                });
            }
            return options;
        },
        change(v) {
            this.$emit('input', v)
        }
    },
    watch: {
    // 流入 value
        value: function() {
            if(this.value != this.myValue) {
                this.myValue = this.value;
            }
        },
        map: function() {
            this.build();
        }
    }
}
</script>