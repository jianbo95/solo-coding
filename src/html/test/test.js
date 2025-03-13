// import counter from '@/app/Counter.js';
console.log('test.js');

import { Vue } from '../../app/NodeModule'
import { ElementUI } from '../../app/NodeModule'

import App from '../../App.vue'
import cmpt from '@/app/config/global-cmpt'
import loadJs from '../../app/config/loadJs'

import RouterManager from './router/test-router-manager'
window.RouterManager = RouterManager

Vue.use(ElementUI) // ui库

let vue = new Vue({
    el: '#app',
    router: RouterManager.router,
    components: {
      'App': App
    },
    template: '<App/>'
});

window.vue = vue
window.App = vue

cmpt.log();
loadJs.init(vue);