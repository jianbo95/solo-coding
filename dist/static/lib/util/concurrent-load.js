/**
  * ConcurrentLoad
  * Jianbo
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ConcurrentLoad = factory());
}(this, (function () { 'use strict';

var ConcurrentLoad = {
    callMap: {},
    load: function(_run) {
        var _this = this;
        var _concurrentRun = function(url, _call) {
        
            var _callKey = _call;
            if(_call.key != null) {
                _callKey = _call.key;
            }

            if(_this.callMap[_callKey] == null) {
                _this.callMap[_callKey] = {};
                // console.log('绑定一次到call');
            } else {
                // console.log('已绑定一次到call');
            }
            var bind = _this.callMap[_callKey];
            var bindData = null;

            if(bind[url] == null) {
                bindData = {
                    id: new Date().getTime()
                };
                bind[url] = bindData;
                // console.log('绑定一次到url', bindData);
            } else {
                // console.log('已绑定一次到url');
                bindData = bind[url];
            }

            if(bindData.loading == true) {
                // console.log('资源已经发起过加载', bindData);
                // 已经执行过一次了
                if(bindData.data != null) {
                    // 已经执行完成
                    // console.log('重复请求，资源' + url + '已加载完成');
                    _call(bindData.data);
                } else {
                    if(bindData.dataIsNull == true) {
                        // console.log('资源已经发起过加载，但是回调对象为null');
                        _call();
                    } else {
                        // console.log('资源已经发起过加载，但是未加载完成');
                        // 执行未完成
                        if(bindData.call == null) {
                            bindData.call = [];
                        }
                        // 注册回调
                        bindData.call.push(_call);
                    }
                }
                return;
            }

            // 顺序执行，标记为执行中
            bindData.loading = true; 

            // 异步执行，记录结果
            _run(url, function(data) {
                // console.log('实际执行：' + url);

                // 记录执行结果
                bindData.data = data;
                if(data == null) {
                    bindData.dataIsNull = true;
                }

                // console.log('实际执行结果：', bindData);

                // 回调kl
                _call(data);

                // 存在重复请求则回调
                if(bindData.call != null) {
                    for(var i in bindData.call) {
                        var call = bindData.call[i];
                        // console.log('重复请求，资源' + url + '已加载完成');
                        call(data);
                    }
                }
            });
        };
        return _concurrentRun;
    }
};

return ConcurrentLoad;

})));