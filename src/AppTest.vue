<template>
    <div id="app-plus" style="height:100%;" v-if="showAll">
        
        <!-- 调试弹框 -->
        <cc-dialog width="500px;" title="调试" v-if="showDebug" :visible="showDebug" @on-close="onCloseDebug" showClose>
            <div style="padding:0 1rem;">
                <el-input autosize v-model="debugMsg" type="textarea"></el-input>
            </div>
        </cc-dialog>

        <!-- 结果弹框 -->
        <cc-dialog width="500px;" min-height="500px" title="结果" v-if="showResult" :visible="showResult" @on-close="onCloseResult" showClose>
            <!-- <div style="padding:0 1rem;">
                <el-input autosize v-model="resultMsg" type="textarea"></el-input>
            </div> -->
            <cc-packet-content v-model="resultMsg"></cc-packet-content>
        </cc-dialog>

        <router-view v-if="showLogin"></router-view>

        <div v-show="showMain" v-if="showMain && showApp" style="display:none; height: 100%; background-color: rgb(243, 243, 244);">
        
        <cc-menu-and-tag :width="230" ref="menuAndTag"
            :show-image-bg="true"
            :sync-menu="true"
            v-model="contents"
            :menus="menus"
            @open-menu="openMenu"
            @tag-change="tagChange"
            :collapse.sync="isCollapse"
            :tag-width="70"
            tag-id-type="unique"
            >
            <template slot="logo">
                <div style="margin:0px 0 15px 20px;" @click="clickTitle">
                    <h1 style="color:#fff;margin-left:1rem; margin-bottom: 1.5rem;">
                        {{title}}
                    </h1>
                </div>
            </template>
            <template slot="tag">
                <div>
                    <el-dropdown trigger="click">
                        <span class="tag-text">用户<i class='el-icon-caret-bottom tag-icon' style="font-size:13px;"></i></span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item style="font-weight:bolder;">{{getUserName()}}</el-dropdown-item>
                            <el-dropdown-item @click.native="updatePassword()">密码修改</el-dropdown-item>
                            <el-dropdown-item @click.native="logout()">安全退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </template>

            <template>

                <keep-alive exclude="app-page" v-if="init">
					<router-view></router-view>
				</keep-alive>

            </template>

        </cc-menu-and-tag>

        </div>

        
        <cc-dialog-edit title="用户快速登录" ref="loginDialog" :visible.sync="loginVisible" top="100px" width="400px" text-width="100px"
            :edit-field="loginField" v-model="loginForm" @on-confirm="onLoginConfirm">
			<template v-slot:content-header><div style="padding-bottom: 20px;">
					提示：您已经退出登录，请重新登录。
				</div>
			</template>
        </cc-dialog-edit>

        <cc-dialog-edit title="修改密码" ref="changePwdDialog" :visible.sync="changePwdVisible" top="100px" width="400px" text-width="100px"
            :auto-close="false"
            :edit-field="changePwdField" v-model="changePwdForm" @on-confirm="onChnagePwdConfirm">
        </cc-dialog-edit>

        <cc-dialog-edit v-if="initUserSetting" title="用户设置" :visible.sync="userSettingVisible" top="100px" width="400px" text-width="100px"
            :edit-field="userSettingField" v-model="userSettingForm" @on-confirm="onUserSettingConfirm">
        </cc-dialog-edit> 
    </div>
</template>

<script>
// import './assets/style/app-plus.less'; // java 模式不支持引入 less
import RouterManager from '@/app/config/router-manager.js';
import SessionUtil from '@/app/util/SessionUtil.js';
import Tree from '@/app/util/Tree.js';

