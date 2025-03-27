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
        
        if (!isCorrect) {
            console.log('\n=== 推断错误 ===');
            console.log(`${type}推断格子 (${result.row}, ${result.col}) ${result.action === 'flag' ? '是雷' : '不是雷'}`);
            console.log(`实际情况: ${cell.isMine ? '是雷' : '不是雷'}`);
        }
        
        return verifiedResult;
    }
}