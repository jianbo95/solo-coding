import GridPrinter from './grid-printer.js';

export default class BasicStrategy {
    constructor() {
        this.debug = false;
    }

    analyze(grid, rows, cols, revealedCells) {
        for (const cell of revealedCells) {
            const row = cell.row;
            const col = cell.col;
            
            if (!this.isValidCell(grid, row, col)) {
                this.log(`跳过无效格子 [${row},${col}]（未揭开或不存在）`);
                continue;
            }

            // 新增：打印当前格子详细信息
            this.log(`分析格子 [${row},${col}] 类型：${grid[row][col].isMine ? '雷' : '数字'} 状态：${
                grid[row][col].revealed ? '已揭开' : '未揭开'
            }`);

            const neighbors = this.getSurroundingCells(grid, rows, cols, row, col);
            const unrevealed = neighbors.filter(n => !n.cell.revealed && !n.cell.flagged);
            const flagged = neighbors.filter(n => n.cell.flagged).length;

            // 第2列，第3行
            // 邻居 [1,2] 状态：未揭开 标记：否 类型：安全
            // 新增：打印每个邻居格子的状态
            neighbors.forEach(n => {
                this.log(`-- 邻居 [${n.row},${n.col}] `
                    + `状态：${n.cell.revealed}:${ n.cell.revealed ? '已揭开' : '未揭开'}`
                    + `标记：${n.cell.flagged}:${n.cell.flagged ? '是' : '否'} `
                    + `类型：${n.cell.isMine}:${n.cell.isMine ? '雷' : '安全'}`);
            });
            
            this.log(`分析格子 [${row},${col}] 数字${grid[row][col].adjacentMines}`);
            this.log(`- 周围未揭开: ${unrevealed.length}, 已标记: ${flagged}`);

            // 情况1: 如果未标记的雷数等于未揭开的格子数，全部是雷
            if (grid[row][col].adjacentMines - flagged === unrevealed.length && unrevealed.length > 0) {

                // 打印当前网格状态
                GridPrinter.printGrid(grid, rows, cols);
                GridPrinter.printMine(grid, rows, cols);
                // 打印揭开和未揭开状态
                GridPrinter.printRevealed(grid, rows, cols);
                // 下一行打印日志里显示剩余雷数
                const remainingMines = grid[row][col].adjacentMines - flagged;
                // 判断 grid[row][col] 是不是未揭开格子，是的化，则跳过当前分析
                // 如果当前格子未揭开，跳过分析
                if (!grid[row][col].revealed) {
                    this.log(`- 跳过：当前格子[${row},${col}]未揭开，不能分析`);
                    continue;
                }
                // console.log(`当前格子[${row},${col}]`, grid[row][col].revealed);
                this.log(`- 发现: 剩余雷数${remainingMines}等于未揭开格子数${unrevealed.length}，标记所有未揭开格子为雷`);
                return {
                    row: unrevealed[0].row,
                    col: unrevealed[0].col,
                    action: 'flag',
                    isGuess: false
                };
            }

            // 情况2: 如果已标记的雷数等于数字，其他未揭开的都不是雷
            var n1 = grid[row][col].adjacentMines;
            if (grid[row][col].adjacentMines === flagged && unrevealed.length > 0) {
                this.log(`- 发现: 已标记雷数${flagged}等于数字${n1}，剩余未揭开格子安全`);
                return {
                    row: unrevealed[0].row,
                    col: unrevealed[0].col,
                    action: 'reveal',
                    isGuess: false
                };
            }

            // 排除法：如果已标记的雷数等于中心数字，其他未揭开格子都是安全的
            var flaggedCount = neighbors.filter(n => n.cell.flagged).length;
            const unrevealedCount = neighbors.filter(n => !n.cell.revealed && !n.cell.flagged).length;
            if (flaggedCount === grid[row][col].adjacentMines && unrevealedCount > 0) {
                const safeCell = neighbors.find(n => !n.cell.revealed && !n.cell.flagged);
                if (safeCell) {
                    this.log(`排除法发现`);
                    return {
                        row: safeCell.row,
                        col: safeCell.col,
                        action: 'reveal',
                        isGuess: false
                    };
                }
            }

            this.log(`- 结果: 无法确定`);
        }
        
        this.log('基础逻辑分析完成: 未找到确定的移动');
        return null;
    }

    // 新增验证方法
    isValidCell(grid, row, col) {
        return grid[row] && 
               grid[row][col] && 
               grid[row][col].revealed && 
               !grid[row][col].isMine;
    }

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