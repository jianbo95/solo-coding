function isMustBeMine(grid, x, y) {
    // 判断坐标是否合法且为未揭开格子
    if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length) return false;
    if (grid[x][y] !== '-' && grid[x][y] !== '+') return false;

    // 遍历周围八个方向
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            
            // 检查相邻数字格子
            if (nx >= 0 && nx < grid.length && ny >= 0 && ny < grid[0].length) {
                const cell = grid[nx][ny];
                
                if (/\d/.test(cell)) { // 找到数字格子
                    const number = parseInt(cell);
                    let mines = 0;
                    let candidates = [];

                    // 分析该数字的周边格子
                    for (let ax = -1; ax <= 1; ax++) {
                        for (let ay = -1; ay <= 1; ay++) {
                            const px = nx + ax;
                            const py = ny + ay;
                            
                            if (px >= 0 && px < grid.length && 
                                py >= 0 && py < grid[0].length) {
                                const val = grid[px][py];
                                
                                if (val === '+') mines++; // 已标记雷
                                if (val === '-') candidates.push([px, py]); // 候选格
                            }
                        }
                    }

                    // 核心逻辑：剩余雷数 = 需要雷数 - 已发现雷数
                    const remaining = number - mines;
                    
                    // 情况1：候选格数量刚好等于剩余雷数
                    if (remaining === candidates.length && candidates.length > 0) {
                        if (candidates.some(([cx, cy]) => cx === x && cy === y)) {
                            return true;
                        }
                    }

                    // 情况2：交叉验证（需要组合多个数字的逻辑）
                    candidates.forEach(([cx, cy]) => {
                        let requiredByAll = true;
                        
                        // 检查该候选格的所有关联数字
                        for (let ax = -1; ax <= 1; ax++) {
                            for (let ay = -1; ay <= 1; ay++) {
                                const px = cx + ax;
                                const py = cy + ay;
                                
                                if (px >= 0 && px < grid.length && 
                                    py >= 0 && py < grid[0].length) {
                                    const numCell = grid[px][py];
                                    
                                    if (/\d/.test(numCell)) {
                                        // 验证该数字的约束是否必须要求此格为雷
                                        const num = parseInt(numCell);
                                        let numMines = 0;
                                        let numCandidates = [];
                                        
                                        for (let bx = -1; bx <= 1; bx++) {
                                            for (let by = -1; by <= 1; by++) {
                                                const qx = px + bx;
                                                const qy = py + by;
                                                
                                                if (qx >= 0 && qx < grid.length && 
                                                    qy >= 0 && qy < grid[0].length) {
                                                    const val = grid[qx][qy];
                                                    if (val === '+') numMines++;
                                                    if (val === '-') numCandidates.push([qx, qy]);
                                                }
                                            }
                                        }
                                        
                                        const numRemaining = num - numMines;
                                        if (!numCandidates.some(([qx, qy]) => qx === cx && qy === cy && numRemaining > 0)) {
                                            requiredByAll = false;
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (requiredByAll && cx === x && cy === y) {
                            return true;
                        }
                    });
                }
            }
        }
    }
    return false;
}

// 测试用例
console.log(isMustBeMine(easyMap, 3, 2)); // 应返回 true