!(function (e) {
    Flag('compileByJianbo'),
      Flag('compileByPublish'),
      Flag('minify'),
      Object.defineProperty(exports, '__esModule', { value: !0 })
    var t = require('html/index/util/api.js', '@/html/index/util/http.js'),
      n = { default: t }
    var i = function (e) {
      for (var t in e) {
        var n = e[t]
        'en' == window.LocaleType && (n.name = n['name.' + window.LocaleType])
      }
    }
    exports = {
      getArticle: function (e) {
        n.default.get('/html/index/article/article.json', function (t) {
          i(t), e(t)
        })
      },
      getGameData: function (e) {
        n.default.get('/html/index/apps/game.json', function (t) {
          i(t), e(t)
        })
      },
      getRecentArticle: function (e) {
        n.default.get('/html/index/article/article-recently.json', function (t) {
          i(t), e(t)
        })
      }
    }
  })(),
    exports
  