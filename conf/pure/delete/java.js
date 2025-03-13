//从模块child_process引入spawn
const {spawn} = require('child_process');

var baseDir = "D:/www/jianbo_plus/h5/EAdmin-front/";
// 配置文件目录
var confDir = baseDir + "conf/pure/conf/";
// 前端目录
var frontDir = baseDir;

var jar = "D:/www/jianbo_plus/java/lowcode-boot-v3/lowcode-demo/i_smarthttp/target/smarthttp-1.0-jar-with-dependencies.jar";
 
const child = spawn('java', [`-jar`, `${jar}`, `confDir=${confDir}`, `frontDir=${frontDir}`]);

child.stdout.on('data', (data) => {
  console.log(`child stdout: ${data}`)
});

child.stderr.on('data', (data) => {
  console.error(`stderror ${data}`);
});

child.on('exit', function(code, signal){
  console.log('child process exited with' + `code ${code} and signal ${signal}`);
});