module.exports = {
    run: function() {
        // data
        // 读取app下所有目录
        // 添加路由
        // 合并游戏数据
        // D:\www\solo-coding\src\html\index\app
        var filesJson = JavaApi.files('@/src/html/index/article');
        var files = JSON.parse(filesJson);
        var tagMap = {};
        for(var i in files) {
            var file = files[i];
            if(file.indexOf('.json') + 5 == file.length) {
                // .json 结尾
                var item = JSON.parse(JavaApi.read(file));
                var tags = item.tags;
                for(var j in tags) {
                    var tag = tags[j];
                    if(tagMap[tag] == null) {
                        tagMap[tag] = [item.id];
                    } else {
                        tagMap[tag].push(item.id);
                    }
                }
            }
        }
        
        JavaApi.putData('code', JSON.stringify(tagMap));
    }
};