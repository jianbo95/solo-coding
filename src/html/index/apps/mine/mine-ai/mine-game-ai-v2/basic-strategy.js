import GridPrinter from './grid-printer.js';


// 基础逻辑主要基于扫雷游戏中数字格子的两个基本推理规则：

// 1. 有雷推断
   
//    - 原理：如果一个数字格子周围未揭开的格子数量等于这个数字减去已标记的雷数，那么所有未揭开的格子都是雷
//    - 例子：如果数字是3，周围已经标记了1个雷，还有2个未揭开的格子，那么这2个未揭开的格子一定都是雷
//    - 数学表达：未标记雷数 = 数字值 - 已标记雷数 = 未揭开格子数
// 2. 无雷推断
   
//    - 原理：如果一个数字格子周围已标记的雷数等于这个数字，那么其他未揭开的格子一定不是雷
//    - 例子：如果数字是2，周围已经标记了2个雷，那么其他未揭开的格子一定是安全的
//    - 数学表达：已标记雷数 = 数字值
// 这两个规则是最基础的推理规则，它们：

// 1. 准确性高：基于严格的数学关系，推理结果100%准确
// 2. 容易理解：不需要复杂的逻辑链
// 3. 计算简单：只需要简单的数字比较
// 4. 普遍适用：在游戏的任何阶段都可以使用
// 但这些基础规则也有局限性，就是无法处理需要多个数字格子联合推理的复杂情况，这就需要更高级的策略来补充。

export default class BasicStrategy {
    constructor(debug) {
        this.debug = debug;
    }

    analyze(grid, rows, cols, revealedCells) {
        for (const cell of revealedCells) {
            const { row, col } = cell;
            
            // 验证格子有效性
            if (!this.isValidCell(grid, row, col)) {
                this.log(`跳过无效格子 [${row},${col}]（未揭开或不存在）`);
                continue;
            }

            const currentCell = grid[row][col];
            const adjacentMines = currentCell.adjacentMines;
            
            this.log(`\n=== 基础逻辑分析 ===`);
            this.log(`分析格子 [${row},${col}]:`);
            this.log(`- 类型: ${currentCell.isMine ? '雷' : '数字'}`);
            this.log(`- 状态: ${currentCell.revealed ? '已揭开' : '未揭开'}`);
            this.log(`- 周围雷数: ${adjacentMines}`);

            // 获取周围格子
            const neighbors = this.getSurroundingCells(grid, rows, cols, row, col);
            
            // 计算未揭开和已标记的格子
            const unrevealed = neighbors.filter(n => !n.cell.revealed && !n.cell.flagged);
            const flagged = neighbors.filter(n => n.cell.flagged);
            
            this.log(`\n周围格子状态:`);
            this.log(`- 总相邻格子: ${neighbors.length}`);
            this.log(`- 未揭开格子: ${unrevealed.length}`);
            this.log(`- 已标记雷数: ${flagged.length}`);
            
            // 打印所有邻居格子的详细信息
            neighbors.forEach(n => {
                this.log(`  [${n.row},${n.col}]: ${
                    n.cell.revealed ? '已揭开' : '未揭开'
                } ${n.cell.flagged ? '已标记' : '未标记'}`);
            });

            // 有雷推断：未标记雷数 = 数字值 - 已标记雷数 = 未揭开格子数
            const remainingMines = adjacentMines - flagged.length;
            if (remainingMines > 0 && remainingMines === unrevealed.length && unrevealed.length > 0) {
                this.log(`\n有雷推断:`);
                this.log(`1. 周围还需要 ${remainingMines} 个雷`);
                this.log(`2. 还有 ${unrevealed.length} 个未揭开格子`);
                this.log(`3. 数量相等，所以未揭开格子都是雷`);
                this.log(`4. 结论：格子 ${unrevealed.map(n => `[${n.row},${n.col}]`).join(', ')} 是雷`);
                
                return {
                    row: unrevealed[0].row,
                    col: unrevealed[0].col,
                    action: 'flag',
                    isGuess: false
                };
            }

            // 无雷推断：已标记雷数 = 数字值
            if (flagged.length === adjacentMines && unrevealed.length > 0) {
                this.log(`\n无雷推断:`);
                this.log(`1. 需要的雷数是 ${adjacentMines}`);
                this.log(`2. 已经标记了 ${flagged.length} 个雷`);
                this.log(`3. 数量相等，剩余未揭开格子都不是雷`);
                this.log(`4. 结论：格子 ${unrevealed.map(n => `[${n.row},${n.col}]`).join(', ')} 不是雷`);
                
                return {
                    row: unrevealed[0].row,
                    col: unrevealed[0].col,
                    action: 'reveal',
                    isGuess: false
                };
            }

            this.log('\n当前格子分析完成：未找到确定的推断');
        }
        
        this.log('\n基础逻辑分析结束：未找到确定的移动');
        return null;
    }

    // 验证格子有效性
    isValidCell(grid, row, col) {
        return grid[row] && 
               grid[row][col] && 
               grid[row][col].revealed && 
               !grid[row][col].isMine;
    }

    // 获取周围格子
    getSurroundingCells(grid, rows, cols, row, col) {
        const cells = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < rows && 
                    newCol >= 0 && newCol < cols) {
                    cells.push({
                        row: newRow,
                        col: newCol,
                        cell: grid[newRow][newCol]
                    });
                }
            }
        }
        return cells;
    }

    log(message) {
        if (this.debug) {
            console.log(`[BasicStrategy] ${message}`);
        }
    }
}