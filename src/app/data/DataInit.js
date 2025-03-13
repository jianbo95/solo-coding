import Api from '../Api.js';
import Core from '../util/Core.js';
import Counter from '../util/Counter.js';
import Dict from './Dict.js';
import Store from './Store.js';

// 数据初始化模块
var DataInit = {
    initStatus: false,
    data: {
        userMenu: null,
        userInfo: null
    },
	
	waitInitAll (_call) {
		var timer = setInterval(() => {
			if(this.initStatus == true) {
				_call();
				clearInterval(timer);
			}
		}, 100);
	},

    // 初始化所有方法
    initAll(_success, _failure) {
        if(this.initStatus) {
            _success();
        }

		
		var methodNames = [];
		for(var key in this.initMethods) {
			methodNames.push(key);
		}
		
        let methodSize = methodNames.length;
        console.log('初始化数据数量', methodSize);
        let counter = Counter.build(methodSize);
		
		var loopExecute = (methodNames) => {
			var name = methodNames.shift();
			var method = this.initMethods[name];
			
			method(() => {
				console.log('执行成功:' + name);
			    counter.call(); // 执行成功计数
				if(methodNames.length > 0) {
					loopExecute (methodNames);
				}
			}, () => {
			    _failure();
			});
		};
		
		loopExecute(methodNames);
		
		// 等待计数器校验完成
        counter.finish(() => {
			console.log('初始化所有数据完成');
            this.initStatus = true;
            _success();
        });
    },

    getUserData: function() {
        return this.data.userInfo.userData;
    },
    checkLogin: function(result) {
        if(result == false || result.status == "failure") {
            if(result.msg == '用户未登录') {
                // location.href = '../login.html';
            } 
        }
    },
    getUserMenu: function() {
        return this.data.userMenu;
    },

	getUserAuth: function() {
		return this.getUserData().authUrl;
	},
    getUrlMap: function() {
        var menu = this.data.userMenu;
        var map = {};
        for(var key in menu) {
            var parent = menu[key];
            var childs = parent.children;
            for(var key in childs) {
                var child = childs[key];
                map[child.url] = child.text;
            }
        }
        return map;
    },
    getMenuGroup: function() {
        var menu = this.data.userMenu;
        var menuGroup = [];
        for(var key in menu) {
            var parent = menu[key];
            var group = {
                label: parent.text,
                options: []
            };
            menuGroup.push(group);
            var childs = parent.children;
            for(var key in childs) {
                var child = childs[key];
                var op = {
                    value: child.url,
                    label: child.text
                };
                group.options.push(op);
            }
        }
        console.log('menuGroup', menuGroup);
        return menuGroup;
    },

	freshUserData () {
		console.log('刷新用户数据');
		this.initMethods.initUserData(() => {
			console.log('刷新用户数据成功');
		});
		this.initMethods.initMenuData(() => {
			console.log('刷新用户菜单成功');
		});
	},

    freshDict () {
        console.log('刷新字典数据');
        this.initMethods.initDictData(() => {
			console.log('刷新字典数据成功');
		});
    },
    // 初始化方法
    initMethods: {
        // 初始化用户数据
        initUserData: function(_success, _failure) {
            Api.postUserInfo((result) => {
                if(result.status == 'success') {
                    var userInfo = result.data;
                    DataInit.data.userInfo = userInfo;
					if(_success != null) {
						_success();
					}
                    console.log('初始化用户数据完成', userInfo);
                } else {
                    console.log('初始化用户数据失败');
					if(_failure != null) {
						_failure();
					}
                }
            });
        },
        // 初始化常量数据
        initDictData: function(_success) {
            var url = Constants.root + 'sysData/dict';
            Core.post(url, {}, (result) => {
                if(result.status == 'failure') {
                    console.log('初始化字典数据失败', result);
                    if(_failure != null) {
                    	_failure();
                    }
                } else {
                    // console.log('初始化字典数据', result);
                    let map = result.data;
                    for(let key in map) {
                        let info = map[key];
                        if(key == 'enum') {
                            for(let enumKey in info) {
                                Dict.set(enumKey, info[enumKey]);
                                console.log("初始化枚举字典：" + enumKey, info[enumKey]);
                            }
                        } else {
                            Dict.set(key, info);
                            console.log("初始化字典：" + key, info);
                        }
                    }
                    if(_success != null) {
                    	_success();
                    }
                    console.log('初始化字典数据完成');
                }
            });
        },
        // 初始化菜单数据
        initMenuData: function(_success, _failure) {
            // var url = Constants.root + 'authMenu/ctrlTree';
            var url = Constants.root + 'faas/lowcode/menu';
            Core.post(url, {}, (response) => {
                var result = response.data;
                if(response.status == 'failure') {
                    console.log('初始化菜单数据失败', result);
                    if(_failure != null) {
                    	_failure();
                    }
                } else {
                    DataInit.checkLogin(response);
                    DataInit.data.userMenu = result;
					Store.commit('setUserMenu', result);
                    console.log('初始化菜单数据', result);
                    if(_success != null) {
                    	_success();
                    }
                    console.log('初始化菜单数据完成');
                }
            });

        },
        // 初始化常量数据
    },
};

window.DataInit = DataInit;

export default DataInit;