export default {
	name: 'App',
	data () {
		return {
            contents: null,
            Conf: Conf,
            showApp: false,
            showAll: false,
            tagTitle: null,
            currentMenu: null,
            init: true,
            isCollapse: false,
            initPage: false,
            tags: [ '主页' ],
			defaultActive: null,
			state: Store.state,
            activeTag: '主页',
            showCloseTagMenu: false,
            loginVisible: false,
            loginForm: {},
            loginField: [
                { name: "用户名", field: 'username' },
                { name: "密码", field: 'password', showPassword: true },
            ],

            changePwdVisible: false,
            changePwdForm: {},
            changePwdField: [
                { name: "旧密码", field: 'oldPassword', showPassword: true },
                { name: "新密码", field: 'newPassword', showPassword: true },
                { name: "确认密码", field: 'password', showPassword: true },
            ],
			// menus: [],
			homeMenu: {},
            // userType: userInfo.userType,

            initUserSetting: false,
            userSettingVisible: false,
            userSettingForm: {},
            userSettingField: null
        }
	},
	watch: {
		'state.eventClickIcon': function() {
			let value = this.$store.state.tagName;
            this.fromIcon(value);
        },
        'state.login': function(value, old) {
            if(value) {
                // this.initPageData();
            }
        }
    },
    
	computed: {
        showDebug () {
            return Store.state.showDebug;
        },
        showResult() {
            return Store.state.showResult;
        },
        debugMsg () {
            return Store.state.debugMsg;
        },
        resultMsg () {
            return Store.state.resultMsg;
        },
        title () {
            if(this.isCollapse) {
                return '';
            }
            return this.Conf.title;
        },
		menus: function() {
			let menus = Store.state.userMenu;
            let menuList = this.parseMenuTree(menus);
            menus = Tree.convert(menuList);
            // console.log('menus', menus);
            return menus;
		},
        menuList: function() {
            let menus = Store.state.userMenu;
            let menusList = this.parseMenuTree(menus);
            return menusList;
        },
        loading: function() {
            return Store.state.loading;
        },
        isTestEnv: function() {
            var url = location.href;
            // 10.11.1 开头的是生产环境！！！ 其它的均视为测试环境
            if(url.indexOf('10.11.1') != -1) {
                return false;
            }
            return true;
        },
        // 全局更新
        username: function() {
            return this.$store.getters.username;
        },
        // TODO 支持是否独立显示
		isAloneView () {
			if(this.$route.path == '/login') {
				return true;
			}
			if(this.$route.path == '/api'
				|| this.$route.path == '/apiOrderAdd'
				|| this.$route.path == '/apiOrderHandle'
				|| this.$route.path == '/apiOrderCheck'
				|| this.$route.path == '/apiOrderCheckSecond'
				
				) {
				return this.init && this.state.login;
			} else {
				return false;
			}
		},
        showLogin: function() {
            if(this.isAloneView) {
                this.loginVisible = false;
                return true;
            } else {
                return false;
            }
        },
        showMain: function() {
            // 当前路由地址
            console.log('当前路由地址：', this.$route);
            if(this.isAloneView) {
                // 如果是登录页面
                return false;
            } else {
                return this.init && this.state.login;
            }
        },
    },
	created () {
        window.AppPlus = this;
        let path = location.pathname;
        if(path == '/' && window.devMode == 'open') {
            // 开发模式跳转到导航页面
            location.href = 'http://localhost:' + location.port + '/nav.html';
            return;
        }
        this.showAll = true;
		this.initPageData();
	},
	methods: {
        onCloseDebug() {
            Store.commit('closeDebug');
        },
        onCloseResult() {
            Store.commit('closeResult');
        },
        getUserName(){
            // let user = Core.getObj('user')
            let user = SessionUtil.getUser()
            if(Util.isBlank(user.username)){
                return user.userCode
            }else{
                return user.username
            }
        },
        openMenu(menu) {
            // console.log('openMenu', menu);
            var url = menu.url;
            if(menu.type == 'menu') {
                return;
            }
            var module = url.split("/")[0];

            var path = '/' + module;
            if(this.$route.path != path) {
                this.$router.push({
                    path: path
                });
            }
        },
        tagChange(menu) {
            this.currentMenu = menu;
            console.log('tag change', menu);
            if(menu.title == '主页') {
                this.$router.push({
                    path: '/'
                });
            } else {
                this.openMenu(menu);
            }
        },
        onCollapse(value) {
            this.isCollapse = value;
        },
        fromIcon: function(name) {
            let ref = this.$refs['menuAndTag'];
            console.log('ref', ref);
            this.$refs['menuAndTag'].showTagById(name);
        },
        parseMenuTree(menus) {
            let menusList = Tree.parse(menus);
            for(let i in menusList) {
                let menu = menusList[i];
                menu.title = menu.text;
                if(menu.level == 0) {
                    menu.type = 'menu';
                } else {
                    menu.type = 'item';
                }
                menu.state = 'close';
            }
            // console.log('parseMenuTree', menusList);
            return menusList;
        },
        initPageData() {
            this.initData(() => {

                this.initHomeMenu();

                // this.initMenuData();

                // 根据当前地址判断已打开的页面
                this.initFromHref();

                Store.commit('setPageWidth', Core.getPageWidth());

                this.initUserSettingFeild();
                this.showApp = true;
            });
        },
		initData(_succ) {
			DataInit.initAll(() => {
                console.log('初始化数据完成');
				this.userInfo = DataInit.data.userInfo;
				this.userData = this.userInfo.userData;
				_succ();
            }, () => {
                console.log('初始化失败');
                if(this.$route.path != '/login') {
                    this.$router.push('/login');
                }
            });
          
		},
        initHomeMenu: function() {
			var module = this.getHomeMoudle();
			var homeMenu = this.searchByModule(module);
			if(homeMenu != null) {
				if(homeMenu.text != '图标页面') {
					var tagTitle = homeMenu.text;
				}
			} else {
				homeMenu = {
					url : "icon/go"
				}
			}
			// 添加主页模块路由
			RouterManager.add('/', module); 
		},
        getHomeMoudle : function() {
			var home = this.userData.home;
			if(home == null || home == '') {
				home = 'icon/go';
			}
			var module = home.split("/")[0];
			return module;
		},
        searchByModule : function(m) {
			var menus = DataInit.getUserMenu();
			for(var i in menus) {
				var menu = menus[i];
				var child = menu.children;
				for(var j in child) {
					var subMenu = child[j];
					var url = subMenu.url;
					var module = url.split("/")[0];
					if(module == m) {
						return subMenu;
					}
				}
			}
		},

        initFromHref: function() {
            // 获取当前选择项
            var module = this.getModuleByHref();
            var menu = this.searchByModule(module);
            // console.log('module = ' + module + ' menu = ', menu);
            if(menu == null && menu == 'testEchart') {
                menu = {
                    id: 999,
                    state: "open",
                    text: module,
                    url: module + "/go"
                };
            }

            // 从当前url激活tag，需等待组件渲染完成
            Core.waitRef(this.$refs, 'menuAndTag', (ref) => {
                Core.waitRef(ref.$refs, 'tag', () => {
                    if(menu != null) {
                        ref.showTagById(menu.id);
                    }
                });
            });
		},
        getModuleByHref: function() {
            var href = location.href;
            href = href.split("#/")[1];
            href = href.split("?")[0];
            return href;
        },
        initUserSettingFeild() {
            this.userSettingField = [ // 动态获取
                { name: '默认主页', field: 'home', map: DataInit.getMenuGroup(), type: 'selectOne' },
            ];
            this.initUserSetting = true;
        },
        logout: function () {
            SessionUtil.setUser();
            this.$router.push('/login');
        },
        updatePassword: function() {
            this.changePwdVisible = true;
        },
        onLoginConfirm: function() {
            var param = {
				cname: this.loginForm.username,
				cpwd: this.loginForm.password
			};
			
			UI.postEncrypt("user/login", param, (result) => {
				if (result.status == 'success') {
                    UI.success("登录成功");
                    // location.reload();
				} 
			}, "json");
        },
        onChnagePwdConfirm: function() {
            UI.postEncrypt("authUser/changePassword", this.changePwdForm, (result) => {
                if (result.status == 'success') {
                    this.changePwdVisible = false;
                    UI.success("修改成功");
                    setTimeout(() => {
                        this.logout();
                    }, 1000);
                }
            });
        },
        onUserSettingConfirm () {},
        clickTitle () {
            
        }
	}
 
}
</script>

