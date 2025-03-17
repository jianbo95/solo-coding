import { Vue } from '../../../app/NodeModule.js';

// 引入语言包
import en from './locales/en.js';
import zh from './locales/zh.js';
var lang = localStorage.getItem('language') || 'zh';

Vue.use(VueI18n);
const i18n = new VueI18n({
    locale: lang,
    messages: {
        en,
        zh
    }
});
console.log('i18n', i18n);
export default i18n;    