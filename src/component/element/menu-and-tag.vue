<template>
    <div style="height:100%;" v-if="init">
        <el-container style="height: 100%; overflow: hidden; position: relative;">
            <el-aside class="aside menuAndTagAside" :width="asideWidth"
                :style="`border:1px solid #fff; padding-top:${menuPaddingTop}px; height:100%; background:${color.background};`"
            >
                <div class="image-div" v-if="showImageBg">
				    <img class="sidebar-wrapper-bg" src="../../assets/images/nav-bg.png" alt="">
			    </div>
                
                <slot name="logo"></slot>

                <!-- style="height:calc(100% - 70px); overflow-x: hidden; overflow-y: auto;" -->
                <cc-menu-pure v-if="menuVersion == 1"
                    :class="`pureMenu-${theme}`"
                    style="overflow-x: hidden; overflow-y: hidden;"
                    v-model="currentMenus"
                    :width="width"
                    background="unset"
                    :text-color="color.textColor"
                    :active-text-color="color.activeTextColor"
                    :active-menu="activeMenu"
                    :is-collapse="currentCollapse"
                    :unique-opened = "uniqueOpened"
                    :collapse-transition = "collapseTransition"
                    @select="onSelectMenu"
                    @input="inputMenu"
                    @open="onOpenMenu"
                    :query-son="querySon"
                    :listen-open="listenOpen"
                    :default-active.sync="defaultActive">
                </cc-menu-pure>

                <cc-menu-pure-v2 v-if="menuVersion == 2"
                    :class="`pureMenu-${theme}`"
                    style="height:calc(100% - 70px); overflow-x: hidden; overflow-y: auto;"
                    v-model="currentMenus"
                    :width="width"
                    background="unset"
                    :text-color="color.textColor"
                    :active-text-color="color.activeTextColor"
                    :active-menu="activeMenu"
                    :is-collapse="currentCollapse"
                    :unique-opened = "uniqueOpened"
                    :collapse-transition = "collapseTransition"
                    @select="onSelectMenu"
                    @input="inputMenu"
                    @open="onOpenMenu"
                    :query-son="querySon"
                    :refresh-son="refreshSon"
                    :default-active.sync="defaultActive"
                    @right-click="onRightClick">
                </cc-menu-pure-v2>
            </el-aside>

            <!-- 容器实现左右布局 -->
            <el-main style="padding:0px; height:100%;">
                <el-container style="height:100%;">
                    <el-aside style="height:100%;" :width="leftWidth">
                        <slot name="left"></slot>
                    </el-aside>
                    <el-main style="padding:0px; height:100%;">
                        <cc-tag-group 
                            :debug="debug"
                            :show-toggle="showToggle" 
                            :title="tagTitle" 
                            ref="tag" 
                            :data.sync="tags" 
                            v-model="activeTag"
                            @toggle-menu="toggleTagMenu"
                            @tag-change="tagChange" 
                            :custom-width="tagWidth"
                        >
                        <slot name="tag"></slot>
                        </cc-tag-group>

                        <div style="padding: 0px; height:calc(100% - 40px); overflow:auto;">

                            <div v-if='activeTag == "主页"'>
                                <slot name="home"></slot>
                            </div>

                            <slot></slot>
                            <!-- <div style="height:calc(100% - 2px);border:1px solid #000;">有点内容</div> -->

                            <div v-if='activeTag == "调试"' style="padding:5px;">

                                <el-tabs v-model="debugActive">
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
                                            <div>
                                                <el-button @click="debugReload">重新渲染</el-button>
                                            </div>
                                        </div>
                                    </el-tab-pane>
                                    <el-tab-pane label="菜单数据" name="first">
                                        <textarea name="" id="" style="width: 100%; height: 800px;"
                                            :value="menusValue"
                                        ></textarea>
                                    </el-tab-pane>
                                </el-tabs>

                            </div>
                        </div>
                    </el-main>
                </el-container>
            </el-main>
        </el-container>
    </div>
