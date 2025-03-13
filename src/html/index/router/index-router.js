import {Router} from '../../../app/NodeModule.js'
import EasyRouter from "../../../app/core/easy-router.js";
import RouterManager from '../../../app/config/router-manager.js';
const pushRoute = EasyRouter.pushRoute;

Vue.use(Router);

// router config start
import Home from '@/html/index/module/home.vue';
pushRoute('/', Home);

import IeTest from '@/module/test/ie/ie-test.vue';
pushRoute('/test', IeTest);
// router config end

RouterManager.setRouterManager(EasyRouter.getRouterManager())
export default RouterManager.router;