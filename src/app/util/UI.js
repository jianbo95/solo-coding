/**
 * UI 对象
 */

var vue;
var loading;
var loadingCount = 0; // 同时加载数量

var UI = {
    initVue: function(vueApp) {
        if(vue == null) {
            vue = vueApp;
            console.log('初始化 vue 完成');
        }
    },
    getVue: function() {
        return vue;
    },
    message: function(msg, type) {
        type = type || 'success';
        vue.$message({
            message: msg,
            type: type,
            duration: 2500,
            showClose: true
        });
    },
    success: function(msg) {
        if(msg == null || msg == '') {
            msg = '操作成功';
        }
        this.message(msg);
    },
    warning: function(msg) {
        this.message(msg, 'warning');
    },
    showResult: function(obj) {
        console.log('showResult');
        let msg;

        // 数据可视化
        if(Util.isString(obj)) {
            msg = obj;
        } else {
            msg = JSON.stringify(obj);
        }

        // 文本格式化
        let formatMsg;
        try {
            formatMsg = Util.formatXmlOrJson(msg);
        } catch (e) {
            formatMsg = msg;
        }

        Store.commit('setResultMsg', msg);
        Store.commit('showResult');
    },
    error: function(msg) {
        // this.message(msg, 'error');
		vue.$confirm(msg, '提示', {
		    showCancelButton: false,
		    confirmButtonText: '关 闭',
		    type: 'warning'
		}).then(() => {
		    
		});
    },
    debug: function(obj, title) {
        let msg;
        if(title == null) {
            title = '';
        }

        // 数据可视化
        if(Util.isString(obj)) {
            msg = obj;
        } else {
            msg = JSON.stringify(obj);
        }

        // 文本格式化
        let formatMsg;
        try {
            formatMsg = Util.formatXmlOrJson(msg);
        } catch (e) {
            formatMsg = msg;
        }

        Store.commit('setDebugMsg', title + formatMsg);
        Store.commit('showDebug');
    },
    deleteConfirm: function(_confirm) {
        vue.$confirm('此操作将永久删除该项, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            _confirm();
        });
    },
    confirm(msg,_confirm,_cancel){
        this.confirmDialog(msg,_confirm,_cancel);    
    },
    confirmDialog(msg,_confirm,_cancel){
        vue.$confirm(msg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            _confirm()
          }).catch(() => {
              if(_cancel!=null){
                _cancel()
              }         
          });
    },
    alert: function(msg,_call) {
        vue.$confirm(msg, '提示', {
            showCancelButton: false,
            confirmButtonText: '关 闭',
            type: 'success'
        }).then(() => {
            if(_call != null){
                _call()
            }
        });
    },
    warningDialog: function(msg) {
        vue.$confirm(msg, '提示', {
            showCancelButton: false,
            confirmButtonText: '关 闭',
            type: 'warning'
        }).then(() => {
            
        });
    },
    closeLoading: function() {
        loadingCount --;
        if(loadingCount == 0) {
            setTimeout(function() {
                loading.close();	
            }, 100);
        }
    },
    openLoading: function(text) {
        text = text || "正在执行...";
        if(loadingCount != 0) {
            $(".el-loading-text").html(text);
        }
        loadingCount ++;
        loading = vue.$loading({
            lock: true,
            text: text,
            // spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.01)'
        });
    },
    // FIXME 缓存未生效
    postc: function(url, param, _call, isDebug) {
        this.post(url, param, _call, isDebug, true);
    },
    // 加密请求
    postEncrypt: function(url, param, _call, isDebug) {
        this.post(url, param, _call, isDebug, true);
    },
    // 带转圈的请求
    post: function(url, param, _call, isDebug, isEncrypt) {
        isDebug = false;
        if(param == null) {
            param = {};
        }
        var text = param.opts_text;
        if(text == null) {
            text = '正在加载中...'
        }
        var opts = {
            check: param.opts_check
        };
        delete param.opts_text;
        delete param.opts_check;
        UI.openLoading(text);

        // var post = $.post;
        // if(isCache) {
        //     // console.log("带缓存的请求");
        //     post = $.postc;
        // }
        
        if(isEncrypt == true) {
            Core.postEncrypt(url, param, function(result) {
                if(isDebug) {
                    console.log("[ Request Start ]");
                    console.log("url", url);
                    console.log("param", JSON.stringify(param) );
                    console.log("result", result);
                    console.log("[ Request End ]");
                }
                
                _call(result);
                UI.closeLoading();
            }, 'json', opts);
            
        } else {
            Core.post(url, param, function(result) {
                if(isDebug) {
                    console.log("[ Request Start ]");
                    console.log("url", url);
                    console.log("param", JSON.stringify(param) );
                    console.log("result", result);
                    console.log("[ Request End ]");
                }
                
                _call(result);
                UI.closeLoading();
            }, 'json', opts);
        }

        
    }
};

window.UI = UI;

export default UI;
