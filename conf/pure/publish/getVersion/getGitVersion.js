const { execSync } = require('child_process');
const path = require('path');
const tool = require('../../../util/tool.js');

function getGitVersionMap(repoPath) {
    try {
        // 切换到指定的仓库目录
        process.chdir(repoPath);

        // 获取所有提交历史中的文件及其对应的提交hash
        const output = execSync('git log --pretty=format:"%h" --name-only', { encoding: 'utf-8' });
        const commits = output.trim().split('\n\n');
        
        const versionMap = {};
        
        // 处理每个提交
        for (const commit of commits) {
            const lines = commit.split('\n');
            const hash = lines[0].replace(/"/g, '');
            const files = lines.slice(1);
            
            // 只记录每个文件的最新版本
            files.forEach(file => {
                if (file && !versionMap[file]) {
                    versionMap[file] = hash;
                }
            });
        }

        return versionMap;
    } catch (error) {
        console.error('获取 Git 版本映射失败:', error.message);
        return null;
    }
}

// 使用示例
// const repoPath = process.argv[2] || process.cwd();
const repoPath = tool.getRootPath();
const versionMap = getGitVersionMap(repoPath);

if (versionMap) {
    console.log('文件版本映射:');
    console.log(JSON.stringify(versionMap, null, 2));
}

module.exports = getGitVersionMap;