<template>
    <el-menu v-if="init" 
        :class="menuClass"
        :style="style"
        ref="menu"
        :collapse="isCollapse"
        :collapse-transition = "collapseTransition"
        :unique-opened     = "uniqueOpened"
        :default-openeds   = "defaultOpeneds"
        :default-active    = "defaultActive"
        class             = "el-menu-vertical-demo"
        @open             = "handleOpen"
        @select           = "handleSelect"
        @close            = "handleClose"
        :background-color = "currentBackground"
        :text-color        = "textColor"
        :active-text-color = "activeTextColor"
        >

        <cc-menu-son :use-id="true" :root="true" :collapse="isCollapse" :menus="currentMenus"></cc-menu-son>

    </el-menu>
</template>

<script>
import TreeWrap from '@/app/util/TreeWrap.js';
export default {
    data: function() {
        return {
            currentMenus: [],
            init: false,
            currentBackground: null
        }
    },
    props: {
        activeTextColor: {
            default: '#ffd04b',
            type: String
        },
        textColor: {
            default: '#fff',
            type: String
        },
        isCollapse: false,
        width: {
            type: Number,
            default: 350
        },
        value: {
            type: Array,
            default: null
        },
        uniqueOpened: {
            default: null,
            type: Boolean
        },
        collapseTransition: {
            default: null,
            type: Boolean
        },
        defaultOpeneds: null,
        defaultActive: null,
        /**
         * 多级参数
         */
        activeMenu: {
            type: Array
        },
        background: {
            default: null,
            type: String
        },
        querySon: {
            type: Function,
            default: null
        },
        listenOpen: {
            type: Function,
            default: null
        }
    },
    watch: {
        activeMenu(value) {
            console.log('activeMenu change', value);
            this.autoOpen(() => {
                console.log('activeMenu change end');
            });
        }
    },
    computed: {
        menuClass() {
            if(this.isCollapse) {
                return 'collapsePureMenu';
            } else {
                return '';
            }
        },
        style() {
            var width = this.width;
            if(this.isCollapse) {
                width = 60;
            }
            return 'width:' + width + "px;";
        }
    },
    created() {
        // 搞个 TreeWrap 对象封装下会简单处理很多
        this.menuWrap = TreeWrap(this.value);
        this.currentMenus = this.value;
        this.init = true;
        
        if(this.background == null) {
            this.currentBackground = '#2f4050';
        } else if(this.background == 'unset') {
            this.currentBackground = null;
        }
        
        if(this.activeMenu != null) {
            Core.waitRef(this.$refs, 'menu', () => {
                this.autoOpen(() => {
                    if(this.listenOpen != null) {
                        this.listenOpen();
                    }
                });
            });
        }
        
    },

    methods: {
        queryParents(node) {
            var queryParentsLoop = (parents) => {
                var node = parents[parents.length - 1]; // 取最后一个
                let pid = node.parentId;
                if(pid == null) {
                    return parents;
                } 
                parent = this.menuWrap.findNode(pid);
                if(parent == null) {
                    return parents;
                }
                parents.push(parent); // 加载最后面，第一个是儿子，第二个是父节点，第三个是祖父节点
                return queryParentsLoop(parents);
            }
            return queryParentsLoop([node]);
        },
        querySonFromParent(nodeId, _call) {
            if(this.querySon != null) {
                let node = this.menuWrap.findNode(nodeId);
                if(node.children != null) {
                    R(_call);
                    return;
                }
                if(node == null) {
                    console.error('find node is null', nodeId);
                    return;
                }
                let parents = this.queryParents(node);
                // console.log('parents', parents);
                this.querySon(node, parents, (children) => {
                    this.$emit('update:default-active', '');
                    // let title = node.title;
                    // node.title = title + ' '; // 使子节点重新渲染！通过优化 TreeWrap.rootMenu 方法修复
                    // setInterval(() => {
                    //     node.title = title; // 恢复
                    // }, 1000);

                    this.menuWrap.addSon(node, children);
                    this.currentMenus = this.menuWrap.rootMenu();
                    // console.log('after querySon', this.currentMenus);
                    this.$emit('input', this.currentMenus);

                    if(_call != null) {
                        _call();
                    }
                });
            }
        },
        autoOpen(_call) {
            // this.loopOpen(this.activeMenu, this.currentMenus, 0);
            // findByFirstLayer
            var titles = Util.clone(this.activeMenu);
            this.loopOpen(titles, this.currentMenus, 0, () => {
                console.log('loopOpen finish');
                if(Util.isFunction(_call)) {
                    _call();
                } else {
                    console.log('Is not function', _call);
                }
            });
        },
        findMenuByTitle(title, menus) {
            if(title == null) {
                return null;
            }
            for(var i in menus) {
                var menu = menus[i];
                if(menu.title == title) {
                    return menu;
                }
            }
        },
        loopOpen(titles, menus, size, _call) {
            if(_call == null) {
                _call = function() {};
            } else {
                if(!Util.isFunction(_call)) {
                    console.error("_call is not function");
                    return;
                } 
            }
            
            if(size > 6) {
                _call();
                return;
            }
            // findByFirstLayer
            var title = titles.shift();

            var menu = this.findMenuByTitle(title, menus);
            if(menu == null) {
                _call();
                return;
            }

            if(menu.type == 'item') {

                this.handleSelect(menu.id);
                _call();

            } else {

                this.handleOpen(menu.id, null, () => {

                    // 必须等待 ms-{id} 生成才能调用 open 方法
                    Core.waitDomById('ms-' + menu.id, () => {

                        try {
                            this.$refs.menu.open(menu.id);
                        } catch (e) {
                            console.error('this.$refs.menu.open(menu.id); Error id = ' + menu.id, menu);
                            throw e;
                        }

                        if(menu.children != null) {
                            // 等待最后一个元素渲染完成
                            let last = menu.children[menu.children.length -1];
                            // 这里报错了
                            Core.waitDomById('ms-' + last.id, () => {
                                this.loopOpen(titles, menu.children, size ++, _call);
                            });
                        } else {
                            _call();
                        }

                    });
                });
            }
        },
        handleOpen(nodeId, nodeIdArr, _call) {
            // console.log('open ' + nodeId, nodeIdArr);
            let node = this.menuWrap.findNode(nodeId);
            this.$emit('open', nodeId, node, 'menu-pure.vue');
            this.querySonFromParent(nodeId, _call);
        },
        handleSelect(nodeId) {
            // console.log('select ' + nodeId);
            let node = this.menuWrap.findNode(nodeId);
            let parents = this.queryParents([node]);
            this.$emit('select', node);
            this.$emit('update:default-active', nodeId);
        },
        handleClose(data) {
            // console.log('close ' + data);
            this.$emit('close', data);
        },
    }
}
</script>

<style lang="less">

.collapsePureMenu  {
    span {
        margin-left: 20px;
    }
}
</style>