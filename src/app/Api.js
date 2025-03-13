import UI from './util/UI.js';
import Store from './data/Store.js';
import Dict from './data/Dict.js';
import SessionUtil from './util/SessionUtil.js';
import watermark from './util/watermark.js';
import Core from './util/Core.js';

/**
 * 通用API接口
 */
var Api = {
    // post: function (path, param, _call, type) {
    //   $.post(PATH(path), param, function(result) {
    //     _call(result);
    //   }, type).error(function(result) {
    //     console.log('error', result);
    //     var data = result.responseJSON;
    //     if(result.status == 404) {
    //       alert("不存在该接口：" + data.path); 
    //       return;
    //     }
    //     _call(false);
    //   });
    // },

    /**
     * 登录请求
     * var param = {
	 *	  cname: '',
	 *    cpwd: ''
	 * };
     * @param {Object}   param 
     * @param {Function} _call 
     */
    postLogin(param, _call) {
        if(window.UserType == 'auction') {
            param.userType = 'auction';
        }

        UI.openLoading();
        Core.postEncrypt(Constants.root + "authUser/login", param, (result) => {
            UI.closeLoading();
            
            if (result.status == 'success') {
                // 保存token
                SessionUtil.setUser(result.data);
                Store.commit('setLogin', true);
                _call();
            }
        }, "json");
    },

    /**
     * 获取用户信息
     * @param {Function} _call
     */
    postUserInfo: function(_call) {
        // console.log('query user info');
        var url = Constants.root + "authUser/userInfo"; 
        Core.post(url, {}, (result) => {
            if(result.msg == '请登录后再操作') {
                _call(result);
                Store.commit('setLogin', false);
            } else {
                var userInfo = result.data;
				var userData = userInfo.userData;
                
                // var sysData = userInfo.sysData;
                watermark.createWM(
                    userInfo.name, // 传用户名
                    // 'mobile'
                );

                Store.commit('setUsername', userInfo.name);
                Core.put('opinions', userData.opinions)
                Store.commit('setLogin', true);
				Store.commit('setUserInfo', userInfo);
				Store.commit('setAuthUrl', userData.authUrl);
                _call(result);
            }
        }, 'json', false);
    },

    serverLog(log) {
        var url = Constants.root + 'sysLog/print';
        var param = {
            log: log
        };
        Core.post(url, param, (result) => {
            console.log(result);
        });
    },

    postCacheUpdate: function(name, _call) {
        console.log('缓存未更新，功能暂未实现');
        return;
        var url = Constants.root + 'cache/updateCache';
        var map = Dict.get('cacheType');
        var desc = map[name];
        console.log('更新' + desc + '缓存');
        var param = {
            name: name
        };
        Core.post(url, param, (result) => {
            console.log('result', result);
            // 执行成功
			if(_call != null) {
				_call(result);
			}
        });
    }

};

export default Api;