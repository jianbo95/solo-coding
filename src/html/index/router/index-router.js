import {Router} from '../../../app/NodeModule.js'
import EasyRouter from "../../../app/core/easy-router.js";
import RouterManager from '../../../app/config/router-manager.js';
const pushRoute = EasyRouter.pushRoute;

Vue.use(Router);

// router config start
import Test from '@/html/index/module/home.vue';
pushRoute('/test', Test);

import IeTest from '@/module/test/ie/ie-test.vue';
pushRoute('/', IeTest);
// router config end

RouterManager.setRouterManager(EasyRouter.getRouterManager())
export default RouterManager.router;