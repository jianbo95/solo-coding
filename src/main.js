console.log('app.js');

logTime();

import { Vue } from './app/NodeModule.js';
import { ElementUI } from './app/NodeModule.js';
console.log('ie.js vue', Vue );

import App from './html/index/index.vue'
import cmpt from './app/config/global-cmpt.js'
import loadJs from './app/config/loadJs.js'
// import Router from '../../html/index/router/index-router.js'
import Router from './html/index/router/index-router.js'
import i18n from './html/index/util/i18n.js'
// console.log('App', App);

var locale = ELEMENT.lang[i18n.locale];
if(i18n.locale == 'en'){
    locale.el.datepicker.prevMonth = 'Pre';
    locale.el.datepicker.nextMonth = 'Next';
}
console.log('locale', locale);
Vue.use(ElementUI, {locale}) // ui库


let vue = new Vue({
    i18n,
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
window.I18n = i18n;
logTime();

cmpt.log();
loadJs.init(vue);