const tool = require('../../../util/tool.js');
const fs = require('fs');
const path = require('path');
const repoPath = tool.getRootPath();

function getFileTimeMap(dirPath = repoPath) {
    const timeMap = {};

    function walkDir(currentPath) {
        const files = fs.readdirSync(currentPath);
        
        for (const file of files) {
            const fullPath = path.join(currentPath, file);
            const relativePath = path.relative(repoPath, fullPath);
            
            // 跳过 node_modules 和 .git 目录
            if (file === 'node_modules' || file === '.git') {
                continue;
            }

            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                walkDir(fullPath);
            } else {
                // 将反斜杠转换为正斜杠
                timeMap[fullPath.replace(/\\/g, '/')] = stat.mtimeMs;
            }
        }
    }

    walkDir(dirPath);
    return timeMap;
}

module.exports = getFileTimeMap;