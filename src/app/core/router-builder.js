import {Vue} from '../NodeModule.js'
import {Router} from '../NodeModule.js'

let build = function() {
    
    const router = new Router();

    let self = {
        routes: [],
        routeMap: {},
        router: router,
        getPage(module) {
            return routeMap['/' + module];
        },
        add(path, module) {
            // console.log('path:' + path + ' module:' + module);
            router.addRoutes([{
                path: path,
                component: this.getPage(module)
            }]);
        },
        // 路由跳转
        push(path) {
            router.push(path);
        },
        pushRoute(path, component) {
            // routes.push({ path: path, component: component });
            // routeMap[path] = component;
            router.addRoutes([{
                path: path,
                component: component
            }]);
        }
    };
    return self;
};

export default {

    build: build
    
}