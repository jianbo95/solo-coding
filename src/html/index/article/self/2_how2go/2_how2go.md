# 静态网站的接口实现原理

花最少的钱，做最少的维护，实现“动态”网站的功能。

## 背景介绍

solo-coding.org，这是一个纯静态网站，没有后台服务器和数据库。为了实现类似动态网站的功能，我们采用了一套基于构建时预处理的接口实现方案。
下面会有个JavaApi的对象，是因为开发环境我是用Java写的，而构建时是用 Node 构建的，为了兼容开发模式和构建模式，我在Node环境也用了JavaApi这个对象名。

## 核心实现机制

### 1. 构建时数据预处理
通过Node.js脚本在构建阶段扫描项目目录，将动态数据预先生成JSON文件：

```javascript
// 先定义一个Api对象，它描述了接口由哪一个脚本去构建，key是接口路径，value是接口生成脚本
var Api = {
    // 游戏数据
    "/html/index/apps/game.json": "api/api-game.js",
    // 文章数据
    "/html/index/article/article.json": "api/api-article.js",
    // 最近文章
    "/html/index/article/article-recently.json": "api/api-article-recently.js",
    // 文章标签
    "/html/index/article/article-tag.json": "api/api-article-tag.js",
    // 标签下有哪些文章
    "/html/index/article/tag-article.json": "api/api-tag-article.js",
}

// api/api-article.js 的部分代码实现如下
var ApiUtil = _require('@/conf/pure/conf/util/api-util.js');
var filesJson = JavaApi.files('@/src/html/index/article');
var files = JSON.parse(filesJson);
var data = [];
for(var i in files) {
    var file = files[i];
    if(file.indexOf('.json') + 5 == file.length) {
        // .json 结尾
        console.log('file' + file);
        var articleFile = file.substring(0, file.length - 5) + '.md';
        var content = JavaApi.read(articleFile);
        var summary;
        if(content.length > 100) {
            summary = content.substring(0, 100);
        } else {
            summary = content;
        }
        var item = JSON.parse(JavaApi.read(file));
        item.summary = summary;
        item.title = item.name;
        item.path = JavaApi.resourceToUrl(articleFile);
        data.push(item);
    }
}
```

## 主要功能实现

### 1. 文章列表接口
- 构建时扫描`/src/html/index/article`目录
- 每一篇文章都有一个json文件，然后生成按功能包含文章元数据的JSON文件
- 前端通过`/api/html/index/article/article.json`获取数据
- 除此之外，还有 article-recently.json 、article-tag.json、tag-article.json 接口

### 2. 游戏数据接口
- 每个游戏目录包含`game.json`配置文件
- 构建时收集所有游戏数据
- 前端通过`/html/index/app/game.json`获取数据

## 总结
总的来说，这种实现方式在保持静态网站简单性的同时，又提供了足够的灵活性，是个人开发者和小型团队的不错选择。