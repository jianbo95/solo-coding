// 通过环境变量获取NODE_PATH，获取失败则通过 whereis 命令获取
var NODE_PATH = process.env.NODE_PATH;

if(NODE_PATH == null) {
    // 通过whereis命令查找node_modules路径
    const execSync = require('child_process').execSync;
    try {
        const nodeExePath = execSync('whereis node').toString();
        // console.log('node_modules', nodeExePath);
        // 根据 node.exe 路径，获取node.exe的根目录
        // 通过 \ 最后一个字符位置，获取node.exe的根目录
        const nodeRootPath = nodeExePath.substring(0, nodeExePath.lastIndexOf('\\'));
        // 设置 NODE_PATH 环境变量
        NODE_PATH = nodeRootPath;
        // console.log('NODE_PATH is', NODE_PATH);
    } catch (e) {
        console.log('NODE_PATH is null.');
        console.log(e);
    }
}

const moduleAlias = require(NODE_PATH + '\\node_modules\\module-alias');
// 假设将 @ 映射到 src 目录
moduleAlias.addAlias('@', process.cwd());

console.log('load moduleAlias.');

require('@/conf/pure/test/java-api.js');

console.log('load JavaApi.');
console.log('load pre handle.');
console.log('\n');