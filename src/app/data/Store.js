import { Vuex } from '../NodeModule.js'

var Store = new Vuex.Store({
	state: {
		count: 0,
		username: '待获取',
		login: false,
		tagName: '',
		pageWidth: 0,
		userInfo: null,
		authUrl: null,
		userMenu: null,
		loading: false,
		showDebug: false,
		debugMsg: '',
		showResult: false,
		resultMsg: '',

		// 事件计数
		eventClickIcon: 0
	},
	getters: {
		username: function (state) {
			return state.username;
		},
		pageWidth: function (state) {
			return state.pageWidth;
		},
		loading: function (state) {
			return state.loading;
		},
		userInfo: function(state) {
			return state.userInfo;
		},
		authUrl: function(state) {
			return state.authUrl;
		},
		userMenu: function(state) {
			return state.userMenu;
		},
		showDebug: function (state) {
			return state.showDebug;
		},
		debugMsg: function (state) {
			return state.debugMsg;
		}
	},
	mutations: {
		openLoading: function(state) {
			state.loading = true;
		},
		closeLoading: function(state) {
			state.loading = false;
		},
		setPageWidth: function(state, value) {
			state.pageWidth = value;
		},
		setUsername: function (state, value) {
			state.username = value;
		},
		setLogin: function(state, value) {
			state.login = value;
		},
		setTagName: function (state, value) {
			state.tagName = value;
		},
		eventClickIcon: function (state) {
			state.eventClickIcon ++;
		},
		setUserInfo: function (state, userInfo) {
			state.userInfo = userInfo;
		},
		setAuthUrl: function (state, authUrl) {
			state.authUrl = authUrl;
		},
		setUserMenu: function (state, userMenu) {
			state.userMenu= userMenu;
		},
		increment: function (state) {
			state.count++
		},
		showDebug: function(state) {
			state.showDebug = true;
		},
		closeDebug: function(state) {
			state.showDebug = false;
		},
		setDebugMsg: function(state, value) {
			state.debugMsg = value;
		},
		setResultMsg: function(state, value) {
			state.resultMsg = value;
		},
		showResult: function(state) {
			state.showResult = true;
		},
		closeResult: function(state) {
			state.showResult = false;
		}
	}
});
// Vue.use(Vuex);
console.log('[Vue init] init vuex success.');
// console.log(Store.state);
    

window.addEventListener("resize", () => {
	Store.commit('setPageWidth', Core.getPageWidth());
});

window.Store = Store;
    
export default Store;