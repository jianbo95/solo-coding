<template>
    <el-menu v-if="init" 
        :key="componentKey"
        :style="style"
        ref="menu"
        :collapse="isCollapse"
        :collapse-transition = "collapseTransition"
        :unique-opened     = "uniqueOpened"
        :default-openeds   = "defaultOpeneds"
        :default-active    = "currentDefaultActive"
        class             = "el-menu-vertical-demo"
        @open             = "handleOpen"
        @select           = "handleSelect"
        @close            = "handleClose"
        :background-color  = "background"
        :text-color        = "textColor"
        :active-text-color = "activeTextColor"
        >

        <cc-menu-son :root="true" :collapse="isCollapse" :menus="menus"></cc-menu-son>

    </el-menu>
</template>

<script>
export default {
    data: function() {
        return {
            componentKey: 0,
            key: null,
            keyPath: null,
            
            // keyMap demo:
            // 工单: "3"
            // 工单-二次审核: "3-3"
            // 工单-待处理: "3-1"
            // 工单-待审核: "3-2"
            // 工单-竞价发布: "3-0"
            keyMap: {},
            waitLoop: false,
            init: false,
            currentDefaultActive: '',
            defaultOpeneds: null
        }
    },
    props: {
        activeTextColor: {
            default: '#fff',
            type: String
        },
        textColor: {
            default: '#fff',
            type: String
        },
        isCollapse: false,
        width: {
            type: Number,
            default: 250
        },
        customIndex: false,
        openAll: {
            type: Boolean,
            default: false
        },
        menus: {
            type: Array,
            default: null
        },
        menuList: {
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
        defaultActive: null,
        /**
         * 多级参数
         */
        activeMenu: Array,
        background: {
            type: String
        }
    },
    computed: {
        style() {
            return 'width:' + this.width + "px";
        }
    },
    created() {
        if(this.menuList == null) {
            console.warn('menu.vue this.menuList is null');
        }
        if(this.menus == null) {
            console.error('menu.vue this.menus is null');
        }
        
        // console.log('this.menuList', this.menuList);

        this.parseMenus();
        let opens = [];
        for(let i in this.menuList) {
            let node = this.menuList[i];
            opens.push(node.index);
        }
        // console.log('menu created', opens, this.menuList);
        if(this.openAll) {
            this.defaultOpeneds = opens;
            // console.log('this.defaultOpeneds', this.defaultOpeneds);
        }
        this.init = true;
    },
    watch: {
        defaultActive(value) {
            this.currentDefaultActive = value;
        },
        activeMenu(value) {
            console.log('activeMenu change', value);
            this.autoOpen();
        },
        isCollapse(value) {
            if(!value) {
                this.componentKey ++; // 重新渲染组件
            }
        },
        menus() {
            this.parseMenus();
            this.waitLoop = true;
        }
    },
    methods: {
        openMenus() {
            this.componentKey ++; // 重新渲染组件
        },
        autoOpen() {
            this.loopOpen(this.activeMenu);
        },
        waitKey(menu, parent, _call) {
            var p = Util.clone(parent);
            p.push(menu);
            var title = p.join('-');
            // console.log('title', title);
            var timer = setInterval(() => {
                var key = this.keyMap[title];
                if(key != null) {
                    clearInterval(timer);
                    _call(key);
                }
            }, 100);
        },
        loopOpen(menus, parent) {
            if(parent == null) {
                parent = [];
            }
            var menus = Util.clone(menus);
            var menu = menus.shift();
            
            this.waitKey(menu, parent, (key) => {

                // 等待menu发生变化
                if(menus.length > 0) {
                    this.$refs.menu.open(key);
                    this.handleOpen(key);

                    parent.push(menu);
                    this.loopOpen(menus, parent);
                } else {
                    // 没办法open到menu item
                    // this.$refs.menu.open(key);
                    this.currentDefaultActive = key;
                    this.handleOpen(key);
                }
            });
        },
        parseMenus() {
            var map = {};
            this.loopMenu(this.menus, null, null, map);
            this.keyMap = map;
            // console.log('parseMenus', this.keyMap)
        },
        loopMenu(menus, keyParent, titleParent, map) {
            for(var i in menus) {
                var menu = menus[i];
                var key = i;
                if(keyParent != null) {
                    key = keyParent + '-' + key;
                }
                var title = menu.title;
                if(titleParent != null) {
                    title = titleParent + '-' + title;
                }
                map[title] = key;

                if(menu.children != null) {
                    this.loopMenu(menu.children, key, title, map);
                }
            }
        },
        getKey(menuNames) {
            var titleKey = menuNames.join('-');
            return this.keyMap[titleKey];
        },
        handleOpen(key, keyPath) {
            this.key = key;
            this.keyPath = keyPath;
            var keys = this.parseKey(key);
            var selectMenus = this.getSelectMenus(keys);
            var menuNames = this.menuNames(selectMenus);
            var menu = selectMenus[selectMenus.length - 1];
            // var level = keys.length;
            // console.log('keys', keys);
            // console.log('handleOpen', key, keyPath);
            // console.log('getMenu', menu);
            this.$emit('open', keys, selectMenus)
            this.$emit('open-menu', menu, menuNames);
        },
        handleSelect(key, keyPath) {
            this.handleOpen(key, keyPath);
        },
        handleClose() {},
        menuNames(menuList) {
            var names = [];
            for(var i in menuList) {
                var menu = menuList[i];
                // console.log(i, menu);
                var name = menu.title;
                names.push(name);
            }
            return names;
        },
        getSelectMenus (keys) {
            // console.log('getSelectMenus', keys);
            // console.log('this.menus', this.menus);
            return this.getMenuLoop(keys, this.menus, []);
        },
        getMenuLoop(keys, menus, selectMenus) {
            let menu;

            // var menu = menus[keys[0]];
            
            let getMenu = (key) => {
                for(let i in menus) {
                    let menu = menus[i];
                    if(menu.id == key) {
                        return menu;
                    }
                }
            };
            // console.log('this.customIndex', this.customIndex);
            if(this.customIndex) {
                menu = getMenu(keys[0]);
            } else {
                menu = menus[keys[0]];
            }

            if(menu == null) {
                return selectMenus;
            }
            
            selectMenus.push(menu);

            if(keys.length == 1) {
                return selectMenus;
            }
            var otherKeys = [];
            for(var i = 1; i < keys.length; i++) {
                otherKeys.push(keys[i]);
            }
            return this.getMenuLoop(otherKeys, menu.children, selectMenus);
        },
        parseKey (key) {
            var keys = (key + '').split('-');
            return keys;
        }
    }
}
</script>