<template>
    
    <cc-dialog ref="self" title="选择业务归属机构" width="600px" show-confirm @on-confirm="onComcodeConfirm">
        <div style="padding:10px 10px 0 10px">
            <cc-query>
                <cc-query-input :span="10" name="机构代码" v-model="comcodeParam.comCode"></cc-query-input> 
                <cc-query-input :span="10" name="机构名称" v-model="comcodeParam.comName"></cc-query-input> 
                <el-col :span="4">
                    <el-button size="mini" style="margin-top:9px;" type="primary" icon="el-icon-delete" @click="onQuery">
                        查询
                    </el-button>
                </el-col>
            </cc-query>

            <cc-table :rows="comcodeRows" v-model="currentCodeRow" id-name="comcode" :lazy="lazy" @load="load" size="mini">
                <cc-table-column type="index"  width="60"></cc-table-column>
                <cc-table-column prop="comcode" label="业务归属机构代码" width="150" ></cc-table-column>
                <cc-table-column prop="comcname" label="业务归属机构名称" width="350" ></cc-table-column>
            </cc-table>
        </div>
    </cc-dialog>
    
</template>

<script>
export default {
    data: function() {
        return {       
            lazy: true,
            comcodeParam: {},
            comcodeRows: [],
            currentCodeRow: {}
        }
    },
    props: {
		comCodeField: {
			type: String,
			default: 'comCode'
		},
		comNameField: {
			type: String,
			default: 'comName'
		},
        value: Object
    },
    created: function() {

    },
    methods: {
        open: function() {
            var _this = this;
            this.queryComcode(function() {
                _this.$refs.self.open();
            });
        },
        filterData: function(data, param) {
            if(!(Util.isBlank(param.comcode) && Util.isBlank(param.comcname))) {
                for(var i in data) {
                    var item = data[i];
                    item.hasChildren = false;
                }
            }
        },
        queryComcodeByUp: function(up, _call, isLoad) {
            var _this = this;
            var url = Constants.root + "prpdcompany/loadAllCompany";
            var param = {
                upperComCode: up,
                comcode: this.comcodeParam.comCode,
                comcname: this.comcodeParam.comName
            };
            
            if(isLoad) {
                UI.post(url, param, function(data) {
                    if(data.status == "failure") {
                        return;
                    }
                    _this.filterData(data, param);
                    _call(data);
                });
            } else {
                Core.post(url, param, function(data) {
                    if(data.status == "failure") {
                        return;
                    }
                    _this.filterData(data, param);
                    _call(data);
                });
            }
        },
        onQuery: function() {
            this.queryComcode();
        },
        queryComcode: function(_success) {
            var _this = this;
            this.queryComcodeByUp('00000000', function(data) {
                // console.log('条件查询', data);
                _this.comcodeRows = data;
                if(_success != null) {
                    _success();
                }
            }, true)
        },
        load: function(tree, treeNode, resolve) {
            this.queryComcodeByUp(tree.comcode, function(data) {
                resolve(data);
            })
        },
        onComcodeConfirm: function() {
            // 确认后赋值到 编辑框
            var value = Util.clone( this.value );
            value[this.comCodeField] = this.currentCodeRow.comcode;
            value[this.comNameField]= this.currentCodeRow.comcname;
            this.$emit('input', value);
            this.$emit('confirm', value);
        }
    },
}
</script>