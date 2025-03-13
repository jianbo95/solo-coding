<template>
    <div>
        <el-select v-if="type == 'common'" clearable style="width:100%" :size="size" v-model="myValue" @change="change"
            :placeholder="placeholder"
            :filterable="filterable">
            <template v-for="(item, i) in options">
                <el-option
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </template>
        </el-select>

        <el-select v-if="type == 'group'" clearable v-model="myValue" :size="size" style="width:100%" @change="change"
            :placeholder="placeholder"
            :filterable="filterable">
            <el-option-group
            v-for="group in options"
            :key="group.label"
            :label="group.label">
            <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
            </el-option-group>
        </el-select>
    </div>
</template>

<script>
module.exports= {
    data: function() {
        return {
            myValue: '',
            options: []
        }
    },
    created: function() {
        this.myValue = this.value;
        this.build();
    },
    props: {
        placeholder: {
			default: "请选择",
			type: String
		},
        size: {
            default: "mini",
            type: String
        },
        filterable: {
            default: false,
            type: Boolean
        },
        type: {
            default: 'common',
            type: String
        },
        value: '',
        map: [Object, Array]
    },
    methods: {
        build: function() {
            if(Util.isObject(this.map)) {
                this.options = this.buildByMap();
            } else if(Util.isArray(this.map)) {
                this.options = this.map;
            }
        },
        buildByMap: function() {
            var options = [];
            // options.push({
            //     id: '',
            //     text: '全选'
            // })
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
        change: function(v) {
            // console.log('change', v);
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