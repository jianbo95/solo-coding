// 通过 startsWith 方法匹配并替换
module.exports = {
    "/static/": "@/static/,@/statics/ace/,@/statics/game/",
    "/": "@/src/", // @front 会替换成前端路径
};