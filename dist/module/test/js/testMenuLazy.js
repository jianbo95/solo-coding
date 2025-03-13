(function(parentUrl) {
Flag("compileByJianbo");
Flag("compileByPublish");
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports = {
    menus: null,
    currentMenus: null,
    currentMenuMap: {},
    menuMap: {},
    load: function load(data) {
        var menuList = Util.clone(data.menu);
        for (var i in menuList) {
            var menu = menuList[i];
            if (menu.parent == null) {
                menu.icon = 'el-icon-s-tools';
            }
            this.menuMap[menu.id] = menu;
        }
        // 列表数据转tree格式数据
        this.menus = Tree.convert(menuList, 'id', 'parent', null);
        console.log('this.menus', this.menus);
        return this.rootMenu();
    },
    loadSon: function loadSon(nodeId) {
        // console.log('parentId', nodeId);
        var node = this.menuMap[nodeId];
        // var currentNode = this.currentMenuMap[nodeId];
        return this.pure(node.children);
    },
    pure: function pure(children) {
        var list = [];
        for (var i in children) {
            var item = children[i];
            item = Util.cloneBase(item);
            list.push(item);
        }
        return list;
    },
    rootMenu: function rootMenu() {
        if (this.currentMenus != null) {
            var root = [];
            for (var i in this.currentMenus) {
                var menu = this.currentMenus[i];
                root.push(menu);
            }
            return root;
        }
        var menus = this.menus;
        var root = [];
        for (var _i in menus) {
            var _menu = menus[_i];
            _menu = Util.cloneBase(_menu);
            root.push(_menu);
            this.currentMenuMap[_menu.id] = _menu;
        }
        this.currentMenus = root;
        return root;
    }
};
})('module/test/js/testMenuLazy.js'); exports; 