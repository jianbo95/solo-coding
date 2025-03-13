import Api from '../Api.js';
import Convert from '../util/Convert.js';
import Core from '../util/Core.js';
import ServiceOpt from '../core/ServiceOpt.js';
import Counter from '../util/Counter.js';
import UI from '../util/UI.js';
import Util from '../util/Util.js';
import Formatter from '../util/Formatter.js';
import Crud from './Crud.js';
import BindTable from './util/BindTable.js';

var initPage = function(page) {
    // 查找page分页组件
    page.alert = function(info) {
        UI.warning(info);
    };

    if(page.pagin == null) {
        page.pagin = {
            total: 0,
            page: 1,
            rows: 15
        }
        if(page.config != null && page.config.pagin == false) {
            page.pagin = {
                total: 0,
                page: -1,
                rows: -1
            }
        }
    }

    if(page.getQueryParam == null) {
        page.getQueryParam = function() {
            return page.service.getQueryParam();
        };
    }

    if(page.size == null) {
        page.size = 'small';
    }

    if(page.moduleAuth == null) {
        page.moduleAuth = [];
    }

    if(page.onQuery == null) {
        page.onQuery = function() {
            // console.log('onQuery');
            page.service.onQuery();
        };
    }

    if(page.onAdd == null) {
        page.onAdd = function() {
            // console.log('onAdd');
            page.service.onAdd();
        };
    }

    if(page.onEdit == null) {
        page.onEdit = function() {
            // console.log('onEdit');
            page.service.onEdit();
        };
    }

    if(page.onDelete == null) {

        page.onDelete = function() {
            // console.log('onDelete');
            page.service.onDelete();
        };
    }

    if(page.onPaginChange == null) {
        page.onPaginChange = function() {
            // console.log('onPaginChange');
            page.service.onPaginChange();
        }
    }

    if(page.onAddConfirm == null) {
        page.onAddConfirm = function(_call, showMsg) {
            page.service.onAddConfirm(_call, showMsg);
        }
    }

    if(page.onDeleteConfirm == null) {
        page.onDeleteConfirm = function(_call, showMsg) {
            page.service.onDeleteConfirm(_call, showMsg);
        }
    }

    if(page.onEditConfirm == null) {
        page.onEditConfirm = function(_call, showMsg) {
            page.service.onEditConfirm(_call, showMsg);
        }
    }

    if(page.onSortChange == null) {
        page.onSortChange = function(sortConfig) {
            page.service.onSortChange(sortConfig);
        }
    }

    if(page.onPacket == null) {
        page.onPacket = function(data) {
            if(page.$refs.packetDialog != null) {
                if(data != null && Util.isObject(data)) {
                    console.log('open custom data', data);
                    page.$refs.packetDialog.open(data);
                } else {
                    console.log('page.currentRow', page.currentRow);
                    page.$refs.packetDialog.open(page.currentRow);
                }
            } else {
                console.error('未定义<cc-packet-dialog ref="packetDialog"></cc-packet-dialog>');
            }
        }
    }

    if(page.onTest == null) {
        page.onTest = function() {
            page.service.onTest();
        }
    }

    page.fieldClick = function(field) {
        if(field == 'comCode' || field == 'comName') {
            // 需要权限才能打开该弹框
            page.$refs.comcodeDialog.open();
        }
    };

    page.Dict = Dict;
    page.Formatter = Formatter;

    page.D = function(key) {
        return Dict.get(key);
    };

    if(page.queryParam == null) page.queryParam = {};
    if(page.form == null) page.form = {};

    // 字段长度方法
    var width = (column) => {
        var name = column.name;
        var width = 90;
        var maxWidth = 250;

        if(page.widthConfig != null) {
            if(page.widthConfig[name] != null) {
                return page.widthConfig[name];
            }
        }

        // 根据表格数据计算合适长度
        if(page.rows == null) {
            return 100;
        }
        for(var i = 0; i < page.rows.length; i++) {
            var row = page.rows[i];
            var value = row[name];
            if(value == null) {
                continue;
            }
            var valueWidth = value.length * 9;
            if(width < valueWidth) {
                width = valueWidth;
            }
        }
        if(width > maxWidth) {
            width = maxWidth;
        }
        // column.valueDemo;
        // console.log('showWidth', width);
        return width;
    }

    page.width = (column) => {
        let value = width(column);
        if(value == null) {
            return value;
        }
        return value + '';
    };

    page.post = function(url, param, _call, type, opts) {
        page.loading = true;
        Core.post(url, param, (result) => {
            this.loading = false;
            _call(result);
        }, type, opts);
    };

    // 增删改查对象
    page.crud = Crud.get(page.dao, page.table);
};

