<template>
    <div style="height:calc(100% - 2rem); padding:0rem;" v-if="init">
        <cc-menu-and-tag 
            :width="270" 
            :left-width="leftWidth"
            v-model="contents" 
            :menu-list="menuList" 
            :menu-version="1"
            :theme="theme"
            :menus="menus"
            :active-menu="activeMenu"
            :query-son="querySon"
            :listen-open="listenOpen"
            :tag-id-type="tagIdType"
            :menu-padding-top="menuPaddingTop"
            @update:collapse="updateCollapse"
            @open-menu="openMenu"
            @tag-change="tagChange">
            
            <template slot="home" v-if="initMain">
                <slot></slot>
                <div style="padding:1rem;" v-if="showDebug">
                    <div style="font-size:1.5rem;">主页</div>
                    <div><br></div>
                    <div>
                        欢迎使用文档
                    </div>
                    <div style="margin-top:1rem;">
                        <cc-input-box-fix title="标签ID类型：">
                            <cc-select-single v-model="tagIdType" size="middle" :map="fieldMap.tagIdType"></cc-select-single>
                        </cc-input-box-fix>
                    </div>
                    <div style="margin-top:1rem;">
                        <cc-input-box-fix title="主题：">
                            <cc-select-single v-model="theme" size="middle" :map="fieldMap.theme"></cc-select-single>
                        </cc-input-box-fix>
                    </div>
                    <div style="margin-top:1rem;">
                        <el-button size="small" type="primary" @click="autoOpen(['组件文档', '输入组件'])">自动打开1</el-button>
                        <el-button size="small" type="primary" @click="autoOpen(['个人', '虚拟机', 'root@openwrt', '测试2'])">自动打开2</el-button>
                    </div>
                </div>
            </template>

            <template slot="left">
                <slot name="left"></slot>
            </template>

            <template v-if="initMain">

                <template v-for='(menu, i) in contents'>
                    <template v-if='menu.title != "主页" && showDebug'>
                        <div v-show='menu.active' style="padding:1rem;height:calc(100% - 35px);" :key="i">
                            <div style="background:#eee;width:100%; height:100%;">
                                <textarea :value="toJson(menu)" cols="60" rows="20"></textarea>
                            </div>
                        </div>
                    </template>
                </template>

                <keep-alive>
                    <router-view />
                </keep-alive>

            </template>

        </cc-menu-and-tag>

        <!-- 结果弹框 -->
        <cc-dialog width="500px;" min-height="500px" title="结果" v-if="showResult" :visible="showResult" @on-close="onCloseResult" showClose>
            <div style="padding:0 1rem;">
                <el-input autosize v-model="resultMsg" type="textarea"></el-input>
            </div>
        </cc-dialog>
    </div>
</template>

<script>
import Tree from '@/app/util/Tree.js';
import TestMenu from '@/module/test/data/test-menu2.js';
import TestMenuLazy from '@/module/test/js/testMenuLazy.js';
import ApiPath from '../../app/data/ApiPath.js';
import TreeWrap from '@/app/util/TreeWrap.js';

export default {
    
    data: function() {
        return {      
            loading: false,
            init: false,
            initMain: false,
            tagIdType: 'unique',
            menuList: TestMenu.menu ,
            activeMenu: [],
            contents: [],
            theme: 'black',
            fieldMap: {
                tagIdType: {
                    'increment': '自增标签',
                    'unique': '唯一标签'
                },
                theme: {
                    'white': '白色', 
                    'black': '黑色'
                }
            },
            menus: [],
            menuWrap: null
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
    },
    created() {
        // 绑定数据肯定没有问题！
        this.loadMenu();
        // this.menus = TestMenuLazy.load(TestMenu);
        // console.log('app-menu.vue', this.menuUrl);
    },
    props: {
        leftWidth: {
            type: String,
            default: '0px'
        },
        menuUrl: {
            type: String
        },
        menuData: {
            type: Array
        },
        menuPaddingTop: {
            type: Number,
            default: 0
        },
        homeUrl: {
            type: String,
            default: '/'
        }
    },
    methods: {
        loadMenuData(_call) {
            if(this.menuData != null) {
                _call({data:this.menuData});
                return;
            }
            if(window.loadMenuData != null) {
                window.loadMenuData((result) => {
                    _call(result);
                });
            } else {
                var url = Constants.root + ApiPath.docMenuData;
                // console.log('loadMenu by app-menu.vue', url);
                Core.post(url, {}, (result) => {
                    _call(result);
                });
            }
        },
        openMenu() {},
        onCloseResult() {
            Store.commit('closeResult');
        },
        updateCollapse(value) {
            this.$emit('update:collapse', value);
        },
        tagChange(menu) {
            console.log('openMenu', menu);
            // console.log('router.push', Util.currentHash());
            var url = menu.url;
            if(menu.type == 'menu') {
                return;
            }
            if(menu.title == '主页') {
                console.log('this.homeUrl', this.homeUrl);
                this.$router.push({
                    path: this.homeUrl,
                    query: Util.currentHash()
                });
                return;
            }
            var module = url.split("/")[0];

            var path = '/' + module;
            if(this.$route.path != path) {
                this.$router.push({
                    path: path,
                    query: Util.currentHash()
                });
            }
        },
        listenOpen() {
            this.initMain = true;
        },
        loadMenu() {
            this.loadMenuData((result) => {
                var menus = result.data;
                // var list = Tree.parse(menus);
                var treeWrap = new TreeWrap(menus);
                treeWrap.loop((item) => {
                    item.title = item.text;
                    if(item.children == null) {
                        item.type = 'item';
                    } else {
                        item.type = 'menu';
                    }
                });
                this.menuWrap = treeWrap;
                this.menus = treeWrap.tree;
                this.init = true;
                this.activeTagByHref(() => {
                    // setTimeout(() => {
                    //     this.initMain = true;
                    // }, 200);
                });
            });
        },
        activeTagByHref(_call) {
            var info = Util.urlParse(location.href);
            var path = info.hashPath.split("#/")[1];
            // console.log('activeTagByHref', path, info);
            var target = null;
            this.menuWrap.loop((item) => {

                var menuUrl = item.url;
                if(menuUrl != null) {
                    if(menuUrl.indexOf('/go') != -1) {
                        menuUrl = menuUrl.substring(0, menuUrl.length - 3);
                    }
                    if(menuUrl == path) {
                        target = item;
                    }
                }
            });

            if(target != null) {
                var parents = this.menuWrap.findParent(target, [], 'app-menu.vue');
                Logger.info('target', parents);
                var activeMenu = [];
                for(var i in parents) {
                    var node = parents[i];
                    activeMenu.push(node.title);
                }
                activeMenu.push(target.title);
                this.activeMenu = activeMenu;
                _call();
            } else {
                _call();
            }
        },
        toJson(obj) {
            return Json.toString(obj);
        },
        querySon(node, parents, _call) {
            let dataId = node.id;
            // 返回子节点数据为最简化开发
            _call(TestMenuLazy.loadSon(dataId));
        },
        autoOpen(title) {
            // var title = ['个人', '虚拟机', 'root@openwrt', '测试2'];
            this.activeMenu = title;
        }
    }
}
</script>