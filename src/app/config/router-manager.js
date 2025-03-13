export default {
    routerManager: null,
    router: null,
    setRouterManager(routerManager) {
        this.routerManager = routerManager;
        this.router = routerManager.router;
    },
    getPage(module) {
        return this.routerManager.getPage(module);
    },
    add(path, module) {
        return this.routerManager.add(path, module);
    },
    // 路由跳转
    push(path) {
        return this.routerManager.push(path);
    }
}