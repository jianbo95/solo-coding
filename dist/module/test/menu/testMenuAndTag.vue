<template>
    <div style="height:calc(100% - 2rem); padding:1rem;">
        <cc-menu-and-tag :width="270" v-model="contents" :menu-list="menuList" 
            :menu-version="1"
            :theme="theme"
            :menus="menus"
            :active-menu="activeMenu"
            :query-son="querySon"
            :tag-id-type="tagIdType">
            
            <template slot="home">
                <div style="padding:1rem;">
                    <div style="font-size:1.5rem;">主页</div>
                    <div><br></div>
                    <div>
                        欢迎使用ssh
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
                        <el-button size="small" type="primary" @click="autoOpen(['个人', '虚拟机', 'jianbo95@vos', '测试1'])">自动打开1</el-button>
                        <el-button size="small" type="primary" @click="autoOpen(['个人', '虚拟机', 'root@openwrt', '测试2'])">自动打开2</el-button>
                    </div>
                </div>
            </template>

            <template>

                <template v-for='(menu) in contents'>
                    <template v-if='menu.title != "主页"'>
                        <div v-show='menu.active' style="padding:1rem;height:calc(100% - 35px);">
                            <div style="background:#eee;width:100%; height:100%;">
                                <textarea :value="toJson(menu)" cols="60" rows="20"></textarea>
                            </div>
                        </div>
                    </template>
                </template>

            </template>

        </cc-menu-and-tag>
    </div>
</template>

<script>
import Tree from '@/app/util/Tree.js';
import TestMenu from '@/module/test/data/test-menu2.js';
import TestMenuLazy from '@/module/test/js/testMenuLazy.js';

export default {
    
    data: function() {
        return {      
            loading: false,
            init: true,
            tagIdType: 'increment',
            menuList: TestMenu.menu ,
            activeMenu: [],
            contents: [],
            theme: 'white',
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
            menus: []
        }
    },
    created() {
        // 绑定数据肯定没有问题！
        this.menus = TestMenuLazy.load(TestMenu);
    },
    methods: {
        toJson(obj) {
            return Json.toString(obj);
        },
        querySon(node, parents, _call) {
            let dataId = node.id;
            // console.log('query son', dataId, node);
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