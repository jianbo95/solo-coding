export default {
    menus: null,
    currentMenus: null,
    currentMenuMap: {},
    menuMap: {},
    load(data) {
        var menuList = Util.clone(data.menu);
        for(let i in menuList) {
            let menu = menuList[i];
            if(menu.parent == null) {
                menu.icon = 'el-icon-s-tools';
            }
            this.menuMap[menu.id] = menu;
        }
        // 列表数据转tree格式数据
        this.menus = Tree.convert(menuList, 'id', 'parent', null);
        console.log('this.menus', this.menus);
        return this.rootMenu();
    },
    loadSon(nodeId) {
        // console.log('parentId', nodeId);
        var node = this.menuMap[nodeId];
        // var currentNode = this.currentMenuMap[nodeId];
        return this.pure(node.children);
    },
    pure(children) {
        var list = [];
        for(var i in children) {
            var item = children[i];
            item = Util.cloneBase(item);
            list.push(item);
        }
        return list;
    },
    rootMenu() {
        if(this.currentMenus != null) {
            var root = [];
            for(let i in this.currentMenus) {
                let menu = this.currentMenus[i];
                root.push(menu);
            }
            return root;
        }
        var menus = this.menus;
        var root = [];
        for(let i in menus) {
            let menu = menus[i];
            menu = Util.cloneBase(menu);
            root.push(menu);
            this.currentMenuMap[menu.id] = menu;
        }
        this.currentMenus = root;
        return root;
    }
}