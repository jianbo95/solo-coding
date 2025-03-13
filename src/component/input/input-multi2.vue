<template>
    <div style="width:100%;">

        <!-- <div>
            <el-button size="mini" type="success" icon="el-icon-plus" @click="onAddOne">
            新增一项
            </el-button>
            
            <slot name="left"></slot>
        </div> -->
        <!-- 输入框 -->        
        <!-- <div style="margin-bottom:10px;">单项配置</div> -->
        <template v-for="(config, i) in value">
            <!-- <div>{{config.key}} {{config.value}}</div> -->
            <div style="margin-top:15px;" :key="i">
                
                <div style="width:calc(100% - 50px); display:inline-block; float:left;" v-if="showKey">

                    <el-col :span="8">
                        <el-input :size="size" style="width:95%;" @input="changeValue" placeholder="请输入Key" v-model="config.key">
                        </el-input>
                    </el-col>
                    
                    <el-col :span="16">
                        <el-input :size="size" style="width:100%;" @input="changeValue" placeholder="请输入Value" v-model="config.value">
                        </el-input>
                    </el-col>
                </div>

                <div style="width:calc(100% - 50px); display:inline-block; float:left;" v-if="!showKey">

                    <el-col :span="24">
                        <el-input :size="size" style="width:100%;" @input="changeValue" placeholder="请输入Value" v-model="config.value">
                        </el-input>
                    </el-col>
                </div>
                
                <div style="width:50px; display:inline-block; text-align:center;">
                    <!-- <el-button :size="size" style="margin-left:10px;" type="danger" icon="el-icon-close" @click="onDeleteOne(i, config)">
                    </el-button> -->

                    <i v-if="isNotEndLine(config, i)" class="el-icon-close" style="font-size:1.1rem; margin-top:4px;" @click="onDeleteOne(i, config)"></i>
                </div>
                
                
                <div style="clear:both;"></div>
            </div>
        </template>

    </div>
</template>

<script>
export default {
    data: function() {
        return {     
            
        }
    },
    props: {
        size: {
            default: 'mini',
            type: String
        },
        value: {
            default: [{
                key : '',
                value : ''
            }],
            type: Array
        },
        showKey: {
            default: true,
            type: Boolean
        },
        param: ''
    },
    created() {
        // console.log('input multi ', this.value);
        if(this.value.length == 0) {
            this.loadParam(this.param);
        }
    },
    watch: {
        param(value) {
            // console.log('param change', value);
            this.loadParam(value);
        },
    },
    methods: {
        loadParam(param) {
            if(param != null && param.length > 0) {
                var params = param.split(',');
                var newValue = [];
                for(var i in params) {
                    var key = params[i];
                    newValue.push({
                        key: key,
                        value: ''
                    });
                }
                console.log('newValue', newValue);
                this.value = newValue;
                this.$emit('input', newValue);
            } else {
                this.$emit('input', [{
                    key: '',
                    value: ''
                }]);
            }
        },
        changeValue() {
            this.refreshInput();
            var value = Util.clone( this.value );
            // console.log('input-multi.vue $emit', value);
            this.$emit('input', value);
        },
        onAddOne() {
            this.value.push({
                key: '',
                value: ''
            });
        },
        isNotEndLine(config, i) {
            // if(config.key != '') {
            //     return true;
            // } else {
            //     return false;
            // }
            return i != 0;
        },
        refreshInput() {
            let length = this.value.length;
            let end = this.value[length - 1];
            if(end.key != '') {
                this.value.push({
                    key: '',
                    value: ''
                }); 
            }
        },
        onDeleteOne: function(i, config) {
            this.value.splice(i, 1);
        }
    }
}
</script>