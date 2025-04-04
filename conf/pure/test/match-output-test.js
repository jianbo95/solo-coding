var matchOutput = require('../publish/util/match-output.js');
// 修复方法调用上下文问题
var output = matchOutput.outputByMatch.bind(matchOutput);
var output2 = matchOutput.outputByMatchArray.bind(matchOutput);

// 测试用例应该使用完整的参数列表
console.log(output('/app/Api.js', '/html/index/apps/(*)/**', '/html/index/apps/${1}/${1}.js'));
console.log(output('/app/a.js', '/app/**', '/static/merge.js'));  
console.log(output('/app/b/bb.js', '/app/**', '/static/merge.js'));
console.log(output('/app/a.js', '!/app/*', '/static/merge.js')); // false
console.log(output('/appx/a.js', '!/app/*', '/static/merge.js')); 
console.log(output(
    '/html/index/article/game/1_hannuota/1_hannuota.en.md', 
    '!/html/index/article/**', 
    '/html/index.js'
));

var o1 = '/html/index.js'
var m1 = [
    '!/html/index/article/**',
    '/html/index/**'
];
console.log(output2(
    '/html/index/article/game/1_hannuota/1_hannuota.en.md', 
    m1, 
    o1
));
console.log(output2(
    '/xxx/aa/bb.zip',
    '**.zip',
    'single'
));
console.log(output2(
    '/xxx/aa/bb.zip',
    '**.rar',
    'single'
));
// 预期 { match: false, output: null }
// 实际 { match: true, output: '/static/merge.js' }