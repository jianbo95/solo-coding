<template>
    
    <cc-dialog ref="self" title="选择业务归属机构" width="900px" show-confirm @on-confirm="onComcodeConfirm">
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


            <el-row>
                <el-col span="12">
                    <div>
                        <div style="padding:0 0 0 1rem;">已选择的机构</div>
                        <cc-table :rows="selectRows" :lazy="lazy"  size="mini"
                            @cell-click="rowDelete">
                            <cc-table-column type="index"  width="60"></cc-table-column>
                            <cc-table-column prop="comcode" label="业务归属机构代码" width="250" ></cc-table-column>
                            <cc-table-column prop="comcname" label="业务归属机构名称" width="350" ></cc-table-column>
                        </cc-table>
                    </div>
                </el-col>
                <el-col span="12">

                    <div style="padding:0 0 0 1rem;">单击选择机构</div>
                    <div :style="tableDivStyle">
                        <cc-table :rows="comcodeRows" v-model="currentCodeRow" id-name="comcode" :lazy="lazy" @load="load" size="mini"
                                @cell-click="rowSelect">
                            <cc-table-column type="index"  width="60"></cc-table-column>
                            <cc-table-column prop="comcode" label="业务归属机构代码" width="250" ></cc-table-column>
                            <cc-table-column prop="comcname" label="业务归属机构名称" width="350" ></cc-table-column>
                        </cc-table>

                    </div>
                </el-col>
            </el-row>

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
            selectRows: [],
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
    computed: {
        tableDivStyle() {
            let height = document.body.clientHeight / 2;
            return 'height:' + height + "px; overflow: auto;";
        }
    },
    methods: {
        open: function(selectRows) {
            this.selectRows = selectRows;
            // 初始化
            this.queryComcode(() => {
                this.$refs.self.open();
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
            let arr = [];
            for(let i in this.selectRows) {
                let item = this.selectRows[i];
                arr.push(item.comcode);
            }

            let value = arr.join(',');
            this.$emit('input', value);
            this.$emit('confirm', value);
        },
        rowSelect(row) {
            let exist = false;
            for(let i in this.selectRows) {
                let item = this.selectRows[i];
                if(item.comcode == row.comcode) {
                    exist = true;
                }
            }
            if(!exist) {
                this.selectRows.push(row);
            }
        },
        rowDelete(row) {
            let arr = [];
            for(let i in this.selectRows) {
                let item = this.selectRows[i];
                if(item.comcode != row.comcode) {
                    arr.push(item);
                }
            }
            this.selectRows = arr;
        }
    },
}
</script>