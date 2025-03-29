export default class Utils {
    /**
     * 收集格子信息
     */
    collectCellInfo(grid, rows, cols) {
        const unrevealedCells = [];
        const revealedCells = [];
        let flaggedCount = 0;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].flagged) {
                    flaggedCount++;
                }
                
                if (!grid[r][c].revealed && !grid[r][c].flagged) {
                    unrevealedCells.push({ row: r, col: c });
                } else if (grid[r][c].revealed && !grid[r][c].isMine) {
                    revealedCells.push({ row: r, col: c });
                }
            }
        }
        
        return { unrevealedCells, revealedCells, flaggedCount };
    }

    /**
     * 获取周围格子
     */
    getSurroundingCells(grid, rows, cols, row, col) {
        const surroundingCells = [];
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                surroundingCells.push({
                    row: r,
                    col: c,
                    cell: grid[r][c]
                });
            }
        }
        return surroundingCells;
    }

    /**
     * 获取周围未揭示的格子
     */
    getUnrevealedNeighbors(grid, rows, cols, row, col) {
        const neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    if (!grid[newRow][newCol].revealed && !grid[newRow][newCol].flagged) {
                        neighbors.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        return neighbors;
    }

    /**
     * 计算未揭开格子总数
     */
    countUnrevealed(grid, rows, cols) {
        let count = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!grid[r][c].revealed && !grid[r][c].flagged) {
                    count++;
                }
            }
        }
        return count;
    }

    countFlagsAroundBorders(grid, borderCells) {
        return borderCells.reduce((count, cell) => {
            return count + this.getSurroundingCells(grid, cell.row, cell.col)
                .filter(c => c.cell.flagged).length;
        }, 0);
    }

    countFlagsAroundCells(grid, cells) {
        return cells.reduce((count, cell) => {
            return count + this.getSurroundingCells(grid, grid.length, grid[0].length, cell.row, cell.col)
                .filter(c => c.cell.flagged).length;
        }, 0);
    }

    verifyResult(result, grid, type) {
        if (!result) return null;
        
        const cell = grid[result.row][result.col];
        const isCorrect = (result.action === 'flag') === cell.isMine;
        
        // 添加验证结果到返回对象中
        const verifiedResult = Object.assign({}, result, {
            isCorrect,
            type,
            actualState: cell.isMine ? 'mine' : 'safe'
        });
        
        // if (!isCorrect) {
        //     console.log('\n=== 推断错误 ===');
        //     console.log(`${type}推断格子 (${result.row}, ${result.col}) ${result.action === 'flag' ? '是雷' : '不是雷'}`);
        //     console.log(`实际情况: ${cell.isMine ? '是雷' : '不是雷'}`);
        // }
        
        return verifiedResult;
    }

    // 构建函数内打印对象
    buildFlog(isLog, _instance) {
        return function(...args) {
            if(isLog === false) return;
            if (_instance.debug) {
                _instance.log(...args);
            }
        };
    }

    /**
     * 检查两个区域的包含关系
     * @param {Array} region1 第一个区域
     * @param {Array} region2 第二个区域
     * @returns {Object} 包含关系结果
     */
    checkRegionContainment(region1, region2) {
        // 检查region2是否包含region1
        const is2ContainsRegion1 = region1.nodes.every(node1 => 
            region2.nodes.some(node2 => 
                node2.row === node1.row && node2.col === node1.col
            )
        );
        
        // 检查region1是否包含region2
        const is1ContainsRegion2 = region2.nodes.every(node2 => 
            region1.nodes.some(node1 => 
                node1.row === node2.row && node1.col === node2.col
            )
        );

        return {
            is2ContainsRegion1,
            is1ContainsRegion2
        };
    }

    /**
     * 查找未揭开的安全位置
     * @param {Array} grid 游戏网格
     * @param {Number} rows 行数
     * @param {Number} cols 列数
     * @returns {Object|null} 安全位置坐标或null
     */
    findUnrevealedSafeCell(grid, rows, cols) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = grid[row][col];
                if (!cell.revealed && cell.isSafe) {
                    return { row, col };
                }
            }
        }
        return null;
    }

}