</template>

<script>
import Tree from '@/app/util/Tree.js';
import TreeWrap from '@/app/util/TreeWrap.js';

export default {
    
    data: function() {
        return {     
            init: false,
            currentCollapse: false,
            defaultActive: null,
            debugActive: 'show',
            currentMenus: [],
            menuWrap: null,
            tagTitle: null,
            tags: [],
            tagIdMap: {}, // 辅助构建ID
            tagNodeMap: {}, // tagName -> node
            activeTag: '主页'
            // tag
        }
    },
    props: {
        menuVersion: {
            type: Number,
            default: 1
        },
        debug: {
            type: Boolean,
            default: false
        },
        showImageBg: {
            type: Boolean,
            default: false
        },
        theme: {
            type: String,
            default: 'black'
        },
        menus: {
            type: Array,
            default: []
        },
        /**
         * unique: 唯一
         * increment：自增
         */
        tagIdType: {
            type: String,
            default: 'unique' 
        },
        menuPaddingTop: {
            type: Number,
            default: 0
        },
        width: {
            type: Number,
            default: 250
        },
        tagWidth: {
            type: Number,
            default: 0
        },
        uniqueOpened: {
            default: true,
            type: Boolean
        },
        collapseTransition: {
            default: false,
            type: Boolean
        },
        collapse: {
            default: false,
            type: Boolean
        },
        /**
         * 多级参数
         */
        activeMenu: {
            type: Array
        },
        querySon: {
            type: Function,
            default: null
        },
        listenOpen: {
            type: Function,
            default: null
        },
        refreshSon: {
            type: Function,
            default: null
        },
        showToggle: {
            type: Boolean,
            default: true
        },
        toggleMode: {
            type: String,
            default: 'min' // min/hide
        },
        leftWidth: {
            type: String,
            default: '0px'
        }
    },
    computed: {
        mainLeft() {
            var style = `height:100%; width:${this.leftWidth}; float: left;`;
            return style;
        },
        mainRight() {
            var style = `height:100%; width:calc(100% - ${this.leftWidth}); float: left;`;
            return style;
        },
        asideWidth() {
            var width;
            if(this.currentCollapse) {
                if(this.toggleMode == 'hide') {
                    width = 1;
                } else {
                    width = 60;
                }
            } else {
                width = this.width;
                // console.log('this.width', this.width);
            }
            // console.log('this.toggleMode', this.toggleMode);
            // console.log('currentCollapse', this.currentCollapse);
            // console.log('aside width', width);
            return width + 'px';
        },
        menusValue() {
            return JSON.stringify(this.currentMenus, true, 2);
        },
        color() {
            var color = {};
            if(this.theme == 'black') {
                color.activeTextColor ='#ffd04b';
                color.textColor ='#fff';
                color.background = '#2f4050';
            } else { // white
                color.activeTextColor ='red';
                color.textColor ='#000';
                color.background = 'unset';
            }
            return color;
        }
    },
    created() {
        this.currentMenus = this.menus;
        // console.log('this.currentMenus', this.currentMenus);
        this.menuWrap = TreeWrap(this.currentMenus);
        this.currentCollapse = this.collapse;
        this.init = true;
    },
    methods: {
        initTheme() {
            
        },
        openDebug() {
            this.$refs['tag'].openDebug();
        },
        addTag(tag, alias, nodeData) {
            this.tagNodeMap[tag] = nodeData;
            this.$refs['tag'].addTag(tag, alias, nodeData);
        },
        debugReload() {
            // console.log('重新渲染', this.currentMenus);
            this.init = false;
            setTimeout(() => {
                this.init = true;
            }, 1000);
        },
        /**
         * 构建标签名
         * @param tag 标签名
         * @return {String} 标签名
         */
        buildTagName(tag) {
            let uniqueTagId = (tag) => {
                return tag;
            };

            let incrementTagId = (tag) => {
                if(this.tagIdMap[tag] == null) {
                    this.tagIdMap[tag] = 1;
                    return tag;
                } else {
                    this.tagIdMap[tag] = this.tagIdMap[tag] + 1;
                }
                return tag + '_' + this.tagIdMap[tag];
            };
            let methods = { uniqueTagId, incrementTagId };
            let methodName = this.tagIdType + 'TagId';
            let _method = methods[methodName];
            return _method(tag);
        },
        /**
         * 支持除了tag和menu以外的方式控制菜单选择
         */
        showTagById(nodeId) {
            // console.log('showTagById', nodeId);
            // 根据id找node
            let node = this.menuWrap.findNode(nodeId);
            if(node == null) {
                console.error('find node is null', nodeId);
                return;
            }
            this.onSelectMenu(node);
        },
        inputMenu(value) {
            // console.log('inputMenu', value);
            this.menuWrap = TreeWrap(this.currentMenus);
        },
        // 菜单点击
        onOpenMenu(nodeId, node, flag) {
            // console.log('on open menu from ' + flag, node);
            var nodes = this.menuWrap.findParent(node, null, 'onOpenMenu');
            this.$emit('open-menu', node, nodes);
        },
        // 菜单选择 -> 控制标签
        onSelectMenu(node) {
            let id = node.id;
            // console.log('selected', id, node);
            let tagName = node.title;
            tagName = this.buildTagName(tagName);
            this.$refs.tag.activeTag(tagName, node); 
            this.tagNodeMap[tagName] = node;
            this.tagsChange();
            
            // console.log('emitTagChange by select menu', node);
            this.emitTagChange(node);
            this.defaultActive = node.id;
        },
        // 右键点击
        onRightClick(event, data) {
            this.$emit('right-click', event, data);
        },
        emitTagChange(node) {
            var nodes = this.menuWrap.findParent(node, null, 'emitTagChange');
            this.$emit('tag-change', node, nodes);
        },
        // 多个标签改变
        tagsChange() {
            let contents = [];
            for(let i in this.tags) {
                let tagId = this.tags[i];
                if(tagId == '主页' 
                    || tagId == '调试') { 
                    continue; 
                }
                let node = this.tagNodeMap[tagId];
                // console.log('tags change node', node);
                if(tagId == this.activeTag) {
                    node.active = true;
                } else {
                    node.active = false;
                }
                contents.push(node);
            }

            if(contents.length > 0) {
                // console.log('contents' + this.activeTag , contents);
                this.$emit('input', contents);
            }
        },
        toggleTagMenu() {
            this.currentCollapse = !this.currentCollapse;
            console.log('this.currentCollapse', this.currentCollapse);
            this.$emit('update:collapse', this.currentCollapse);
        },
        // 标签选择 -> 控制菜单
        tagChange(tagId, node) {
            // console.log('tag change ' + tagId);
            this.tagsChange();

            if(node == null) {
                node = {
                    title: tagId
                };
            }
            console.log('emitTagChange by tagChange', node);
            this.emitTagChange(node);

            if(tagId == '主页') {
                this.defaultActive = null;
                return;
            }
            if(tagId == '调试') {
                this.defaultActive = null;
                return;
            }
            // console.log('changeActive = '  + node.id + ' lastActive = ' + this.defaultActive);
            this.defaultActive = node.id;
        }
    }
}
</script>

<style lang="less">
@asideTop:#42b59e;
@subMenuHover:#001528;
@menuText:#bfcbd9;
@subMenuBg:#2f4050;
@menuBg:#2f4050;
@subMenuActiveText:#f4f4f5;
@menuActiceLeft:#19aa8d;
@subActicBg:#1f2d3d;
@asideTop:#42b59e;
@titleLeftColor:#2f4050;

.menuAndTagAside {
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

.el-menu {
    border-right: 0px;
}

.pureMenu-black{
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


.pureMenu-white{
    
    
}
</style>