import Utils from './utils.js';

export default class BasicStrategy {
    constructor() {
        this.utils = new Utils();
    }

    /**
     * 基础策略分析
     */
    analyze(grid, rows, cols, revealedCells) {
        for (const cell of revealedCells) {
            const move = this.analyzeCellSurroundings(grid, rows, cols, cell.row, cell.col);
            if (move) {
                return move;
            }
        }
        return null;
    }

    /**
     * 分析单个格子周围情况
     */
    analyzeCellSurroundings(grid, rows, cols, row, col) {
        const cell = grid[row][col];
        if (!cell.revealed || cell.isMine) return null;

        // 获取周围未揭开的格子和已标记的地雷数
        const surroundingCells = this.utils.getSurroundingCells(grid, rows, cols, row, col);
        const unrevealedCells = surroundingCells.filter(c => !c.cell.revealed && !c.cell.flagged);
        const flaggedCount = surroundingCells.filter(c => c.cell.flagged).length;

        // 如果周围未标记的地雷数等于剩余未揭开的格子数，全部标记为地雷
        if (cell.adjacentMines - flaggedCount === unrevealedCells.length && unrevealedCells.length > 0) {
            return {
                row: unrevealedCells[0].row,
                col: unrevealedCells[0].col,
                action: 'flag',
                isGuess: false
            };
        }

        // 如果已标记的地雷数等于周围的地雷数，其余格子可以安全揭开
        if (flaggedCount === cell.adjacentMines && unrevealedCells.length > 0) {
            return {
                row: unrevealedCells[0].row,
                col: unrevealedCells[0].col,
                action: 'reveal',
                isGuess: false
            };
        }

        return null;
    }
}