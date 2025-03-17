import http from '@/html/index/util/http.js';
export default {
    getArticle(_call) {
        http.get('/html/index/article/article.json', (res) => {
            for(var i in res) {
                var item = res[i];
                if(window.LocaleType == 'en') {
                    item.name = item['name.' + window.LocaleType];
                }
            }
            _call(res);
        })
    },
    getGameData(_call) {
        http.get('/html/index/apps/game.json', (res) => {
            _call(res);
        })
    },
    getRecentArticle(_call) {
        http.get('/html/index/article/article-recently.json', (res) => {
            for(var i in res) {
                var item = res[i];
                if(window.LocaleType == 'en') {
                    var enName = item['name.' + window.LocaleType];
                    if(enName != null) {
                        item.name = enName;
                    }
                }
            }
            _call(res);
        })
    }

}