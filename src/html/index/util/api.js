import http from '@/html/index/util/http.js';
var loadName = function(res) {
    for(var i in res) {
        var item = res[i];
        if(window.LocaleType == 'en') {
            item.name = item['name.' + window.LocaleType];
        }
    }
};

export default {
    getArticle(_call) {
        http.get('/html/index/article/article.json', (res) => {
            loadName(res);
            _call(res);
        })
    },
    getGameData(_call) {
        http.get('/html/index/apps/game.json', (res) => {
            loadName(res);
            _call(res);
        })
    },
    getRecentArticle(_call) {
        http.get('/html/index/article/article-recently.json', (res) => {
            loadName(res);
            _call(res);
        })
    }

}