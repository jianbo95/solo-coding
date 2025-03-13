console.log('app.js');

logTime();

import { Vue } from './app/NodeModule.js';
import { ElementUI } from './app/NodeModule.js';
console.log('ie.js vue', Vue );

import App from '../../html/index/index.vue'
import cmpt from './app/config/global-cmpt.js'
import loadJs from './app/config/loadJs.js'
import Router from '../../html/index/router/index-router.js'

// console.log('App', App);

Vue.use(ElementUI) // ui库


let vue = new Vue({
    el: '#app',
    router: Router,
    components: {
        'App': App
    },
    template: '<App/>' 
})
window.vue = vue
window.App = vue
window.size = 'small'
logTime();

cmpt.log();
loadJs.init(vue);