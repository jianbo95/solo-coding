module.exports ={ 
    outputByMatchArray(path, matchPatternArray, outputPattern) {
        // 判断 matchPatternArray 是否为数组，不是数组则 matchPatternArray = [matchPatternArray]
        if(!Array.isArray(matchPatternArray)) {
            matchPatternArray = [matchPatternArray];
        }
        for(let matchPattern of matchPatternArray) {
            const result = this.outputByMatch(path, matchPattern, outputPattern);
            if(result.match === true) {
                return result;
            } else if(result.type === 'reverse') {
                return result;
            }
        }
        return {
            match: false,
            output: null
        }
    },
    outputByMatch(path, matchPattern, outputPattern) {
        // 处理反向匹配
        if (matchPattern.startsWith('!')) {
            const result = this.outputByMatch(path, matchPattern.substring(1), outputPattern);
            if(result.match === true) {
                return {
                    match: false,
                    type: 'reverse',
                    output: null
                };
            }
        }

        // 标准化路径
        path = path.replace(/^\/+|\/+$/g, '');
        matchPattern = matchPattern.replace(/^\/+|\/+$/g, '');
        
       // 构建正则表达式（关键修改）
       const pattern = matchPattern
       .replace(/[.+?^${}|[\]\\]/g, '\\$&')
       .replace(/\(\*\)/g, '([^/]+)')
       .replace(/\*\*/g, '(.+)')  // 修改为匹配任意非空内容
       .replace(/\*/g, '[^/]*');
   
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
    }
};

