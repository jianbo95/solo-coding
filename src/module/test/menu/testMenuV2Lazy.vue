<template>
    <div style="height:100%;" v-if="init">
        <el-container style="height: 100%; overflow: hidden; position: relative;">
            <el-aside class="aside" width="350" style="background:#545c64; border:1px solid #ddd;">
                <cc-menu-pure-v2 v-model="menus" backgroud="#545c64"
                    :active-menu="activeMenu"
                    :is-collapse="isCollapse"
                    :query-son="querySon" @input="inputMenu"
                >
                </cc-menu-pure-v2>
            </el-aside>
            <el-main>

                <div>懒加载实现</div>

                <el-tabs v-model="activeName">
                    <el-tab-pane label="控制" name="ctrl">
                        <el-button @click="reload">重新加载</el-button>
                        <el-button @click="auto">自动加载</el-button>
                        <el-button @click="collapse">缩小</el-button>
                    </el-tab-pane>
                    <el-tab-pane label="菜单数据" name="first">
                        <textarea name="" id="" style="width: 100%; height: 800px;"
                            v-model="menusValue" @input="inputStr"
                        ></textarea>
                    </el-tab-pane>
                    <el-tab-pane label="原始数据" name="second">
                        <textarea name="" id="" style="width: 100%; height: 800px;"
                            :value="menusOriginalValue"
                        ></textarea>
                    </el-tab-pane>
                </el-tabs>
            </el-main>
        </el-container>
    </div>
</template>

<script>
import Tree from '@/app/util/Tree.js';
import TestMenu from '@/module/test/data/test-menu2.js';
import TestMenuLazy from '@/module/test/js/testMenuLazy.js';

export default {
    
    data: function() {
        return {     
            isCollapse: false,
            init: false,
            activeMenu: [],
            activeName: 'ctrl',
            menus: [],
            menusValue: ''
        }
    },
    computed: {
        menusOriginalValue() {
            return JSON.stringify(TestMenu.menu, true, 2);
        }
    },
    watch: {
    },
    created() {
        // 绑定数据肯定没有问题！
        this.menus = TestMenuLazy.load(TestMenu);
        this.init = true;
    },
    methods: {
        auto() {
            this.activeMenu = ['个人', '虚拟机', 'root@openwrt', '测试2'];
        },
        collapse() {
            this.isCollapse = true;
        },
        reload() {
            this.init = false;
            setTimeout(() => {
                this.init = true;
            }, 1000);
        },
        inputMenu() {
            this.menusValue = JSON.stringify(this.menus, true, 2);
        },
        inputStr() {
            this.menus = JSON.parse(this.menusValue);
            console.log('input', this.menus);
        },
        querySon(node, parents, _call) {
            let dataId = node.id;
            console.log('query son in testMenuV2Lazy.vue', dataId, node);
            // 返回子节点数据为最简化开发
            _call(TestMenuLazy.loadSon(dataId));
        }
    }
}
</script>