/**
 * 约束推理策略
 * 分析数字和已知地雷的约束关系，确定安全格子和地雷格子
 */
export default class ConstraintStrategy {
    /**
     * 分析网格中的约束关系
     * @param {Array} grid 游戏网格
     * @param {Number} rows 行数
     * @param {Number} cols 列数
     * @param {Array} revealedCells 已揭示的格子
     * @returns {Object|null} 下一步操作或null
     */
    analyze(grid, rows, cols, revealedCells) {
        // 遍历所有已揭示的数字格子
        for (const cell of revealedCells) {
            const { row, col, value } = cell;
            
            // 跳过数字为0的格子
            if (value === 0) continue;
            
            // 获取周围的未揭示格子和已知地雷格子
            const neighbors = this.getNeighbors(grid, rows, cols, row, col);
            const unrevealedNeighbors = neighbors.filter(n => n.state === '-');
            const flaggedOrMineNeighbors = neighbors.filter(n => n.state === 'f' || n.state === '+');
            
            // 如果已知地雷数量等于数字值，则周围所有未揭示格子都是安全的
            if (flaggedOrMineNeighbors.length === value && unrevealedNeighbors.length > 0) {
                return {
                    row: unrevealedNeighbors[0].row,
                    col: unrevealedNeighbors[0].col,
                    action: 'reveal'
                };
            }
            
            // 如果未揭示格子数量加上已知地雷数量等于数字值，则所有未揭示格子都是地雷
            if (unrevealedNeighbors.length + flaggedOrMineNeighbors.length === value && 
                flaggedOrMineNeighbors.length < value && unrevealedNeighbors.length > 0) {
                return {
                    row: unrevealedNeighbors[0].row,
                    col: unrevealedNeighbors[0].col,
                    action: 'flag'
                };
            }
        }
        
        // 进行更复杂的约束分析
        return this.analyzeAdvancedConstraints(grid, rows, cols, revealedCells);
    }
    
