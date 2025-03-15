import http from '@/html/index/util/http.js';
export default {
    getArticle(_call) {
        http.get('/html/index/article/article.json', (res) => {
            _call(res);
        })
    },
    getGameData(_call) {
        http.get('/html/index/apps/game.json', (res) => {
            _call(res);
        })
    }

}