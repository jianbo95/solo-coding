module.exports = {
    run: function() {
        // data
        // 读取app下所有目录
        // 添加路由
        // 合并游戏数据
        // D:\www\solo-coding\src\html\index\app
        var filesJson = JavaApi.files('@/src/html/index/app');
        var files = JSON.parse(filesJson);
        var data = {};
        for(var i in files) {
            var file = files[i];
            if(file.indexOf('game.json') + 9 == file.length()) {
                // .json 结尾
                continue;
            }
            if(file.indexOf('.json') + 5 == file.length()) {
                // .json 结尾
                var gameData = JSON.parse(JavaApi.read(file));
                data[gameData.id] = gameData;
            }
        }
        
        JavaApi.putData('code', JSON.stringify(data));
    }
};