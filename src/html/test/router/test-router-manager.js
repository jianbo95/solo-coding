import RouterBuilder from '@/app/core/router-builder';
let RouterManager = RouterBuilder.build();
let pushRoute = RouterManager.pushRoute;

// 测试模块
import Test from '@/module/test/test.vue';
pushRoute('/test', Test);

pushRoute('/', Test);

export default RouterManager;