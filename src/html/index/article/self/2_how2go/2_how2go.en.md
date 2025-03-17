# How APIs are Implemented in a Static Website

Achieve "dynamic" website functionality with minimal cost and maintenance.

## Introduction & Context

solo-coding.org is a purely static website without backend servers or databases. To implement functionality similar to dynamic websites, we adopted an approach based on build-time preprocessing.
You'll notice a JavaApi object below - this is because I wrote the development environment in Java but use Node for building. To maintain compatibility between development and build modes, I kept the same JavaApi object name in the Node environment.

## Core Implementation Mechanism

### 1. Build-time Data Preprocessing
Using Node.js scripts to scan project directories during the build phase and pre-generate JSON files for dynamic data:

```javascript
// First define an Api object that describes which script builds which interface
// key is the API path, value is the API generation script
var Api = {
    // Game data
    "/html/index/apps/game.json": "api/api-game.js",
    // Article data
    "/html/index/article/article.json": "api/api-article.js",
    // Recent articles
    "/html/index/article/article-recently.json": "api/api-article-recently.js",
    // Article tags
    "/html/index/article/article-tag.json": "api/api-article-tag.js",
    // Articles under tags
    "/html/index/article/tag-article.json": "api/api-tag-article.js",
}

// Partial implementation of api/api-article.js
var ApiUtil = _require('@/conf/pure/conf/util/api-util.js');
var filesJson = JavaApi.files('@/src/html/index/article');
var files = JSON.parse(filesJson);
var data = [];
for(var i in files) {
    var file = files[i];
    if(file.indexOf('.json') + 5 == file.length) {
        // .json extension
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

## Main Features Implementation

### 1. Article List API
- Scans `/src/html/index/article` directory during build
- Each article has a JSON file, which generates metadata JSON files by functionality
- Frontend fetches data via `/api/html/index/article/article.json`
- Additional APIs include article-recently.json, article-tag.json, and tag-article.json

### 2. Game Data API
- Each game directory contains a `game.json` configuration file
- Collects all game data during build
- Frontend accesses via `/html/index/app/game.json`

## Conclusion
Overall, this implementation approach maintains the simplicity of a static website while providing sufficient flexibility, making it an excellent choice for individual developers and small teams.