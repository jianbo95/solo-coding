export default class MineGameAi {
    constructor() {
        this.guessCount = 0;
    }

    getGuessCount() {
        return this.guessCount;
    }

    getNextMove(grid, rows, cols, isGuessing = false, mineCount) {
        // 重置猜测计数
        if (!isGuessing) {
            this.guessCount = 0;
        }

        // 1. 先找出所有已揭开的格子周围的未揭开格子
        const unrevealedCells = [];
        const revealedCells = [];
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!grid[r][c].revealed && !grid[r][c].flagged) {
                    unrevealedCells.push({ row: r, col: c });
                } else if (grid[r][c].revealed && !grid[r][c].isMine) {
                    revealedCells.push({ row: r, col: c });
                }
            }
        }

        // 2. 基于已知信息进行推理
        for (const cell of revealedCells) {
            const move = this.analyzeCellSurroundings(grid, rows, cols, cell.row, cell.col);
            if (move) {
                return move;
            }
        }

        // 3. 如果没有确定的移动，尝试概率分析
        const probMove = this.probabilityAnalysis(grid, rows, cols, unrevealedCells);
        if (probMove) {
            if (probMove.isGuess) {
                this.guessCount++;
            }
            return probMove;
        }

        // 4. 如果还是没有移动，随机选择一个未揭开的格子
        if (unrevealedCells.length > 0) {
            this.guessCount++;
            const randomIndex = Math.floor(Math.random() * unrevealedCells.length);
            return {
                row: unrevealedCells[randomIndex].row,
                col: unrevealedCells[randomIndex].col,
                action: 'reveal',
                isGuess: true
            };
        }

        return null;
    }

    analyzeCellSurroundings(grid, rows, cols, row, col) {
        const cell = grid[row][col];
        if (!cell.revealed || cell.isMine) return null;

        // 获取周围未揭开的格子和已标记的地雷数
        const surroundingCells = this.getSurroundingCells(grid, rows, cols, row, col);
        const unrevealedCount = surroundingCells.filter(c => !c.cell.revealed && !c.cell.flagged).length;
        const flaggedCount = surroundingCells.filter(c => c.cell.flagged).length;

        // 如果周围未标记的地雷数等于剩余未揭开的格子数，全部标记为地雷
        if (cell.adjacentMines - flaggedCount === unrevealedCount && unrevealedCount > 0) {
            const unflaggedCell = surroundingCells.find(c => !c.cell.revealed && !c.cell.flagged);
            if (unflaggedCell) {
                return {
                    row: unflaggedCell.row,
                    col: unflaggedCell.col,
                    action: 'flag',
                    isGuess: false
                };
            }
        }

        // 如果已标记的地雷数等于周围的地雷数，其余格子可以安全揭开
        if (flaggedCount === cell.adjacentMines) {
            const safeCell = surroundingCells.find(c => !c.cell.revealed && !c.cell.flagged);
            if (safeCell) {
                return {
                    row: safeCell.row,
                    col: safeCell.col,
                    action: 'reveal',
                    isGuess: false
                };
            }
        }

        return null;
    }

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

    probabilityAnalysis(grid, rows, cols, unrevealedCells) {
        // 找出风险最低的未揭开格子
        let lowestRisk = 1;
        let bestMove = null;

        for (const cell of unrevealedCells) {
            const risk = this.calculateRisk(grid, rows, cols, cell.row, cell.col);
            if (risk < lowestRisk) {
                lowestRisk = risk;
                bestMove = cell;
            }
        }

        if (bestMove) {
            return {
                row: bestMove.row,
                col: bestMove.col,
                action: 'reveal',
                isGuess: lowestRisk > 0
            };
        }

        return null;
    }

    calculateRisk(grid, rows, cols, row, col) {
        const surroundingCells = this.getSurroundingCells(grid, rows, cols, row, col);
        const revealedNeighbors = surroundingCells.filter(c => c.cell.revealed && !c.cell.isMine);
        
        if (revealedNeighbors.length === 0) {
            return 0.5; // 没有已知信息的格子，返回中等风险
        }

        let totalRisk = 0;
        for (const neighbor of revealedNeighbors) {
            const neighborSurroundings = this.getSurroundingCells(grid, rows, cols, neighbor.row, neighbor.col);
            const unrevealedCount = neighborSurroundings.filter(c => !c.cell.revealed && !c.cell.flagged).length;
            const remainingMines = neighbor.cell.adjacentMines - neighborSurroundings.filter(c => c.cell.flagged).length;
            
            if (unrevealedCount > 0) {
                totalRisk += remainingMines / unrevealedCount;
            }
        }

        return totalRisk / revealedNeighbors.length;
    }

}