import {Router} from '../../../app/NodeModule.js'
import EasyRouter from "../../../app/core/easy-router.js";
import RouterManager from '../../../app/config/router-manager.js';
const pushRoute = EasyRouter.pushRoute;

Vue.use(Router);

// router config start
import Home from '@/html/index/module/main/home.vue';
pushRoute('/', Home);

import article from '@/html/index/module/main/article.vue';
pushRoute('/article', article);

import game from '@/html/index/module/main/game.vue';
pushRoute('/game', game);

import IeTest from '@/module/test/ie/ie-test.vue';
pushRoute('/test', IeTest);
// router config end

RouterManager.setRouterManager(EasyRouter.getRouterManager())
export default RouterManager.router;