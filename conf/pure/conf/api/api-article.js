module.exports = {
    run: function() {
        // data
        // 读取app下所有目录
        // 添加路由
        // 合并游戏数据
        // D:\www\solo-coding\src\html\index\app
        var ApiUtil = require('@/conf/pure/conf/util/api-util.js');
        var filesJson = JavaApi.files('@/src/html/index/article');
        var files = JSON.parse(filesJson);
        var data = [];
        for(var i in files) {
            var file = files[i];
            if(file.indexOf('.json') + 5 == file.length) {
                // .json 结尾
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

        // 根据id排序，item.id
        data = ApiUtil.sortArticle(data);
        
        JavaApi.putData('code', JSON.stringify(data));
    }
};