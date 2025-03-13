<template>
    <div style="background:#fff;" v-if="init">
        <!-- <div>调试面板</div> -->
        <div style="padding:0.5rem 1rem 1rem 1rem; font-size:12px;">
            <div>
                <div>
                    页面物理地址：{{pageUrl}}
                </div>
                <div>
                    当前请求地址：{{requestUrl}}
                </div>

                <cc-query>
                    <cc-query-input name="调试模式" v-model="param.debugToggle" mode="switch" @input="inputDebugMode">
                    </cc-query-input>
                </cc-query>


                <div style="padding:0px;">
                    <el-button type="blue" :size="size" @click="onTableData">表格数据</el-button>
                    <el-button type="success" :size="size" @click="onTableInfo">表结构</el-button>
                    <el-button type="danger" :size="size" @click="editCode">代码编辑</el-button>
                    <el-button type="blue" :size="size" @click="hotUpdate">热更</el-button>

                    <slot name="button"></slot>
                </div>

                <slot></slot>
            </div>
        </div>

        <cc-dialog title="表结构" :visible.sync="tableInfoVisible" width="80%">
            <div v-if="tableInfoVisible" style="padding:1rem;">
                <db-view :column-info="columnInfo" :table-desc="tableDesc" :table-info="tableInfo"></db-view>
            </div>
        </cc-dialog>

        <cc-dialog title="代码编辑" :visible.sync="codeEditVisible" width="80%">
            <!-- <iframe :src="pageSrc" frameborder="0" style="width:100%; height:600px;"></iframe> -->
            <file-editor :file-path="pageUrl"></file-editor>
        </cc-dialog>
    </div>
</template>

<script>
import DbView from '@/module/dbmanager/db-manager/db-view.vue';
import FileEditor from './file-editor.vue';
export default {
    components: {
        DbView, FileEditor
    },
    data: function() {
        return {       
            init: false,
            size: 'small',
            tableInfoVisible: false,
            codeEditVisible: false,
            columnInfo: null,
            tableDesc: null,
            tableInfo: {},
            param: {
                debugToggle: true
            },
            fieldMap: {
 
            },
            pageUrl: null,
            requestUrl: null,
            pageSrc: null
        }
    },
    props: {
        service: null,
        page: null
    },
    created() {
        this.loadDebugMode();
        this.loadPageData();
        this.init = true;
    },
    methods: {
        inputDebugMode() {
            this.loadDebugMode();
        },
        loadDebugMode() {
            if(this.service == null) {
                return;
            }
            var page = this.service.page;
            if(page == null) {
                return;
            }
            var debug = page.debug;
            if(debug != null) {
                debug.toggle = this.param.debugToggle;
            }
        },
        loadPageData() {
            if(this.service == null) {
                return;
            }
            var page = this.service.page;
            var auto = page.auto;
            var url = auto.url;
            
            console.log('auto', auto);
            // Logger.info('auto', auto);

            url = url.replace('../../', '');
            // console.log('window.Conf', window.Conf);
            var basePath = Conf.frontPath;
            var baseUrlPath = location.origin;
            var relativePath = auto.fullUrl.replace(baseUrlPath, '');
            // var fullPath = basePath + '/src/' + url;
            var fullPath = basePath + '/src' + relativePath;
            // Logger.info('relativePath', relativePath);

            this.pageUrl = fullPath;
            this.requestUrl = auto.fullUrl;
            this.pageSrc = '/ace.html?editor/edit#filename=' + fullPath;
            this.tableInfo.dao = page.dao;
            this.tableInfo.table = page.table;
        },
        onTableData() {
            var page = this.service.page;
            UI.showResult(page.rows);
        },
        onTableInfo() {
            // 展示表结构
            this.queryTableInfo(() => {
                this.tableInfoVisible = true;
            });
        },
        queryTableInfo(_succ) {
            console.log('init view', this.tableInfo);
            var page = this.service.page;
            var daoName = page.dao;
            var tableName = page.table;
            var param = {
                daoName, tableName
            }
            Core.post('table_v2/getTableInfo', param, (result) => {
                console.log('db-table result', result);
                this.columnInfo = result.columnInfo;
                this.tableDesc = result;
                if(_succ != null) {
                    _succ();
                }
            });
        },
        editCode() {
            this.codeEditVisible = true;
            var routerManager = RouterManager.routerManager;
            var urlMap = routerManager.urlMap;
            var page = this.service.page;   
            var route = page.debug.route;
            if(route == null) {
                var table = page.table;
                route = '/' + table;
            }
            console.log('route', route);
        },
        hotUpdate() {
            UI.warning('功能待开发');
        }
    }
}
</script>