<template>
    <div style="height:100%;" class="pageTestMenu">
        <el-container style="height: 100%; overflow: hidden; position: relative;">
            <el-aside class="aside menuAndTagAside2" width="390" style="background:#FFF; border:1px solid #fff; height:100%;">

                <div class="image-div">
				    <img class="sidebar-wrapper-bg" src="../../../assets/images/nav-bg.png" alt="">
			    </div>

                <cc-menu-pure-v2 v-model="menus" width="250"
                    background="unset"
                    :is-collapse="isCollapse"
                    :unique-opened="true"
                    :collapse-transition="false"
                    @select="onSelectMenu"
                    :default-active.sync="defaultActive">
                </cc-menu-pure-v2>

            </el-aside>
            <el-main style="padding:0px;">
                
                <cc-tag-group 
                    :show-toggle="true" 
                    :title="tagTitle" 
                    ref="tag" 
                    :data.sync="tags" 
                    v-model="activeTag"
                    @toggle-menu="isCollapse = !isCollapse"
                    @tag-change="tagChange" 
                >
                </cc-tag-group>

                <div style="padding: 10px;">

                <template v-for='(tag) in tags'>
                    <template v-if='tag != "主页"'>
                        <div v-show='activeTag == tag'>
                            {{tag}}
                        </div>
                    </template>
                </template>

                <el-tabs v-model="activeName" v-if='activeTag == "主页"'>
                    <el-tab-pane label="示例说明" name="show">
                        <div>
                            1. 展示 menu 和 tag 的双向绑定 <br>
                            2. 菜单数据的初始化 <br>
                            3. 监听 tag 组件的切换事件，切换菜单展示模式 <br>
                            4. 当前组件使用方式优于 menu-and-tag 组件，更加灵活 <br>
                            5. 支持自定义菜单背景 <br>
                            6. menu-pure.vue 组件比 menu.vue 组件更简单，更灵活 <br>
                            7. 对 menu-pure.vue 组件样式进行了优化，更有层次感 <br>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="调试数据" name="debug">
                        <div>
                            <div>tags: {{tags}}</div>
                            <div>activeTag: {{activeTag}}</div>
                            
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="菜单数据" name="first">
                        <textarea name="" id="" style="width: 100%; height: 800px;"
                            :value="menusValue"
                        ></textarea>
                    </el-tab-pane>
                    <el-tab-pane label="原始数据" name="second">
                        <textarea name="" id="" style="width: 100%; height: 800px;"
                            :value="menusOriginalValue"
                        ></textarea>
                    </el-tab-pane>
                </el-tabs>

                </div>

            </el-main>
        </el-container>
    </div>
</template>

<script>
import Tree from '@/app/util/Tree.js';
import TestMenu from '@/module/test/data/test-menu2.js';

export default {
    
    data: function() {
        return {     
            isCollapse: false,
            defaultActive: null,
            activeName: 'show',
            menus: [],

            tagTitle: null,
            tags: '',
            activeTag: '主页'
            // tag
        }
    },
    computed: {
        menusValue() {
            return JSON.stringify(this.menus, true, 2);
        },
        menusOriginalValue() {
            return JSON.stringify(TestMenu.menu, true, 2);
        }
    },
    created() {
        var menuList = Util.clone(TestMenu.menu);
        for(let i in menuList) {
            let menu = menuList[i];
            if(menu.parent == null) {
                menu.icon = 'el-icon-s-tools';
            }
        }
        // 列表数据转tree格式数据
        var tree = Tree.convert(menuList, 'id', 'parent', null);
        var menuWrap = TreeWrap(tree);
        menuWrap.loop((item) => {
            // console.log('item', item);
            item.label = item.name;
            if(item.type == "item") {
                item.leaf = true;
            }
        });
        this.menus = menuWrap.rootMenu();
        // console.log('testMenu.vue this.menus', this.menus);
    },
    methods: {
        // 菜单选择 -> 控制标签
        onSelectMenu(node) {
            var id = node.id;
            console.log('selected', id, node);
            let tagId = node.title;
            this.$refs.tag.activeTag(tagId, node); // 这里title必须是唯一的啊
        },
        // 标签选择 -> 控制菜单
        tagChange(tagId, node) {
            console.log('tag change', tagId);
            if(tagId == '主页') {
                this.defaultActive = null;
                return;
            }
            console.log('changeActive = '  + node.id + ' lastActive = ' + this.defaultActive);
            this.defaultActive = node.id;
        },
        handleNodeClick() {}
    }
}
</script>

<style lang="less">
@asideTop:#42b59e;
.menuAndTagAside2 {
    overflow-x: hidden;
    border-top: 1px solid @asideTop; 
    position: relative;
    transition: all .2s linear 0s;
    .image-div {
        height: 100%;
        pointer-events: none;
        position: absolute;
        top:0px; z-index: 100;
        overflow: hidden;
    }
    .sidebar-wrapper-bg {
        width: 100%;
        height: 100%;
        opacity: 0.3;
    }
}

@subMenuHover:#001528;
@menuText:#bfcbd9;
@subMenuBg:#2f4050;
@menuBg:#2f4050;
@subMenuActiveText:#f4f4f5;
@menuActiceLeft:#19aa8d;
@subActicBg:#1f2d3d;
@asideTop:#42b59e;
@titleLeftColor:#2f4050;

.pureMenu{
     background: @menuBg;
     
    .el-menu-item:focus, .el-menu-item:hover {
        background-color: @subMenuHover;
    }
    .is-active {
        background: @subMenuHover;
    }
    .el-menu {
        background: @menuBg;
    }
     .el-menu {
        background-color: @menuBg;
    }

    .el-submenu__title:focus, .el-submenu__title:hover {
        outline: 0;
        background-color: @subActicBg;
    }
    .el-submenu.is-opened {
        background-color: @subActicBg;
        .el-submenu__title{
            background-color: @subActicBg;
            color: #fff;
        }
        .el-menu{
            background-color: @subActicBg;
        }
        .el-submenu.is-active {
            background-color: @subActicBg;
            color: #fff;
        }

    }
}
.pageTestMenu {
    .el-menu {
        background-color: unset;
    }
}
</style>