<template>
    <article class="query-button-group">
        <el-row>
            <el-col :xs="16" :sm="12" :md="8" :lg="6" :xl="6" style="float:left;">
                <div style="float:left;">
                    <el-button v-if="show.add" :size="size" type="success" icon="el-icon-plus" @click="onAdd">新增</el-button>
                    <el-button v-if="show.edit" :size="size" type="blue" icon="el-icon-edit" @click="onEdit">修改</el-button>
                    <el-button v-if="show.delete" :size="size" type="danger"  icon="el-icon-delete" @click="onDelete">删除</el-button>
                </div>
                <div style="float:left;display:contents;">
                        <slot name="left"></slot>
                </div>
            </el-col>
            <el-col :xs="8" :sm="12" :md="16" :lg="18" :xl="18" style="float:right;">
                <div id="btnRight" style="float:right;margin-left: 5px;">
                    <slot name="btnRight"></slot>
                </div>
                <el-button id="searchBtn" style="float:right" v-if="isShowQuery" :size="size" type="blue" icon="el-icon-search" @click="onQuery">查询</el-button>
                <div style="float:right;display:contents;" :style="'width:calc(100% - '+searchWidth+')'">
                    <slot name="right"></slot>
                </div>
            </el-col>
        </el-row>
    </article>
</template>

<script>
export default {
    data: function() {
        return {
            style: {
                // right: 'width:50%; position:absolute; top:0px; right:0px;'
                right: 'position:absolute; top:0px; left:50%;transform: translate( -50%, 0);'
            },
            // showGroup: false,
            show: {
                test: true
            },
            isShowQuery: true,
            input:'',
            isMounted:false
        }
    },
    props: {
        auth: {
            type:Array,
            default:[]
        },
        size: {
            default: 'small',
            type: String
        },
        hide: Array,
        onlyRight: Boolean
    },
    created: function() {
        // console.log('按钮权限列表', JSON.stringify(this.auth));
        // if(this.auth.length > 0) {
        //     this.showGroup = true;
        // }
        var showTest = this.show.test;
        // console.log('this.auth',this.auth);
        this.initByAuth();
        this.initByHide();
        this.initByListener();
        if(this.onlyRight) {
            this.style.right = "";
        }
        this.show.test = showTest;
        // console.log('show',this.show,this.auth);
        
    },
    computed:{
        searchWidth: function() {
            if(this.isMounted!=true) return
            let btnRightWidth = document.getElementById('btnRight').offsetWidth 
            let searchBtnWidth = document.getElementById('searchBtn').offsetWidth 
            let t = btnRightWidth + searchBtnWidth
            if(Util.isIE()) { t = t + 10}
            return  t+'px'
        },
        log(){
            return this.auth
        }
    },
    mounted(){
        this.isMounted=true
        // console.log('this.auth-mounted',this.auth);
        //  console.log('this.$refs.btnRightthis.$refs.btnRightthis.$refs.btnRight',document.getElementById('btnRight').clientWidth,document.getElementById('btnRight').offsetWidth,document.getElementById('searchBtn').clientWidth,document.getElementById('searchBtn').offsetWidth,document.getElementById('searchBtn').offsetWidth+document.getElementById('searchBtn').offsetWidth);
    },
    methods: {
        // searchWidth(){
        //     let btnRightWidth = document.getElementById('btnRight').offsetWidth
        //     let searchBtnWidth = document.getElementById('searchBtn').offsetWidth
        //     let t = btnRightWidth + searchBtnWidth
        //     return calc(100% - t+'px')
        // },
        initByAuth: function() {
            // console.log('this.auth1', this.auth);
            if(this.auth == null) {
                return;
            }
			// console.log('this.auth', this.auth);
            // if(this.auth.length == 0) {
            //     // 默认显示 add edit delete
            //     this.show = {
            //         add: true, edit: true, delete: true, info: true
            //     };
            // } else {
            // }
			// 根据获取 auth 判断按钮是否显示
			for(var i in this.auth) {
				var button = this.auth[i];
                // this.show[button] = true;
                this.$set(this.show,button,true)
			}
        },
        initByHide: function() {
            // 根据 hide 字段判断是否显示
            for(var i in this.hide) {
                var button = this.hide[i];
                // this.show[button] = false;
                this.$set(this.show,button,false)
            }
        },
        initByListener: function() {
            // console.log("listeners", this.$listeners);
            var listens = [];
            for(var key in this.$listeners) {
                listens.push(key);
            }
            for(var key in this.show) {
                if(!Util.inArray(key, listens)) {
                    // this.show[key] = false;
                    this.$set(this.show,key,false)
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
    watch:{
        log(val){
            this.initByAuth();
            this.initByHide();
            this.initByListener();
        }
    }
    
}
</script>

<style lang="less" scoped>
.query-button-group{
    margin: 10px 0 20px;
    .pull-left{ float: left; }
    .pull-right{ float: left; }
}
</style>