    /**
     * 获取指定格子的相邻格子
     * @param {Array} grid 游戏网格
     * @param {Number} rows 行数
     * @param {Number} cols 列数
     * @param {Number} row 行索引
     * @param {Number} col 列索引
     * @returns {Array} 相邻格子数组
     */
    getNeighbors(grid, rows, cols, row, col) {
        const neighbors = [];
        
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                neighbors.push({
                    row: r,
                    col: c,
                    state: grid[r][c]
                });
            }
        }
        
        return neighbors;
    }
    
    /**
     * 分析复杂约束关系
     * @param {Array} grid 游戏网格
     * @param {Number} rows 行数
     * @param {Number} cols 列数
     * @param {Array} revealedCells 已揭示的格子
     * @returns {Object|null} 下一步操作或null
     */
    analyzeAdvancedConstraints(grid, rows, cols, revealedCells) {
        // 构建数字格子的约束图
        const numberCells = revealedCells.filter(cell => cell.value > 0);
        
        // 对于每个数字格子，检查它是否与其他数字格子共享未揭示的格子
        for (let i = 0; i < numberCells.length; i++) {
            const cell1 = numberCells[i];
            const neighbors1 = this.getNeighbors(grid, rows, cols, cell1.row, cell1.col);
            const unrevealed1 = neighbors1.filter(n => n.state === '-');
            const mines1 = neighbors1.filter(n => n.state === 'f' || n.state === '+').length;
            const remainingMines1 = cell1.value - mines1;
            
            // 如果这个格子周围的地雷已经全部找到，则其余未揭示格子都是安全的
            if (remainingMines1 === 0 && unrevealed1.length > 0) {
                return {
                    row: unrevealed1[0].row,
                    col: unrevealed1[0].col,
                    action: 'reveal'
                };
            }
            
            for (let j = i + 1; j < numberCells.length; j++) {
                const cell2 = numberCells[j];
                
                // 检查两个格子是否足够近，可能共享未揭示格子
                if (Math.abs(cell1.row - cell2.row) <= 2 && Math.abs(cell1.col - cell2.col) <= 2) {
                    const neighbors2 = this.getNeighbors(grid, rows, cols, cell2.row, cell2.col);
                    const unrevealed2 = neighbors2.filter(n => n.state === '-');
                    const mines2 = neighbors2.filter(n => n.state === 'f' || n.state === '+').length;
                    const remainingMines2 = cell2.value - mines2;
                    
                    // 找出两个格子共享的未揭示格子
                    const sharedUnrevealed = unrevealed1.filter(n1 => 
                        unrevealed2.some(n2 => n1.row === n2.row && n1.col === n2.col)
                    );
                    
                    // 找出格子1独有的未揭示格子
                    const uniqueUnrevealed1 = unrevealed1.filter(n1 => 
                        !unrevealed2.some(n2 => n1.row === n2.row && n1.col === n2.col)
                    );
                    
                    // 找出格子2独有的未揭示格子
                    const uniqueUnrevealed2 = unrevealed2.filter(n2 => 
                        !unrevealed1.some(n1 => n2.row === n1.row && n2.col === n1.col)
                    );
                    
                    // 如果格子1的剩余地雷数等于共享格子数，则格子1独有的未揭示格子都是安全的
                    if (remainingMines1 === sharedUnrevealed.length && uniqueUnrevealed1.length > 0) {
                        return {
                            row: uniqueUnrevealed1[0].row,
                            col: uniqueUnrevealed1[0].col,
                            action: 'reveal'
                        };
                    }
                    
                    // 如果格子2的剩余地雷数等于共享格子数，则格子2独有的未揭示格子都是安全的
                    if (remainingMines2 === sharedUnrevealed.length && uniqueUnrevealed2.length > 0) {
                        return {
                            row: uniqueUnrevealed2[0].row,
                            col: uniqueUnrevealed2[0].col,
                            action: 'reveal'
                        };
                    }
                    
                    // 如果格子1的剩余地雷数减去共享格子数等于格子1独有的未揭示格子数，则格子1独有的未揭示格子都是地雷
                    if (remainingMines1 - sharedUnrevealed.length === uniqueUnrevealed1.length && uniqueUnrevealed1.length > 0) {
                        return {
                            row: uniqueUnrevealed1[0].row,
                            col: uniqueUnrevealed1[0].col,
                            action: 'flag'
                        };
                    }
                    
                    // 如果格子2的剩余地雷数减去共享格子数等于格子2独有的未揭示格子数，则格子2独有的未揭示格子都是地雷
                    if (remainingMines2 - sharedUnrevealed.length === uniqueUnrevealed2.length && uniqueUnrevealed2.length > 0) {
                        return {
                            row: uniqueUnrevealed2[0].row,
                            col: uniqueUnrevealed2[0].col,
                            action: 'flag'
                        };
                    }
                    
                    // 处理您描述的情况：如果一个数字的地雷需求已被满足，则其他相关数字的未揭示格子是安全的
                    if (remainingMines1 === 0 && sharedUnrevealed.length > 0) {
                        // 如果格子1已满足地雷需求，则共享格子都是安全的
                        return {
                            row: sharedUnrevealed[0].row,
                            col: sharedUnrevealed[0].col,
                            action: 'reveal'
                        };
                    }
                    
                    if (remainingMines2 === 0 && sharedUnrevealed.length > 0) {
                        // 如果格子2已满足地雷需求，则共享格子都是安全的
                        return {
                            row: sharedUnrevealed[0].row,
                            col: sharedUnrevealed[0].col,
                            action: 'reveal'
                        };
                    }
                }
            }
        }
        
        // 尝试分析更复杂的约束关系
        return this.analyzeNeighborConstraints(grid, rows, cols, revealedCells);
    }
    
    /**
     * 分析相邻数字之间的约束关系
     * @param {Array} grid 游戏网格
     * @param {Number} rows 行数
     * @param {Number} cols 列数
     * @param {Array} revealedCells 已揭示的格子
     * @returns {Object|null} 下一步操作或null
     */
    analyzeNeighborConstraints(grid, rows, cols, revealedCells) {
        // 构建数字格子的约束图
        const numberCells = revealedCells.filter(cell => cell.value > 0);
        
        // 对于每个数字格子，检查它的相邻数字格子
        for (const cell of numberCells) {
            const { row, col, value } = cell;
            
            // 获取周围的未揭示格子和已知地雷格子
            const neighbors = this.getNeighbors(grid, rows, cols, row, col);
            const flaggedOrMineNeighbors = neighbors.filter(n => n.state === 'f' || n.state === '+');
            const remainingMines = value - flaggedOrMineNeighbors.length;
            
            // 如果剩余地雷数为0，检查是否有相邻的数字格子
            if (remainingMines === 0) {
                // 获取相邻的数字格子
                const neighborNumberCells = neighbors.filter(n => {
                    if (n.state !== '0' && n.state !== '1' && n.state !== '2' && 
                        n.state !== '3' && n.state !== '4' && n.state !== '5' && 
                        n.state !== '6' && n.state !== '7' && n.state !== '8') {
                        return false;
                    }
                    return true;
                });
                
                // 对于每个相邻的数字格子
                for (const neighborCell of neighborNumberCells) {
                    const neighborValue = parseInt(neighborCell.state);
                    const neighborNeighbors = this.getNeighbors(grid, rows, cols, neighborCell.row, neighborCell.col);
                    const neighborFlaggedOrMineNeighbors = neighborNeighbors.filter(n => n.state === 'f' || n.state === '+');
                    const neighborRemainingMines = neighborValue - neighborFlaggedOrMineNeighbors.length;
                    
                    // 获取相邻格子的未揭示格子
                    const neighborUnrevealed = neighborNeighbors.filter(n => n.state === '-');
                    // 找出不与当前格子共享的未揭示格子
                    const uniqueNeighborUnrevealed = neighborUnrevealed.filter(n1 => {
                        return !neighbors.some(n2 => n1.row === n2.row && n1.col === n2.col);
                    });
                    
                    // 如果相邻格子的剩余地雷数等于其独有的未揭示格子数，则这些格子都是地雷
                    if (neighborRemainingMines === uniqueNeighborUnrevealed.length && uniqueNeighborUnrevealed.length > 0) {
                        return {
                            row: uniqueNeighborUnrevealed[0].row,
                            col: uniqueNeighborUnrevealed[0].col,
                            action: 'flag'
                        };
                    }
                    
                    // 如果相邻格子的剩余地雷数为0，则其所有未揭示格子都是安全的
                    if (neighborRemainingMines === 0 && neighborUnrevealed.length > 0) {
                        return {
                            row: neighborUnrevealed[0].row,
                            col: neighborUnrevealed[0].col,
                            action: 'reveal'
                        };
                    }
                    
                    // 处理您描述的情况：如果一个数字的地雷需求已被满足，则其他相关数字的未揭示格子是安全的
                    // 例如：如果格子A周围的地雷已全部找到，而格子B与A共享一些格子，则B的其他未揭示格子可能是安全的
                    const sharedCells = neighborNeighbors.filter(n1 => 
                        neighbors.some(n2 => n1.row === n2.row && n1.col === n2.col && (n1.state === 'f' || n1.state === '+'))
                    );
                    
                    // 如果共享的地雷数量等于相邻格子的剩余地雷数，则其独有的未揭示格子都是安全的
                    if (sharedCells.length === neighborRemainingMines && uniqueNeighborUnrevealed.length > 0) {
                        return {
                            row: uniqueNeighborUnrevealed[0].row,
                            col: uniqueNeighborUnrevealed[0].col,
                            action: 'reveal'
                        };
                    }
                }
            }
        }
            
        return null;
    }
}