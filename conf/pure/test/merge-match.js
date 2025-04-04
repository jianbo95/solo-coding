var mergeConfig = {
    // 路径匹配
    '/static/merge.js': [
        '/app/*',
        '/static/lib/pure/*',
        '/main.js'
    ],
    '/html/index.js': [
        '!/apps/*',
        '!/article/*',
        '/html/index/*'
    ],
    "/html/index/apps/${1}.js": '/html/index/apps/(*)/**'
};

// var match = function(path, config) {
//     // 处理反向匹配
//     if (config.startsWith('!')) {
//         return !match(path, config.substring(1));
//     }

//     // 标准化路径格式
//     path = path.replace(/^\/+|\/+$/g, '');
//     config = config.replace(/^\/+|\/+$/g, '');

//     // 将配置模式转换为正则表达式
//     const pattern = config
//         .replace(/[.+?^${}|[\]\\]/g, '\\$&')
//         .replace(/\(\*\)/g, '([^/]+)')  // 修改：捕获组处理
//         .replace(/\*\*/g, '.*')         // 修改：处理 ** 通配符
//         .replace(/\*/g, '[^/]+');       // 修改：处理 * 通配符

//     // 创建正则表达式
//     const regex = new RegExp(`^${pattern}$`);

//     // 返回匹配结果
//     return {
//         isMatch: regex.test(path),
//         matches: path.match(regex)
//     };
// };

var output = function(path, matchPattern, outputPattern) {
    // 标准化路径
    path = path.replace(/^\/+|\/+$/g, '');
    matchPattern = matchPattern.replace(/^\/+|\/+$/g, '');
    
    // 构建正则表达式
    const pattern = matchPattern
        .replace(/[.+?^${}|[\]\\]/g, '\\$&')
        .replace(/\(\*\)/g, '([^/]+)')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]+');
    
    const regex = new RegExp(`^${pattern}$`);
    const matches = path.match(regex);

    if (!matches) {
        return {
            match: false,
            output: null
        };
    }

    // 处理输出路径
    let outputPath = outputPattern;
    if (matches.length > 1) {
        // 替换所有的 ${n} 变量
        for (let i = 1; i < matches.length; i++) {
            outputPath = outputPath.replace(new RegExp(`\\$\\{${i}\\}`, 'g'), matches[i]);
        }
    }

    return {
        match: true,
        output: outputPath
    };
};

console.log(output('/html/index/apps/mine/test.js', 
    '/html/index/apps/(*)/**', 
    "/html/index/apps/${1}/${1}.js")); 

console.log(output('/html/index/apps/mines/test.js', 
    '/html/index/apps/(*)/**', 
    "/html/index/apps/${1}/${1}.js"));

console.log(output('/html/index/software/mines/test.js', 
    '/html/index/software/(*)/**', 
    "/html/index/software/${1}/${1}.js"));
// {
//     match: true
//     output: '/html/index/apps/mine/mine.js'
// }
console.log(output('/app/a.js', 
    '/appx/*', 
    '/static/merge.js')); 
// {
//     match: true
//     output: '/static/merge.js'
// }
console.log('/app/Api.js', '/html/index/apps/(*)/**', '/html/index/apps/${1}/${1}.js');


// console.log(match('/app/dir/b.js', '/app/*')); // true
// console.log(match('/static/a.js', '/app/*')); // false
// console.log(match('/app/a.js', '!/app/*')); // false