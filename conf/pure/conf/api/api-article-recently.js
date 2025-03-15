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
                var item = JSON.parse(JavaApi.read(file));
                data.push(item);
            }
        }

        // 找到最近的5条记录
        data = ApiUtil.sortArticle(data);
        data = data.slice(0, 5); // 获取前5条记录
        JavaApi.putData('code', JSON.stringify(data));
    }
};