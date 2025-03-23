import Utils from './utils.js';

export default class PatternStrategy {
    constructor() {
        this.utils = new Utils();
        this.debug = true;
    }

    analyze(grid, rows, cols, revealedCells) {
        this.log('开始定式分析...');

        // 分析1-2定式
        for (const cell of revealedCells) {
            if (grid[cell.row][cell.col].adjacentMines === 1) {
                const result = this.checkOneTwo(grid, rows, cols, cell.row, cell.col);
                if (result) return result;
            }
        }

        return null;
    }

    checkOneTwo(grid, rows, cols, row, col) {
        const neighbors = this.utils.getSurroundingCells(grid, rows, cols, row, col);
        
        // 寻找相邻的2
        for (const neighbor of neighbors) {
            if (neighbor.cell.revealed && neighbor.cell.adjacentMines === 2) {
                // 获取重叠区域和非重叠区域
                const overlapping = this.getOverlappingCells(grid, rows, cols, row, col, neighbor.row, neighbor.col);
                const nonOverlapping1 = this.getNonOverlappingCells(grid, rows, cols, row, col, neighbor.row, neighbor.col);
                const nonOverlapping2 = this.getNonOverlappingCells(grid, rows, cols, neighbor.row, neighbor.col, row, col);

                // 检查重叠区域是否已有一个雷
                const overlappingFlags = overlapping.filter(cell => cell.cell.flagged).length;
                if (overlappingFlags === 1) {
                    // 数字1的非重叠区域应该安全
                    for (const cell of nonOverlapping1) {
                        if (!cell.cell.revealed && !cell.cell.flagged) {
                            return {
                                row: cell.row,
                                col: cell.col,
                                action: 'reveal',
                                isGuess: false
                            };
                        }
                    }
                    
                    // 数字2的非重叠区域应该有一个雷
                    const flags2 = nonOverlapping2.filter(cell => cell.cell.flagged).length;
                    if (flags2 === 0) {
                        const unrevealedCell = nonOverlapping2.find(cell => !cell.cell.revealed && !cell.cell.flagged);
                        if (unrevealedCell) {
                            return {
                                row: unrevealedCell.row,
                                col: unrevealedCell.col,
                                action: 'flag',
                                isGuess: false
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    getOverlappingCells(grid, rows, cols, row1, col1, row2, col2) {
        const cells1 = this.utils.getSurroundingCells(grid, rows, cols, row1, col1);
        const cells2 = this.utils.getSurroundingCells(grid, rows, cols, row2, col2);
        return cells1.filter(cell1 => 
            cells2.some(cell2 => cell2.row === cell1.row && cell2.col === cell1.col)
        );
    }

    getNonOverlappingCells(grid, rows, cols, row1, col1, row2, col2) {
        const cells1 = this.utils.getSurroundingCells(grid, rows, cols, row1, col1);
        const cells2 = this.utils.getSurroundingCells(grid, rows, cols, row2, col2);
        return cells1.filter(cell1 => 
            !cells2.some(cell2 => cell2.row === cell1.row && cell2.col === cell1.col)
        );
    }

    log(message) {
        if (this.debug) {
            console.log(`[PatternStrategy] ${message}`);
        }
    }
}