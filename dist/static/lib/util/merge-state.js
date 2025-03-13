/**
  * MergeState
  * Jianbo
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MergeState = factory());
}(this, (function () { 'use strict';

var MergeState = {
    build(options) {
        var instance = {
            lastState: [],
            state: [],
            lastEmitTime: 0,
            runTimer: false,
            listenCall: null,
            timer: null,
            stopTimer() {
                // console.log('timer stoped.');
                clearInterval(this.timer);
                this.timer = null;
                this.runTimer = false;
            },
            startTimer() {
                if(this.runTimer == true) {
                    return;
                }
                // console.log('timer start.');
                this.runTimer = true;
                var valid = options.valid;
                this.timer = setInterval(() => {
                    // console.log('timer running.');
                    var time = new Date().getTime();
                    if(time - this.lastEmitTime > valid) {
                        
                        if(this.state !== this.lastState) {
                            this.listenCall(this.state); // 上传状态
                            this.lastState = this.state; // 记录状态已上传
                        }

                    }

                    if(time - this.lastEmitTime > valid * 3) {
                        this.stopTimer();
                    }

                }, valid);
            },
            clone(obj) {
                return JSON.parse(JSON.stringify(obj));
            },
            emit(state) {
                // console.log('emit', msg);
                if(this.runTimer == false) {
                    this.startTimer();
                }

                // 状态变更
                this.lastState = this.state;
                this.lastEmitTime = new Date().getTime();
                this.state = state;
            },

            listenState(_call) {
                this.listenCall = _call;
            }
        };

        return instance;
    }
};

return MergeState;

})));