/**
  * ConcurrentCounter
  * Jianbo
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ConcurrentCounter = factory());
}(this, (function () { 'use strict';

var ConcurrentCounter = {
    auto: function (title, openLog) {
        return this.build(0, title, 'auto', openLog);
    },
    build: function (size, title, mode, openLog) {
        
        if(size == null) {
            console.error('size 不能为空');
            return;
        }
        if(title == null) {
            title = '';
        }
        if(openLog == null) {
            openLog = false;
        }
        var id = new Date().getTime() + Math.random();
        if(openLog == true) {
            console.log('' + title + ' Counter 构建 id=' + id);
        }
        var counter = { 
            id: id,
            title: title,
            mode: mode,
            size: size,
            executeSize: 0,
            openLog: openLog,
            showLog: function() {
                this.openLog = true;
            },
            logCall: function(info) {
                if(this.openLog == false) {
                    return;
                }
                if(info != null) {
                    if(this.title != null) {
                        console.log(this.title + ' ' + info + ' 执行完成 id=' + this.id);
                    } else {
                        console.log(info + ' 执行完成' + this.id);
                    }
                }
            },
            logFinish: function() {
                if(this.openLog == false) {
                    return;
                }
                console.log(this.title + '执行完成');
            },
            // 执行一个call
            call: function (subTitle) {
                counter.logCall(subTitle);
                counter.executeSize ++;
                if(counter.executeSize == counter.size) {
                    if(counter.finishCall != null) {
                        counter.logFinish();
                        counter.finishCall();
                    }
                }
            },
            wrap: function(call, title) {
                // console.log('wrap', title);
                this.size ++;
                var _this = this;
                return function(data) {
                    _this.call(title);
                    call(data);
                };
            },
            getCall: function(subTitle) {
                return this.callAuto(subTitle);
            },
            // 返回一个call
            callAuto: function(subTitle) {
                if(this.mode != 'auto') {
                    console.error('必须是auto模式才允许调用');
                    return;
                }
                this.size ++;
                // console.log(this.title + ' build call ' + this.size + ' ' + subTitle + ' ' + this.id);
                var _this = this;
                return function () {
                    _this.call(subTitle);
                };
                // return this.call;
            },
            finishCall: null,
            finish: function(finishCall) {
                if(this.mode != 'auto') {
                    if(this.size == 0) {
                        finishCall();
                        return;
                    }
                }
                
                if(this.size == this.executeSize) {
                    // console.log(this.title + 'finishCall ' + this.size + '->' + this.executeSize + ' id = ' + this.id);
                    finishCall();
                    return;
                }

                counter.finishCall = finishCall;
            }
        };
        return counter;
    }
};

return ConcurrentCounter;

})));