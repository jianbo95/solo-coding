import {Router} from '../NodeModule.js'

// 路由列表
var routeArr = [];
var router = null;
var routeMap = {};

export default {
    pushRoute(path, component) {
        // 路由数据
        routeArr.push({
            path: path,
            component: component
        });
        routeMap[path] = component;

        // 动态路由
        if(router != null) {
            router.addRoutes([{
                path: path,
                component: component
            }]);
        } else {
            // 静态路由
            // 调用 getRouter 时创建
        }
    },
    getRouter() {
        if(router != null) {
            return router;
        }
        router = new Router();
        window.$router = router;
        for (let i = 0; i < routeArr.length; i++) {
            const route = routeArr[i];
            router.addRoutes([route]);
        }
        return router;
    },
    // 构建
    getRouterManager() {
        var router = this.getRouter();
        return {
            router: router,
            getRoutes() {
                return routeArr;
            },
            getPage(module) {
                return routeMap['/' + module].component;
            },
            add(path, module) {
                // console.log('path', path, module);
                // 主页修复
                if(module == 'icon') {
                    module = '';
                }
                let route = routeMap['/' + module];
                router.addRoutes([{
                    path: path,
                    name: route.name,
                    component: route.component
                }]);
            },
            // 路由跳转
            push(path) {
                router.push(path);
            }
        }
    }
};