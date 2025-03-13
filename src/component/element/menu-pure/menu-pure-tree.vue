<template>
    <div class="menu-pure-v2">
        <el-tree :data="data" :style="style" ref="tree"
            :props="defaultProps" 
            :default-expanded-keys="expandedKeys"
            @node-click="handleNodeClick"
            @node-expand="onNodeExpand"
            :expand-on-click-node="false"
            node-key="id"
            :load="loadNode" lazy
            @node-contextmenu="onRightClick"
            >
            <span slot-scope="{ node, data}" class="custom-tree-node">
                <span>{{ node.label }}</span>
                <template v-if="node.data.type != 'item'">
                    <i class="el-icon-refresh" @click="() => onRefresh(node, data)"></i>
                </template>
            </span>
        </el-tree>
    </div>
</template>

<script>
import TreeWrap from '@/app/util/TreeWrap.js';
export default {
    data: function() {
        return {
            defaultProps: {
                children: 'children',
                label: 'title',
                isLeaf: 'leaf'
            },
            $tree: null,
            expandedKeys: [],
            data: [],
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
        refreshSon: {
            type: Function,
            default: null
        },
    },
    watch: {
        activeMenu(value) {
            console.log('activeMenu change', value);
            this.autoOpen();
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
                width = 0;
            }
            return 'width:' + width + "px;";
        }
    },
    created() {
        // 搞个 TreeWrap 对象封装下会简单处理很多
        this.menuWrap = TreeWrap(this.value);
        this.currentMenus = this.value;
        // this.loadData();
        this.init = true;
        
        if(this.background == null) {
            this.currentBackground = '#2f4050';
        } else if(this.background == 'unset') {
            this.currentBackground = null;
        }
        Core.waitRef(this.$refs, 'tree', (ref) => {
            this.$tree = ref;
            if(this.activeMenu != null) {
                if(this.activeMenu.length > 0) {
                    this.autoOpen();
                }
            } else {
                console.log('this.activeMenu', this.activeMenu);
            }
        });

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
        // 加载数据
        loadNode(node, call, refresh) {
            console.log('load Node');
            if(node.level == 0) {
                console.log('load root node', this.currentMenus);
                var root = Util.clone(this.currentMenus);
                call( root );
            } else {
                
                // 获取节点数据
                node = node.data;
                if(node.type == 'item') {
                    call([]);
                    return;
                }

                var level = node.level;
                // this.$emit('open', node.id, node, 'loadNode');
                console.log('load son node', node);

                if(this.querySon != null) {
                    // if(node.children != null) {
                    //     if(node.children.length > 0) {
                    //         call(node.children);
                    //         console.log('return1', node.children);
                    //         return;
                    //     }
                    // }
                    if(node == null) {
                        console.error('find node is null', nodeId);
                        console.log('return2');
                        return;
                    }
                    let parents = this.queryParents(node);
                    
                    console.log('querySon before', parents); // 这里只有一个父节点？

                    var querySon = this.querySon;
                    if(refresh) {
                        querySon = this.refreshSon;
                    }

                    querySon(node, parents, (children) => {
                        console.log('query son finish');
                        this.$emit('update:default-active', '');
                        for(var i in children) {
                            var child = children[i];
                            if(child.type == 'item') {
                                child.leaf = true;
                            }
                            child.level = level + 1;
                            console.log('child', child);
                        }
                        console.log('querySon', children);
                        
                        // 同步到 menuWrap
                        this.menuWrap.addSon(node, children);
                        // this.currentMenus = this.menuWrap.rootMenu();
                        // this.$emit('input', this.currentMenus);
                        this.$emit('input', this.menuWrap.rootMenu());

                        call( children );
                    });
                } else {
                    // UI.warning('未实现querySon')
                    console.log('return4');
                    if(node.children != null) {
                        call(node.children);
                    } else {
                        call([]);
                    }
                }
            }
        },
        handleNodeClick(node) {
            console.log('click ', node);
            this.$emit('open', node.id, node, 'click');
            
            if(node.type == 'item') {
                this.$emit('select', node);
                this.$emit('update:default-active', node.id);
            }
        },
        onNodeExpand(node) {
            console.log('onNodeExpand', node);
            this.$emit('open', node.id, node, 'click');
        },

        handleSelect(nodeId, _call) {
            // console.log('select ' + nodeId);
            let node = this.menuWrap.findNode(nodeId);
            this.$emit('select', node);
            this.$emit('update:default-active', nodeId);
        },
        onLoad(node, data) {
            this.onRefreshOrLoad(node, data, false);
        },
        onRefresh(node, data) {
            console.log('onRefresh', node);
            this.onRefreshOrLoad(node, data, true);
        },
        onRefreshOrLoad(node, data, refresh) {
            console.log('refresh', node, data);
            
            // if(refresh == false) {
            //     if(node.children != null && node.children > 0) {
            //         return;
            //     }
            // }

            // 1. 删除已有对象
            // 1.1 直接赋值为空数组
            // node.childNodes = [];

            // 1.2 通过方法移除（存在异常）
            // /////////////
            var list = [];
            for(var j in node.childNodes) {
                var item = node.childNodes[j];
                list.push(item);
            }
            for(var j in list) {
                var item = list[j];
                console.log('wait remove item', item);
                this.$tree.remove(item);
            }
            // /////////////

            node.loading = true;
            
            var delay = Core.delay(); // 开始计时

            this.loadNode(node, (children) => {

                for(var i in children) {
                    var item = children[i];
                    // console.log('append node', item);
                    this.$tree.append(item, node.data.id);
                }

                // 延迟300毫秒，优化视觉效果
                setTimeout(() => {
                    node.loading = false;
                }, delay.calc(300)); 

            }, refresh);
        },

        onRightClick(event, data, node, dom) {
            // console.log('right click', event, data, node, dom);
            this.$emit('right-click', event, data);
        },

        ////////////////// 自动打开 ////////////////////
        autoOpen() {
            var titles = Util.clone(this.activeMenu);
            this.loopOpen(titles, this.currentMenus, 0);
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
        loopOpen(titles, menus, size) {
            if(size > 5) {
                return;
            }
            var title = titles.shift();

            var menu = this.findMenuByTitle(title, menus);
            if(menu == null) {
                return;
            }

            if(menu.type == 'item') {
                this.handleSelect(menu.id, () => {
                });

            } else {
                            
                var node = this.$tree.getNode(menu.id);
                console.log('loop open node tree', this.$tree);
                console.log('loop open node ' + node.data.title, node);
                
                this.onLoad(node, node.data);
                Core.waitArray(node, 'childNodes', () => {

                    console.log('loop open success');
                    node.expanded = true;
                    this.loopOpen(titles, menu.children, size ++);
                });

            }
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
.menu-pure-v2 {
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 28px;
    }
}
</style>
