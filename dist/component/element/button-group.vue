<template>
    <div class="button-group-page">
        
        <el-button-group v-if="onlyRight != true">
            <el-button v-if="show.info"   :size="size" type="warning"  icon="el-icon-search" @click="onInfo">详细</el-button>
            <el-button v-if="show.add"    :size="size" type="success"  icon="el-icon-plus"   @click="onAdd">新增</el-button>
            <el-button v-if="show.edit"   :size="size" type="blue"     icon="el-icon-edit"   @click="onEdit">修改</el-button>
            <el-button v-if="show.delete" :size="size" type="danger"   icon="el-icon-delete" @click="onDelete">删除</el-button>
            <slot name="left">
            </slot>
            
            <span style="margin-left:1rem;">
            <slot></slot>
            </span>

        </el-button-group>

        <div class="middle">
        </div>

        <div :style="style.right">
            <el-button-group style="float: right;">
                <el-button v-if="isShowQuery" :size="size" type="blue" icon="el-icon-search" @click="onQuery">查询</el-button>
                <slot name="right"></slot>
                <el-button v-if="show.test" :size="size" type="danger" icon="el-icon-debug" @click="test">调试</el-button>
            </el-button-group>
            <div style="clear:both;"></div>
        </div>
        <div style="clear:both;"></div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            style: {
                right: 'float:right'
            },
            show: {
                test: false
            },
            isShowQuery: true
        }
    },
    props: {
        auth: Array,
        hide: Array,
        size: {
            default: 'small',
            type: String
        },
        onlyRight: Boolean
    },
    created: function() {
        // console.log('auth', this.auth);
        var showTest = this.show.test;
        this.initByAuth(this.auth);
        this.initByHide();
        this.initByListener();
        if(this.onlyRight) {
            this.style.right = "";
        }
        this.show.test = showTest;
        // console.log('this.show', this.show);
    },
    methods: {
        initByAuth: function(auth) {
            if(auth == null) {
                auth = [];
            }
            if(auth.length == 0) {
                // 默认显示 add edit delete
                this.show = {
                    add: true, edit: true, delete: true, info: true
                };
            } else {
                // 根据获取 auth 判断按钮是否显示
                for(var i in auth) {
                    var button = auth[i];
                    this.show[button] = true;
                }
            }
        },
        initByHide: function() {
            // 根据 hide 字段判断是否显示
            for(var i in this.hide) {
                var button = this.hide[i];
                this.show[button] = false;
            }
        },
        // 根据监听器判断是否显示
        initByListener: function() {
            var listens = [];
            for(var key in this.$listeners) {
                listens.push(key);
            }
            for(var key in this.show) {
                if(!Util.inArray(key, listens)) {
                    this.show[key] = false;
                }
            }
            if(!Util.inArray('query', listens)) {
                this.isShowQuery = false;
            }
        },
        onAdd: function() {
            this.$emit('add');
        },
        onEdit: function() {
            this.$emit('edit');
        },
        onDelete: function() {
            this.$emit('delete');
        },
        onInfo: function() {
            this.$emit('info');
        },
        onQuery: function() {
            this.$emit('query');
        },
        test: function() {
            this.$emit('test');
        },
    },
    
}
</script>

<style lang="less">
    .button-group-page {
        position: relative;
        .middle {
            display: inline-block;
            position: relative;
            padding-left: 2px;
            
            button {
                position: relative;
                margin: 0px 2px;
            }
        }
        height: 26px;
        padding: 0 0 10px 0px; 
    }
</style>