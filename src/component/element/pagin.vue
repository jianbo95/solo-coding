<template>
    <div :style="'position:'+this.position+';'" class="cc-pagin">
        <el-pagination
            background
            :pager-count="pagerCount"
            @size-change="onPaginSizeChange"
            @current-change="onPaginChange"
            :current-page.sync="pagin.page"
            :page-sizes="[10, 15, 20, 30, 40]"
            :page-size="pagin.rows"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagin.total">
        </el-pagination>
        <!-- <span>第{{pagin.page}}页</span>  :page-sizes="[15, 30, 50, 10, 5]"-->
        
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            pagerCount: 5,
            pagin: {
                total: 0,
                page: 1,
                rows: 10
            }
        }
    },
    created: function() {
        // 拷贝到本地
        this.pagin = Util.cloneMap(this.value);
    },
    watch:{
        value:{
            // deep:true,
            handler(newVal, oldVal){
                console.log('value change');
                this.pagin = Util.cloneMap(newVal);
            }
        }
    },
    props: {
        value: Object,
        position: {
            // default: 'fixed',
            type: String
        }
    },
    methods: {
        onPaginSizeChange: function(val) {
            this.pagin.rows = val;
            this.loadTable();
        },
        onPaginChange: function(val) {
            // console.log('onPaginChange', val);
            // this.pagin.page = val;
            this.loadTable();
        },
        loadTable: function() {
            var pagin = Util.cloneMap(this.pagin);
            console.log('loadTable pagin', pagin);
            this.$emit('input', pagin);
            this.$emit('pagin-change', this.pagin);
        }
    }
}

</script>

<style>
    .cc-pagin {
        /* overflow: scroll; */
        margin-bottom: 20px;
        height:32px;
        bottom:0px; 
        /* background: #fff;  */
        padding-left: 10px;  
        z-index: 100;
    }
    .cc-pagin .el-pagination{float:right;}
</style>