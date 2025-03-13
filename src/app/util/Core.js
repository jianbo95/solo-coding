import Constants from '../data/Constants.js'
import Crypto from './crypto.js'
import Mock from '../mock/Mock.js'
import StringUtil from './StringUtil.js'
import SessionUtil from './SessionUtil.js'
import Counter from './Counter.js';
import Dict from '../data/Dict.js';
import ServiceOpt from '../core/ServiceOpt.js';
import {axios} from '../NodeModule.js';
import Util from './Util.js'
import {qs} from '../NodeModule.js';

// 带缓存的请求，不带转圈
// TODO 增加校验
var postcCache = {};
$.postc = function(url, param, _call, type) {
    var paramJson = JSON.stringify(param);
    var key = url+paramJson;
    var cache = postcCache[key];
    if(cache != null) {
        // console.log('从缓存中获取');
        _call(cache);
        return;
    }
    if(type == null) {
        type = 'json';
    }
    $.post(url, param, (result) => {
        // 链接和参数一致则 保存到缓存
        postcCache[key] = result;
        _call(result);
    }, type);
};

var initPage = function(page) {
    if(page.pagin == null) {
        page.pagin = {
            total: 0,
            page: 1,
            rows: 10
        }
    };

    if(page.bindTable == null) {
        page.bindTable = function(data) {
            page.service.bindTable(data);
        };
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
        page.onEdit = function(row) {
            // console.log('onEdit');
            page.service.onEdit(row);
        };
    }

    if(page.onDelete == null) {

        page.onDelete = function(call, row) {
            // console.log('onDelete');
            page.service.onDelete(call, row);
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

    if(page.onEditConfirm == null) {
        page.onEditConfirm = function(_call, showMsg) {
            page.service.onEditConfirm(_call, showMsg);
        }
    }
	
	if(page.onDeleteConfirm == null) {
	    page.onDeleteConfirm = function(_call, showMsg) {
	        page.service.onDeleteConfirm(_call, showMsg);
	    }
	}

    if(page.onSortChange == null) {
        page.onSortChange = function(sortConfig) {
            page.service.onSortChange(sortConfig);
        }
    }

    if(page.onTest == null) {
        page.onTest = function() {
            console.log(page.currentRow);
        }
    }

    if(page.onPacket == null) {
        page.onPacket = function() {
            if(page.$refs.packetDialog != null) {
                page.$refs.packetDialog.open(page.currentRow);
            } else {
                console.error('未定义<cc-packet-dialog ref="packetDialog"></cc-packet-dialog>');
            }
        }
    }

	page.fieldClick = function(field) {
		let fields = page.comcodeEdit;
		for(var i in fields) {
			var comcodeEdit= fields[i];
			if(comcodeEdit == field) {
				page.$refs.comcodeDialog.open();
			}
		}
		if(field == 'comCode' || field == 'comName') {
			// 需要权限才能打开该弹框
			page.$refs.comcodeDialog.open();
		}
	};

    page.Dict = Dict;

    page.D = function(key) {
        return Dict.get(key);
    };

    if(page.queryParam == null) page.queryParam = {};
    if(page.form == null) page.form = {};
	
	// 初始化权限属性
	
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
    var config = page.config;
    // console.log("config", config);
    // var defaultConfig = Util.clone(config);
    if(opt == null) {
        opt = {};
    }
    
    pageStart();
    var service = {
        opt: opt,
        lastQueryParam: null,
        sortConfig: null, // 排序配置
        config: config,
        page: page,
        module: page.module,

        /**
         * 通知子组件，操作计数
         * @param {Integer} operation 操作名称
         */
        notify: function(operation) {
            page[operation] ++;
        },

        /**
         * 构建增删改查url
         * @param {String} type 类型，可选值 [datagrid/add/edit/delete]
         * @returns url
         */
        buildUrl: function(type) {
            let url = ServiceOpt.url(type, this.opt);
            console.log(type, this.opt, this.opt[type], url);
            if(url != null) {
                return url;
            }
			// if(type == 'datagrid') {
			// 	if(this.page.datagridApi != null) {
			// 		return Constants.root + this.module + "/" + this.page.datagridApi;
			// 	}
			// }
            return Constants.root + this.module + "/" + type;
        },
        loadData: function(_call, isLoadTable) {
            console.log('当前模块', this.module);
            this.loadAuthv2();
            console.log('page.moduleAuth', page.moduleAuth);
            
            let finish = () => {
                _call();
                this.page.init = true; // 完成初始化
                this.page.loading = false; // 完成页面加载
                pageLoad();
            };

            if(isLoadTable != false) {
                this.loadTable(() => {
                    finish();
                });
            } else {
                finish();
            }

        },
        getQueryParam: function() {
            var pagin = page.pagin;
            var param = page.queryParam;
            var pageSort = page.config.sortConfig;
            var sort = this.sortConfig;
            var queryParam = {
                page: pagin.page, 
                rows: pagin.rows
            };
            
            if(queryParam.rows == 0) {
                queryParam.page = 0;
            }

            for(var key in param) {
                if(param[key] != "") {
                    queryParam[key] = param[key];
                }
            }
            
            if(!this.loadSort(queryParam, sort)) {
                this.loadSort(queryParam, pageSort);
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
            var onlyQueryParam = page.queryParam;
            var currentQueryParam = JSON.stringify(onlyQueryParam);
            // console.log('上一次的条件', this.lastQueryParam);
            // console.log('这一次的条件', currentQueryParam);
            if(this.lastQueryParam != null) {
                if(this.lastQueryParam != currentQueryParam) {
                    page.pagin.page = "1"; // 回到第一页
                }
            }
            // 保存条件，下一次使用
            this.lastQueryParam = currentQueryParam;

            var queryParam = this.getQueryParam();

            var url = this.buildUrl( "datagrid" );

            // TODO 清除空格
            Util.trimMapField(queryParam);
            console.log("查询主表格条件", queryParam);
            // console.log('url', url);

            Core.post(url, queryParam, (data) => {
                
                if(_success != null) {
                    _success(data);
                }
            }, 'json');
        },
        // 仅绑定
        bindTable: function(data) {
            console.log( "查询主表格数据", data );
            var pagin = page.pagin;
            pagin.total = data.total;
            page.detail = data.detail;
            page.datagrid = data;
            console.log('this.opt',this.opt);
            
            if(this.opt.rowKey == 'root') {
                page.rows = data;
            } else {
                page.rows = data.rows;
            }
        },
        // 查询表格并绑定
        loadTable: function(_success) {
            this.queryTable((data) => {
                page.bindTable(data);
                if(_success != null) {
                    _success();
                }
            });
        },
		loadAuthv2() {
			let buttonArr = ['add', 'delete', 'edit'];
			let authArr = [];
			let authMap = DataInit.getUserAuth();
			
			for(var i in buttonArr) {
				var button = buttonArr[i];
				var key = this.module + '/' + button;
				var hasAuth = authMap[key];
				if(hasAuth) {
					authArr.push(button);
				}
				var Button = StringUtil.upFirst(button);
				page['auth' + Button] = key;
			}
			
			page.moduleAuth = authArr;
		},
        loadAuth: function(_success) {
            var url = Constants.root + "menu/moduleAuth";
            $.postc(url, {}, (result) => {
                // console.log(result);
                // var data = result.data;
                // console.log('当前模块', page.module);
                if(result.data == null) {
                    // UI.warning("可能未登录");
                    _success();
                    page.moduleAuth = [];
                    return;
                }
                console.log('获取权限', result.data);
                var auth = result.data[page.module];
                if(auth == null) {
                    auth = [];
                }
                page.moduleAuth = auth;
                // console.log("当前模块权限：", page.moduleAuth);
                
                _success();
            });
        },
        onQuery: function() {
            // console.log('onQuery');
            page.loading = true;
            this.loadTable(() => {
                page.loading = false;
            });
        },
        onAdd: function() {
            var dialog = page.$refs.editDialog;
            page.form = {}; // 导致双向绑定解除？
            // page.form = Util.cloneBase( page.currentRow );
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
        bindRow: function(row) {
            if(row != null) {
                page.currentRow = row;
            }
        },
        onEdit: function(row) {
            console.log('onEdit', row);
            this.bindRow(row);
            if(this.isSelect()) {
                var dialog = page.$refs.editDialog;
                page.form = Util.cloneBase( page.currentRow );
                console.log('page.currentRow', page.currentRow);
                dialog.open('编辑');
            }
        },
        onDelete: function(_call, row) {
            this.bindRow(row);
            if(this.isSelect()) {
                UI.deleteConfirm(() => {
					console.log('用户点击了删除');
                    this.page.onDeleteConfirm(_call);
                });
            }
        },
        onAddConfirm: function (_call, showMsg) {
            // console.log('on add confirm');
            var url = this.buildUrl('add');
            var param = page.form;
            param.opts_text = '正在新增...';
            param._ds = page.queryParam._ds;
            UI.post(url, param, (result) => {
                if(result.status == 'success') {
                    if(_call != null) {
                        _call(result); 
                    } 
                    page.onQuery();
                    if(showMsg != false) {
                        // 增加添加成功提示
                        UI.success(result.msg);
                    }
                }
            });
        },
		getIdName: function() {
			if(this.config.idName != null && this.config.idName != '') {
				return this.config.idName;
			} else {
				return 'id';
			}
		},
        getId: function(row) {
            // console.log('config', this.config);
            if(row == null) {
                row = this.page.currentRow; 
            }
            if(row == null) {
                console.error("获取当前列失败", row);
            }
            var id = row[this.getIdName()];
            // console.log('getId', id, row, this.getIdName());
            if(id == null) {
                console.error("获取ID失败", id);
            }
            return id;
        },
        onEditConfirm: function (_call, showMsg) {
            console.log('on edit confirm');
            var url = this.buildUrl('edit');
            var param = page.form;
            // console.log('edit', param);
            param[this.getIdName()] = this.getId();
            param.opts_text = '正在编辑...';
            param._ds = page.queryParam._ds;
            
            UI.post(url, param, (result) => {
                if(result.status == 'success') {
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
            // console.log('on delete confirm');
            var url = this.buildUrl('delete');
            var id = this.getId();
            var opts_text = '正在删除...';
            var param = { id, opts_text };
            // console.log( 'delete param', param);
            param._ds = page.queryParam._ds;
            UI.post(url, param, (result) => {
                if(result.status == 'success') {
                    if(_call != null) { 
                        _call(result); 
                    } 
                    page.onQuery();
                    if(showMsg != false) {
                        // 增加删除成功提示
                        UI.success(result.msg);
                    }
                }
            });
        },
        onPaginChange : function() {
            console.log('opPaginChange');
            page.onQuery();
        }
    };
    initPage(page, service);
    
    return service;
};

var Core = {
    debug(name) {
        if(StyleConfig.forceCloseDebug == true) {
            return false;
        }
        if(StyleConfig.componentDebug[name] == true) {
            return true;
        }
        if(StyleConfig.debug) {
            return true;
        }
        return false;
    },
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
    // 对新的报文格式进行校验
    postApi: function(url, param, _call, type, opts) {
        $.post(url, param, (result) => {
            if(result.code != 200) {
                if(opts.check) {
                    if(result.dialog == true) {
                        UI.warningDialog(result.message);
                    } else {
                        // 提示不了错误？
                        UI.error("提示：" + result.message);
                    }
                } else {
                    console.log('参数不需要校验');
                }
            }
            _call(result);
        }, type);
    },
    /**
     * v2 版本接口处理
     */
    handleV2: function(url, opts, result, _call) {
        if(result.code != 200) {
            if(opts.check) {
                if(result.dialog == true) {
                    UI.warningDialog(result.message);
                } else {
                    // UI.error("提示：" + result.message);
                    if(result.message.includes('登录已失效')){
                        UI.alert(result.message,()=>{
                            SessionUtil.setUser();
                            let url = window.location.href.split('#')
                            if(window.UserType == 'auction') {
                                window.location.href =  url[0] + '#/login'
                            }else{
                                window.location.href = url[0] + '#/login'
                            }
                        })
                    }else{
                        UI.error("提示：" + result.message);
                    }
                }
            } else {
                console.log('参数不需要校验');
            }
        } else {
            result.status = 'success';
        }
        _call(result);
    },

    /**
     * v1 版本接口处理
     */
    handleV1: function(url, opts, result, _call) {
        if(Util.isString(result)) {
            _call(result);
            return;
        }

        if(result.status == "success") {

            // 成功的不提示
            // app.$message({
            //     message: result.msg,
            //     type: 'success'
            // });

        } else if(result.status == "failure") {
            
            if(opts.check) {
                if(result.dialog == true) {
                    UI.warningDialog(result.msg);
                } else {
                    if(result.msg == null) {
                        UI.error('提示异常，原因未知');
                    } else if(result.msg.includes('登录已失效')){
                      UI.alert(result.message,()=>{
                            SessionUtil.setUser();
                            let url = window.location.href.split('#')
                            if(window.UserType == 'auction') {
                                window.location.href =  url[0] + '#/login'
                            }else{
                                window.location.href = url[0] + '#/login'
                            }
                        })
                    }else{
                        UI.error("提示：" + result.msg);
                    }
                }
            } else {
                console.log('参数不需要校验');
            }
            
            console.error('请求' + url + '异常');
            console.error('响应异常结果', result);
            if(result.msg == '用户未登录') {
                AppPlus.openLoginDialog();
            }
            
        } else {
            console.info('响应其它结果', result);
        }

        _call(result);
    },

    /**
     * 以json格式发起请求
     */
    postJson: function(url, param, _call, type, opts) {
        opts = this.getOpts(opts);
        opts.requestType = 'json';
        param = JSON.stringify(param);
        this.post(url, param, _call, type, opts);
    },

    /**
     * 以加密发起请求，默认为 aes 加密
     */
    postEncrypt: function(url, param, _call, type, opts) {
        opts = this.getOpts(opts);
        opts.requestType = 'json';
        let data = Crypto.encrypt(JSON.stringify(param));
        let map = {
            'dataSecret' : data
        };
        let request = JSON.stringify(map);
        this.post(url, request, _call, type, opts);
    },

    postToken: function(url, param, _call, type, token) {
        
        if(token == null) {
            console.error('token 不能为空', url, token);
            return;
        }
        let opts = {
            token: token
        };
        this.post(url, param, _call, type, opts);
    },

    /**
     * 带校验的接口请求 - 任何请求都走该校验
     * 成功不提示，失败提示后台返回信息
     * 无论是成功还是失败都会回调
     * @param {String} url 请求地址
     * @param {Object} param 请求参数
     * @param {Function} _call 回调函数
     * @param {String} type 响应类型
     * @param {Object} opts 扩展参数
     */
    post: function(url, param, _call, type, opts) {

        // 开头 // 修复
        if(url.substring(0, 2) === '//') {
            url = '/' + url.substring(2);
            console.info('url以//为开头，不合法', url);
        }
        if(url.substring(0, 1) !== '/' && url.indexOf('http') != 0) {
            url = Constants.root + url;
        }

        if(Util.isFunction(param)) {
            _call = param;
            param = {};
        }
        
        type = type || 'json';
        opts = this.getOpts(opts);
        _call = _call || function() {};
        
        // console.log('Core post opts', opts);
        // console.log('Core post url', url);

        // if(url == 'payment-upay-console/checkAccount/bankQuery') {
        //     this.postApi(url, param, _call, type, opts);
        //     return;
        // }

        // 判断是否为mock地址
        let isMock = Mock.isMock(url);
        if(isMock) {
            // console.log('mock接口', url);
            url = StringUtil.replaceAll(url, 'api', 'mock-api');
        }

        var _this = this;
        var contentType = null;
        if(opts.requestType === 'json') {
            contentType = 'application/json';
        }

        var token = SessionUtil.getToken();
        if(token == null) {
            if(location.hash == '#/login') {
                // ignore
            } else {
                console.error('token is null ' + url + ' location:' + location.href);
            }
        }

        if(opts.token != null) {
            token = opts.token;
        }

        var options = {
            url: url,
            dataType: type,
            headers: {
                'Authorization' : token
            },
            data: param,
            type: "post",
            success: (result) => {
                if(result == null) {
                    UI.error('接口：' + url + "返回结果为空");
                    _call();
                    return;
                }
                if(result.code != null) {
                    _this.handleV2(url, opts, result, _call);
                } else {
                    _this.handleV1(url, opts, result, _call);
                }
            },
            error(xhr, status, error) {
				console.log('xhr', xhr);
                var statusCode = xhr.status;
                var statusText = xhr.statusText;
                var msg = statusCode + ' ' + statusText;
                console.error('request [' + url + '] status:' + msg);
                UI.warning('服务端响应：' + msg);
				
				// var errorResult = JSON.parse( xhr.responseText );
				// if(errorResult.code != null) {
				//     _this.handleV2(url, opts, errorResult, _call);
				// } else {
				//     _this.handleV1(url, opts, errorResult, _call);
				// }
            }
        };

        if(contentType !== null) {
            options.contentType = contentType;
        }
        if(opts.timeout != null) {
            options.timeout = opts.timeout;
        }

        console.log('请求【' + url + '】选项', options);

        $.ajax(options);
    },

    /**
     * 带校验的接口请求 - 任何请求都走该校验
     * @param {String} url 请求地址
     * @param {Object} param 请求参数
     * @param {Function} _call 回调函数
     * @param {String} type 响应类型
     * @param {Object} opts 扩展参数
     */
    getApi: function(url, param, _call, type, opts) {

        // 开头 // 修复
        if(url.substring(0, 2) === '//') {
            url = '/' + url.substring(2);
            console.info('url以//为开头，不合法', url);
        }
        if(url.substring(0, 1) !== '/') {
            url = Constants.root + url;
        }

        if(Util.isFunction(param)) {
            _call = param;
            param = {};
        }
        
        type = type || 'json';
        opts = this.getOpts(opts);
        _call = _call || function() {};
        
        // console.log('Core post opts', opts);
        // console.log('Core post url', url);

        // if(url == 'payment-upay-console/checkAccount/bankQuery') {
        //     this.postApi(url, param, _call, type, opts);
        //     return;
        // }

        // 判断是否为mock地址
        let isMock = Mock.isMock(url);
        if(isMock) {
            // console.log('mock接口', url);
            url = StringUtil.replaceAll(url, 'api', 'mock-api');
        }

        var _this = this;

        $.ajax({
            url: url,
            dataType: type,
            headers: {
                'Authorization' : SessionUtil.getToken()
            },
            data: param,
            type: "get",
            success: (result) => {
                if(result == null) {
                    UI.error('接口：' + url + "返回结果为空");
                    return;
                }
                if(result.code != null) {
                    _this.handleV2(url, opts, result, _call);
                } else {
                    _this.handleV1(url, opts, result, _call);
                }
            },
            error(xhr, status, error) {
                var statusCode = xhr.status;
                var statusText = xhr.statusText;
                var msg = statusCode + ' ' + statusText;
                console.error('request [' + url + '] status:' + msg);
                UI.warning('服务端响应：' + msg);
            }
        });

        // 简易请求
        // $.post(url, param, (result) => {
        //     if(result.code != null) {
        //         this.handleV2(url, opts, result, _call);
        //     } else {
        //         this.handleV1(url, opts, result, _call);
        //     }
        // }, type);
    },

    getImage: function(url, _call) {
		console.log('getImage', url);
        axios({
            method: 'get',
            url: url,
            responseType: 'blob',
            headers: {
                'Authorization' : SessionUtil.getToken()
            },
        }).then((result) => {
			_call( URL.createObjectURL(result.data) );
        })

    },
	
	download: function(url, param, _success, _failure) {
		console.log('下载' + url + '资源');
		axios({
		    method: "POST",
		    url: url,
		    data: qs.stringify(param),
			headers: {
			    'Authorization' : SessionUtil.getToken()
			},
		    responseType: 'blob' //返回是个文件
		}).then(response => {
			console.log('response', response);
		    this.downloadFile(response, () => {
				console.log('下载完成');
				_success();
			}) //then直接下载，方法在下边
		}).catch((error, _t) => {
			
			// 获取失败响应
			if(error.response.status != 200){				
				error.response.data.text().then(text => {
					let obj = JSON.parse(text);
					let errorMsg = obj.msg;
					
					if(errorMsg != null) {
						UI.error('下载失败，原因：' + errorMsg);
					} else {
						UI.error('下载失败');
					}
				})
			} else {
				console.log(error);
				UI.error('下载失败');
			}
			_failure();					
		});
	},
	
	// 下载文件
	downloadFile: function(res, _call) {
		let blob = new Blob([res.data], { type: "application/vnd.ms-excel" });//type是文件类，详情可以参阅blob文件类型
		// 创建新的URL并指向File对象或者Blob对象的地址
		const blobURL = window.URL.createObjectURL(blob)
		// 创建a标签，用于跳转至下载链接
		const tempLink = document.createElement('a')
		tempLink.style.display = 'none'
		tempLink.href = blobURL
		let filename = decodeURI(res.headers['content-disposition'].split('=')[1]);
		tempLink.setAttribute('download', filename);
		// 兼容：某些浏览器不支持HTML5的download属性
		if (typeof tempLink.download === 'undefined') {
			tempLink.setAttribute('target', '_blank')
		}
		// 挂载a标签
		document.body.appendChild(tempLink)
		tempLink.click()
		document.body.removeChild(tempLink)
		// 释放blob URL地址
		window.URL.revokeObjectURL(blobURL)
		_call();
	},
    inArray: function(arr, data) {
        for(var i in arr) {
            if(arr[i] == data) {
                return true;
            }
        }
        return false;
    },
    getService: function(page, config) {
        if(page == null) {
            console.error("页面 page 不能为空");
            return;
        }
        // initPage(page);
        return getService(page, config);
    },
    checkResult: function(result) {
        if(result == null) {
            UI.warning( "系统异常：result is null" );
            return false;
        }
        if(result.status == "failure") {
            // vue.$message({
            //     message: result.msg,
            //     type: 'error'
            // });
            UI.warning( result.msg );
            return false;
        }
        return true;
    },
    getRoutePath: function() {
        // location.href;
    },
    getDom: function(select) {
        if(select.indexOf('#') != -1) {
            var id = select.substring(1);
            return document.getElementById(id);
        } else {
            console.error("暂时只支持 byId");
        }
    },
    /**
     * 等待组件渲染完成
     * 不推荐使用，但是某些场景下使用可以降低复杂度
     */
    waitRef: function(refs, name, _call, _error, _key) {
        var i = 0;
        var time = 1000; // 1000毫秒
        var checkTime = 10; // 检查频率
        var checkSize = time / checkTime;
        var timer = setInterval(() => {
            i ++;
            if(i > checkSize) {
                console.error('waitRef 超过' + time + '毫秒' + name);
                UI.warning('waitRef 超过' + time + '毫秒' + name);
                clearInterval(timer);
                
                if(_error != null) { _error(); }
                
                return;
            }
            var ref = refs[name];
            if(ref != null) {
                try {
                    _call(ref);
                } catch (e) {
                    console.error(e);
                }
                clearInterval(timer);
            }
        }, 10);
    },
    waitDomById: function(id, _call, ms, _error) {
        this.waitDom('#' + id, _call, ms, _error);
    },
    waitDom: function(select, _call, ms, _error) {
        var i = 0;
        if(ms == null) {
            ms = 1000;
        }
        if(_error == null) { _error = () => {}; }
        var timer = setInterval(() => {
            i ++;
            if(i == ms / 10) {
                _error();
                console.error('waitDom 超过' + ms + '毫秒 select:[' + select + ']');
                clearInterval(timer);
                return;
            }
            var dom = $(select)[0];
            if(dom != null) {
                try {
                    _call(dom, $(select)); 
                } catch (e) {
                    console.error(e);
                }
                clearInterval(timer);
            }
        }, 10);
    },
    waitArray: function(obj, name, _call) {
        var i = 0;
        var timer = setInterval(() => {
            i ++;
            if(i == 100) {
                console.error('waitArray 超过10秒');
                clearInterval(timer);
                return;
            }
            if(obj[name].length > 0) {
                // console.log('waitDom success');
                try {
                    _call(ref);
                } catch (e) {
                    console.error(e);
                }
                clearInterval(timer);
            }
        }, 100);
    },
    waitProducer: function(_call, _producer, ms) {
        var i = 0;
        ms = ms || 10000;
        var timer = setInterval(() => {
            i ++;
            if(i >= ms / 10) {
                console.error('waitProducer 超过' + ms + '毫秒');
                clearInterval(timer);
                return;
            }
            var product = _producer();
            // console.log('product', product);
            if(product != null) {
                // console.log('waitProducer success, use ' + (i * 10) + ' ms');
                try {
                    _call(product);
                } catch (e) {
                    console.error(e);
                }
                clearInterval(timer);
            }
        }, 10);
    },
    getBodyWidth: function() {
        return document.body.clientWidth;
    },
    getPageWidth: function() {
        var width = 65;
        if(App.asideWidth == null) {
            return this.getBodyWidth();
        }
        if(App.asideWidth.indexOf('px') != -1) {
            width = Number(App.asideWidth.replace('px', ''));
        }
        var bodyWith = this.getBodyWidth();
        return bodyWith -  width;
    },
    calcMaxWidth: function(width) {
        if(width.indexOf('%') != -1) {
            var rate = Number( width.replace('%', '') ) / 100;
            return document.body.clientWidth * rate + 'px'
        } else if(width.indexOf('px') != -1) {
            return width;
        } else {
            return width + 'px';
        }
    },
    getHeadHeight: function() {
        return 80;
    },
    getTagHeight: function() {
        return 40;
    },
    getClientHeight: function() {
        return document.body.clientHeight;
    },
    calcMaxHeightOld: function(height) {
        if(height.indexOf('%') != -1) {
            var rate = Number( height.replace('%', '') ) / 100;
            return document.body.clientHeight * rate + 'px'
        } else if(height.indexOf('px') != -1) {
            return height;
        } else {
            return height + 'px';
        }
    },
    calcMaxHeight: function(height, reduce) {
        if(height == '' || height == null) {
            if(reduce == null) { reduce = 180; }
            return (document.body.clientHeight - reduce) + 'px';
        } else if(height.indexOf('%') != -1) {
            if(reduce == null) { reduce = 0; }
            var rate = Number( height.replace('%', '') ) / 100;
            return (document.body.clientHeight * rate - reduce) + 'px'
        } else if(height.indexOf('px') != -1) {
            return height;
        } else {
            return height + 'px';
        }
    },
    get(key) {
        return localStorage.getItem(key);
    },
    getObj(key){
		let value = localStorage.getItem(key);
		if(value != null && value != '' && value != 'undefined') {
			return JSON.parse(value);
		} else {
			return value;
		}
    },
    put(key, value) {
        if(Util.isObject(value) || Util.isArray(value)){
           return  localStorage.setItem(key, JSON.stringify(value));
        }else{
            return localStorage.setItem(key,value)
        }
    },
    /**
     * 绑定
     * @param {*} page 
     * @param {*} key 
     * @param {*} value 默认值
     */
    bind(pageOrWatch, key, value) {
        var watch = null;
        var page = null;
        if(pageOrWatch.template != null) {
            page = pageOrWatch;
            watch = page.watch;
        } else {
            watch = pageOrWatch;
        }

        // 1. 构建监听函数
        var oldWatch;
        if(watch[key] != null) {
            oldWatch = watch[key];
        }
        

        if(Util.isBaseType(value)) {
            watch[key] = function(newValue, oldValue) {
                Core.put(key, newValue);
                if(oldWatch != null ) {
                    oldWatch(newValue, oldValue)
                }
            };
        } else {
            console.log('bind object ' + key);
            watch[key] = {
                handler(newValue, oldValue) {
                    var json = JSON.stringify(newValue);
                    Core.put(key, json);

                    if(oldWatch != null) {
                        oldWatch(newValue, oldValue)
                    }
                },
                immediate: true,
                deep: true
            }
        }

        // 2. 第一次取值解析
        if(Core.get(key) != null) {
            var localValue = Core.get(key);
            
            if(localValue.indexOf('{') != -1) {
                return JSON.parse(localValue);
            }
            
            return localValue;
        } else {
            return value;
        }
    },

    /**
     * 原生写法：
     * var delay = Core.delay(); // 开始计时
     * setTimeout(() => {
     *      _call();
     * }, delay.calc(300));
     * 
     * 封装写法：
     * var delay = Core.delay(); // 开始计时
     * delay.setTimeout(() => {
     *      _call();
     * }, 300);
     * @returns 
     */
    delay() {
        var startTime = new Date();
        return {
            calc(ms) {
                var endTime = new Date();
                var useMs = endTime.getTime() - startTime.getTime();
                var delayMs = ms - useMs;
                if(delayMs < 0) {
                    delayMs = 0;
                }
                return delayMs;
            },
            setTimeout(_call, ms) {
                var endTime = new Date();
                var useMs = endTime.getTime() - startTime.getTime();
                var delayMs = ms - useMs;
                if(delayMs < 0) {
                    delayMs = 0;
                }
                setTimeout(() => {
                    _call();
                }, delayMs);
            }
        }
    },

    run(_call) {
        if(_call == null) {
            console.error('_call is null');
        }
        if(!Util.isFunction(_call)) {
            console.error('_call is not function', _call);
        }
        _call();
    }
};

window.Core = Core;

export default Core