var pageStart = function() {
    if(window.App != null) {
        App.initPage = false;
    }
};

var pageLoad = function() {
    if(window.App != null) {
        App.initPage = true;
    }
};

/**
 * 获取业务对象
 * @param {Object} page vue实例
 * @param {Object} opt: {
 *      url: {
 *          datagrid: String,
 *          add: String,
 *          edit: String,
 *          delete: String
 *      }
 * }
 * @returns service
 */
var getService = function(page, opt) {
    if(opt == null) {
        opt = {};
    }
    var config = page.config;

    // console.log("config", config);
    // var defaultConfig = Util.clone(config);
    pageStart();
    var service = {
        opt: opt,
        lastQueryParam: null,
        sortConfig: null, // 排序配置
        config: config,
        page: page,
        module: page.module,

        columnInfo: null,
        tableDesc: null,

        self() {
            return this.page();
        },

        /**
         * 构建增删改查url
         * @param {String} type 类型，可选值 [datagrid/add/edit/delete]
         * @returns url
         */
        buildUrl: function(type) {
            let url = ServiceOpt.url(type, this.opt);
            if(url != null) {
                return url;
            }
            return Constants.root + this.module + "/" + type;
        },
        loadTableInfo (_call) {
            var param = {
                daoName: page.dao, 
                tableName: page.table,
                module: page.module
            }
            if(param.tableName == null) {
                UI.error('tableName不存在');
                return;
            }
            
            if(page.module == 'crud_v2') {
                var url = 'table_v2/getModelInfo';
                Core.post(url, param, (result) => {
                    this.columnInfo = result.columnInfo;
                    if(page.hideField != null) {
                        page.columnInfo = this.hideField(result.columnInfo, page.hideField);
                    } else {
                        page.columnInfo = result.columnInfo;
                    }

                    this.tableDesc = result;
                    this.initIdName();
                    this.initEditField();
                    
                    _call();
                });
            } else {
                var url = 'table_v2/getTableInfo';
                Core.post(url, param, (result) => {
                    this.columnInfo = result.columnInfo;
                    if(page.hideField != null) {
                        page.columnInfo = this.hideField(result.columnInfo, page.hideField);
                    } else {
                        page.columnInfo = result.columnInfo;
                    }
                    this.tableDesc = result;
                    this.initIdName();
                    this.initEditField();
                    
                    _call();
                });
            }
        },
        hideField(columnInfo, hideField) {
            var list = [];
            for(var i in columnInfo) {
                var info = columnInfo[i];
                if(!Util.inArray(info.name, hideField)) {
                    list.push(info);
                }
            }
            return list;
        },
        loadModelFieldMap(_call) {
            var fieldMap = page.fieldMap;
            var pageCrud = page.crud;
            pageCrud.fieldMap(page.table, (result) => {
                console.log('loadModelFieldMap result', result);
                
                for(var key in result) {
                    var map = result[key];
                    fieldMap[key] = map;
                }
                
                _call();
            });

        },
        /**
         * 格式一：
         * loadData: {
         *     fieldMap: ['project', 'third', 'dict.body_type']
         * },
         * 格式二：
         * loadData: {
         *     fieldMap: {
         *         'project': 'cicd_project.name'
         *     }
         * },
         * 
         * 加载字段映射
         * @param {Function} _call 
         * @returns 
         */
        loadFieldMap (_call) {
            if(page.loadData == null) {
                _call();
                return;
            }

            var loadFields = page.loadData.fieldMap;
            if(loadFields == null) {
                _call();
                return;
            }

            var size = Util.size(loadFields);

            var counter = Counter.build(size);

            counter.finish(() => {
                // console.log('loadFieldMap', page.fieldMap);
                _call();
            });

            var fieldMap = page.fieldMap;
            // console.log('loadField', loadFields);
            // console.log('loadField.length', size);

            var load = function(fieldMap, code, map) {
                fieldMap[code] = map;
                counter.call();
            };

            for(var i in loadFields) {
                var field = loadFields[i];
                var key = i;
                // 判断key是不是数字
                var isNumber = Util.isNumberStr(key);

                ((localField, key) => {

                    let fieldName = (name) => {
                        if(!isNumber) {
                            if(key.indexOf('.') != -1) {
                                console.warn('key存在符号.');
                            }
                            return key;
                        } else {
                            return name;
                        }
                    };
                    
                    // console.log('load localField', localField);
                    // console.log('field', field);
                    if(Util.isObject(localField)) {
                        var config = localField;
                        var crud = Crud.get(page.dao, config.module);
                        crud.fieldKeyMap(config.key, config.description, (map) => {
                            load(fieldMap, fieldName(code), map);
                        });
                    
                    // TODO 查询字典
                    } else if(localField.indexOf('dict.') == 0) {
                        var code = localField.replace('dict.', '');
                        Api.dict(code, (values) => {
                            var map = Convert.listToMap(values);
                            load(fieldMap, fieldName(code), map);
                        });
                    
                    // 根据key查询
                    } else if(key.indexOf('.') != -1) {
                        var arr = key.split(".");
                        var module = arr[0];
                        var name = arr[1];

                        var crud = Crud.get(page.dao, module);
                        // 发起请求
                        crud.enum(name, (values) => {
                            var map = Convert.listToMap(values);
                            // console.log(localField, map);
                            load(fieldMap, fieldName(localField), map);
                        });

                    // 查询其它模块的
                    } else if(localField.indexOf('.') != -1) {
                        var arr = localField.split(".");
                        var module = arr[0];
                        var name = arr[1];

                        var crud = Crud.get(page.dao, module);
                        // 发起请求
                        crud.enum(name, (values) => {
                            var map = Convert.listToMap(values);
                            // console.log(localField, map);
                            load(fieldMap, fieldName(localField), map);
                        });

                    // 查询当前模块的
                    } else {

                        page.crud.enum(localField, (values) => {
                            var map = Convert.listToMap(values);
                            // 这里不能用field，需要转成局部域localField
                            // fieldMap[localField] = map;
                            load(fieldMap, fieldName(localField), map);
                        });
                    }

                })(field, key);
            }
        },
        initIdName() {
            console.log('this.tableDesc', this.tableDesc);
            if(page.config.idName == null) {
                page.config.idName = this.tableDesc.priKey;
            } 
        },
        initEditField() {
            if(page.editField != null && page.editField.length > 0) {
                return;
            }
            var fields = [];
            for(var i in this.columnInfo) {
                var column = this.columnInfo[i];
                var name = column.name;
                if(name == 'id'
                    || name == 'create_date'
                    || name == 'modify_date'
                    || name == 'createDate'
                    || name == 'modifyDate'
                    ) {
                    continue;
                }
                var field = {
                    name: column.comment,
                    field: column.name
                };
                if(page.fieldMap[name] != null) {
                    field.map = page.fieldMap[name];
                }
                fields.push(field);
            }
            page.editField = fields;
        },

        onTest: function() {
            UI.debug(page.currentRow);
        },

        loadLiteData: function(_call) {
            pageLoad();
            this.page.loading = false;
            this.page.init = true; // 提前完成初始化
            _call();
        },

        queryTableOrNot: function(isLoadTable, _call) {
            if(isLoadTable == false) {
                _call();
            } else {
                this.queryTable((data) => {
                    _call(data);
                });
            }
        },
        
        loadData: function(_call, isLoadTable) {

            // 之前写法有问题！！！
            if(isLoadTable == null) {
                isLoadTable = true;
            }

            // 查询表数据
            // this.queryTableOrNot(isLoadTable, (data) => {

            //     var counter = Counter.auto('loadData');
                
            //     // 查询表扩展数据
            //     if(page.table !== false) {
            //         this.loadTableInfo(counter.callAuto('loadTableInfo'));
            //         this.loadModelFieldMap(counter.callAuto('loadModelFieldMap'));
            //     } else {
            //         console.info('page.table is false');    
            //     }
                
            //     // 查询字段映射
            //     this.loadFieldMap(counter.callAuto('loadFieldMap'));

            //     // 查询完成
            //     counter.finish(() => {
            //         var fieldMap = this.page.fieldMap;
            //         this.page.fieldMap = Util.cloneMap(fieldMap);
            //         // console.log('load page data ' + page.table + ' finish', page.fieldMap);

            //         // 加载页面
            //         this.page.loading = false;
            //         this.page.init = true; // 提前完成初始化

            //         // 绑定数据
            //         if(isLoadTable != false) {
            //             this.bindTable(data);
            //         }

            //         this.page.loading = false; // 完成页面加载
            //         pageLoad();

            //         _call(); // 回调
            //     });
            // });
            var counter = Counter.auto('loadData');
            
            // 查询表扩展数据
            if(page.table !== false) {
                this.loadTableInfo(counter.callAuto('loadTableInfo'));
                this.loadModelFieldMap(counter.callAuto('loadModelFieldMap'));
            } else {
                console.info('page.table is false');    
            }
            
            // 查询字段映射
            this.loadFieldMap(counter.callAuto('loadFieldMap'));
            // 查询完成
            counter.finish(() => {
                console.log('映射加载完成', page.fieldMap);
                // console.log('this.queryParam', JSON.stringify(this.page.queryParam));

                this.queryTableOrNot(isLoadTable, (data) => {
                    
                    var fieldMap = this.page.fieldMap;
                    this.page.fieldMap = Util.cloneMap(fieldMap);
                    // console.log('load page data ' + page.table + ' finish', page.fieldMap);

                    // 加载页面
                    this.page.loading = false;
                    this.page.init = true; // 提前完成初始化

                    // 绑定数据
                    if(isLoadTable != false) {
                        this.bindTable(data);
                    }

                    this.page.loading = false; // 完成页面加载
                    pageLoad();

                    _call(); // 回调
                    
                });

            });
        },
        getQueryParam: function() {
            var pagin = page.pagin;
            var param = page.queryParam; // 查询参数
            var pageSort = page.config.sortConfig;
            var sort = this.sortConfig;
            var queryParam = {
                page: pagin.page, 
                rows: pagin.rows
            };
            for(var key in param) {
                if(param[key] != "") {
                    queryParam[key] = param[key];
                }
            }

            if(page.config.pagin == false) {
                queryParam.page = -1;
            }
            
            if(!this.loadSort(queryParam, sort)) {
                this.loadSort(queryParam, pageSort);
            }

            // console.log('this.tableDesc', this.tableDesc);
            if(queryParam.table == null) {
                queryParam.table = page.table;
            }
            if(queryParam.dao == null) {
                queryParam.dao = page.dao;
            }
            if(page.relay != null) {
                queryParam.relay = JSON.stringify(page.relay);
            }
            return queryParam;
        },
        loadSort: function(param, sort) {
            if(sort != null) {
                if(sort.sortOrder != null 
                        && sort.sortField != null) {
                    param.sortField = sort.sortField;
                    param.sortOrder = sort.sortOrder;
                    if(sort.sortMulti != null) {
                        param.sortMulti = JSON.stringify( sort.sortMulti );
                    }
                    
                    return true;
                }
            }
            return false;
        },
        onSortChange: function(sortConfig) {
            // page.config.sortConfig = sortConfig;
            this.sortConfig = sortConfig;
            page.onQuery();
        },
        // 仅查询
        queryTable: function(_success) {
            // 在条件发送改变之后，点击查询时，会自动回到第一页
            var currentQueryParam = JSON.stringify(page.queryParam);
            // console.log('上一次的条件', this.lastQueryParam);
            // console.log('这一次的条件', currentQueryParam);
            if(this.lastQueryParam != null) {
                if(this.lastQueryParam != currentQueryParam) {
                    page.pagin.page = 1; // 条件变更回到第一页
                }
            }
            // 保存条件，下一次使用
            this.lastQueryParam = currentQueryParam;
            // console.log('save this.lastQueryParam', this.lastQueryParam);

            var queryParam = page.getQueryParam();

            var url = this.buildUrl( "datagrid" );

            // TODO 清除空格
            Util.trimMapField(queryParam);
            console.log("查询主表格条件", queryParam);

            Core.post(url, queryParam, (data) => {
                
                if(_success != null) {
                    _success(data);
                }
            }, 'json');
        },
        // 仅绑定
        bindTable: function(result) {
            var data = result.data;
            console.log( "查询主表格数据", data );
            var pagin = page.pagin;
            pagin.total = data.total;
            // console.log('pagin.total', pagin.total);
            
            page.pagin = Util.cloneMap(pagin);

            page.datagrid = data;

            // 绑定到 page.rows
            if(page.bindRows != null) {
                // 自定义绑定
                page.bindRows(data);
            } else {
                if(page.config.convertTree != null) {
                    BindTable.bind(page, data);
                } else {
                    page.rows = data.rows;
                }
            }

            
        },
        // 查询表格并绑定
        loadTable: function(_success) {
            this.queryTable((data) => {
                this.bindTable(data);
                if(_success != null) {
                    _success();
                }
            });
        },
        onQuery: function() {
            // console.log('onQuery');
            page.loading = true;
            this.loadTable(() => {
                page.loading = false;
            });
        },
        loadDefaultValue: function(form) {
            for (let i = 0; i < page.editField.length; i++) {
                const element = page.editField[i];
                if(element.default != null) {
                    if(form[element.field] == null) {
                        form[element.field] = element.default;
                    }
                }
            }
        },
        onAdd: function() {
            var dialog = page.$refs.editDialog;
            // page.form = {}; // 导致双向绑定解除？
            var form = Util.cloneBase( page.currentRow );
            this.loadDefaultValue(form); // 加载默认值
            page.form = form;
            var idField = page.config.idName;
            delete page.form[idField];
            dialog.open('新增');
        },
        isSelect: function() {
            // console.log('isSelect', page.currentRow);
            if(page.currentRow == null) {
                UI.warning("请选择一条记录");
                return false;
            }
            return true;
        },
        getRow: function(_call) {
            if(page.currentRow == null) {
                UI.warning("请选择一条记录");
                return null;
            }
            _call(page.currentRow);
        },
        onEdit: function() {
            if(this.isSelect()) {
                var dialog = page.$refs.editDialog;
                page.form = Util.cloneBase( page.currentRow );
                dialog.open('编辑');
            }
        },
        onDelete: function() {
            if(this.isSelect()) {
                UI.deleteConfirm(() => {
                    this.page.onDeleteConfirm();
                });
            }
        },
        loadParam: function(param) {
            param._ds = page.queryParam._ds;
            if(param.table == null) {
                param.table = page.table;
            }
            if(param.dao == null) {
                param.dao = page.dao;
            }
            if(param.table == null) {
                console.warn('param.table is null');
            }
            if(param.dao == null) {
                console.warn('param.dao is null');
            }
        },
        onAddConfirm: function () {
            console.log('on add confirm');
            var url = this.buildUrl('add');
            var param = page.form;
            param.opts_text = '正在新增...';

            this.loadParam(param);

            UI.post(url, param, (result) => {
                page.onQuery();
            });
        },
        getId: function(row) {
            console.log('config', this.config);
            if(row == null) {
                row = this.page.currentRow; 
            }
            if(row == null) {
                console.error("获取当前列失败", row);
            }
            var id = row[this.config.idName];
            // console.log('getId', id, row, this.config.idName);
            if(id == null) {
                console.error("获取ID失败", id);
            }
            return id;
        },
        onEditConfirm: function (_call, showMsg) {
            console.log('on edit confirm', showMsg, _call);
            var url = this.buildUrl('edit');
            var param = page.form;
            console.log('edit', param);
            
            param[this.config.idName] = this.getId();
            param.opts_text = '正在编辑...';
            
            this.loadParam(param);

            if(page.relay != null) {
                param.relay = JSON.stringify(page.relay);
            }
            
            UI.post(url, param, (result) => {

                if(result.status == 'success' || result.code == 200) {
                    if(_call != null) { 
                        _call(result); 
                    } 
                    page.onQuery();
                    if(showMsg != false) {
                        // 增加修改成功提示
                        UI.success(result.msg);
                    }
                }
            });
        },
        onDeleteConfirm: function(_call, showMsg) {
            var page = this.page;
            _call = _call || function() {};
            console.log('on delete confirm');
            var url = this.buildUrl('delete');
            var id = this.getId();
            var opts_text = '正在删除...';
            // if(param == null) {
            // }
            var param = { id, opts_text };
            
            this.loadParam(param);
            console.log( 'delete param', param);

            UI.post(url, param, (result) => {
                _call();
                page.onQuery();

                if(showMsg != false) {
                    // 增加删除成功提示
                    UI.success(result.msg);
                }
            });
        },
        onPaginChange : function() {
            console.log('page.opPaginChange', page.pagin);
            page.onQuery();
        },
        postSelect (url, _call) {
            if(!this.isSelect()) {
                return;
            }
            var param = {
                id: page.currentRow.id
            };
            
            UI.post(url, param, (result) => {
                _call(result);
            });
        },
        waitRef(ref, _call, _error, _key) {
            Core.waitRef(this.page.$refs, ref, _call, _error, _key);
        },
        // TODO loadRef
        loadRef(_call) {
            var refs = page.config.ref;
            for(var i in refs) {
                var name = refs[i];
                
            }
        }
    };
    initPage(page, service);
    
    return service;
};

export default {
    getOpts(opts) {
        if(opts == null) {
            opts = {};
        }
        if(opts == false) {
            opts = {
                check: false
            };
        }
        if(opts.check == null) {
            opts.check = true;
        }
        return opts;
    },
    getService: function(page, config) {
        if(page == null) {
            console.error("页面 page 不能为空");
            return;
        }
        // initPage(page);
        return getService(page, config);
    }
}