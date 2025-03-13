<template>
    <span style="border:1px solid #000; display:inline-block;">
        <el-button :size="size" :type="type" :icon="icon" @click="executeApi">
            <slot></slot> {{table}}
        </el-button>
        <i class="el-icon-edit" @click="onEdit"></i>
        <div style="clear:both;"></div>

        <cc-dialog title="接口定义" :visible.sync="visible" show-confirm width="80%" @on-confirm="onConfirm">
            <div style="padding: 0 10px;">
                <el-tabs v-model="activeName" @tab-click="handleClick">
                    <el-tab-pane label="接口编辑" name="first">

                        <el-form label-position="left" label-width="100px">
                            <el-row>

                                <el-col :span="12">
                                    <el-form-item label="接口地址">
                                        {{api}}
                                    </el-form-item>
                                </el-col>

                                <el-col :span="12">
                                    <el-form-item label="接口描述">
                                        {{data.apiDescription}}
                                    </el-form-item>
                                </el-col>

                                <el-col :span="12">
                                    <el-form-item label="接口模块">
                                        {{data.module}}
                                    </el-form-item>
                                </el-col>

                                <el-col :span="12">
                                    <el-form-item label="接口名">
                                        {{data.apiName}}
                                    </el-form-item>
                                </el-col>

                                <el-col :span="12">
                                    <el-form-item label="接口类型">
                                        {{data.apiType}}
                                    </el-form-item>
                                </el-col>

                            </el-row>

                        </el-form>
                        
                        <cc-editor-ace v-model="sql" width="99%" height="550px" lang="sql"></cc-editor-ace>

                    </el-tab-pane>
                    <el-tab-pane label="前端代码" name="second">

                        <div style="margin-bottom:1rem;">
                            <el-button type="primary" @click="executeCode">执行代码</el-button>
                        </div>

                        <cc-editor-ace v-model="javascript" width="99%" height="550px" lang="javascript"></cc-editor-ace>
                    </el-tab-pane>

                    <el-tab-pane label="通用前端代码" name="third">

                        <div style="margin-bottom:1rem;">
                            <el-button type="primary" @click="executeCode">执行代码</el-button>
                        </div>

                        <cc-editor-ace v-model="javascript" width="99%" height="550px" lang="javascript"></cc-editor-ace>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </cc-dialog>
    </span>
</template>

<script>

import SqlButton from './sql-button.js';

export default {
    data: function() {
        return {       
            activeName: 'second',
            size: 'small',
            visible: false,
            sql: '',
            javascript: '',
            data: {
                apiDescription: '接口描述',
                apiName: '接口名称',
                module: '接口模块'
            },
            page: null
        }
    },
    created () {
        if(this.service == null) {
            UI.warning('service 不能为空');
            return;
        }
        this.page = this.service.page;
        // 查询接口数据
        this.queryApiData();
        this.loadFrontCode();
    },
    computed: {
        table() {
            return this.page.table;
        }
    },
    props: {
        param: null,
        service: null,
        type: null,
        icon: null,
        api: null
    },
    methods: {
        handleClick() {},
        loadFrontCode() {
            var code = SqlButton.code;
            var tplParam = {
                api: this.api
            };
            code = swallow.render(code, tplParam);
            this.javascript = code;
        },
        queryApiData() {
            var param = {
                url: this.api
            };
            Core.post(Constants.root + '/faasQuery/byUrl', param, (result) => {
                var data = result.data;
                // console.log('data', data);
                this.data = data;
                this.sql = data.data;
            });
        },
        onEdit() {
            // alert('onEdit');
            this.visible = true;
        },
        onConfirm() {
            var crud = Crud.get('faas_api_data');
            var data = this.data;
            var updateParam = {
                id: data.apiId,
                data: this.sql
            };
            crud.edit(updateParam, () => {
                UI.success('更新成功');
            });
        },
        executeApi() {
            var url = Constants.root + this.api;
            var param = this.param;
            var page = this.service.page;
            page.loading = true;
            Core.post(url, param, (result) => {
                page.loading = false;
            });
        },
        executeCode() {
            var code = this.javascript;
            var page = this.service.page;
            code = 'function myFunc() {\n' 
                + code 
                + '\n}; myFunc;';
            // this 指针需要绑定到 this.service.page 对象
            var func = eval(code);
            
            console.log(page);

            func.call(page);
            // eval.call(page, code);
        }
    }
}
</script>