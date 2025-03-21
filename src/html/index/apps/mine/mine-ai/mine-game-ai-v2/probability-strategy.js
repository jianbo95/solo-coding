import Utils from './utils.js';

export default class ProbabilityStrategy {
    constructor() {
        this.utils = new Utils();
    }

    /**
     * 概率分析
     */
    analyze(grid, rows, cols, unrevealedCells, remainingMines) {
        if (unrevealedCells.length === 0) return null;

        // 计算每个未揭开格子的风险值
        const cellRisks = [];
        
        for (const cell of unrevealedCells) {
            const risk = this.calculateRisk(grid, rows, cols, cell.row, cell.col, remainingMines);
            cellRisks.push(Util.mergeMap(cell, { risk }));
        }
        
        // 按风险值排序
        cellRisks.sort((a, b) => a.risk - b.risk);
        
        // 选择风险最低的格子
        const bestCell = cellRisks[0];
        
        return {
            row: bestCell.row,
            col: bestCell.col,
            action: 'reveal',
            isGuess: bestCell.risk > 0,
            risk: bestCell.risk
        };
    }

    /**
     * 计算风险值
     */
    calculateRisk(grid, rows, cols, row, col, remainingMines) {
        const surroundingCells = this.utils.getSurroundingCells(grid, rows, cols, row, col);
        const revealedNeighbors = surroundingCells.filter(c => c.cell.revealed && !c.cell.isMine);
        
        if (revealedNeighbors.length === 0) {
            // 没有已知信息的格子，使用全局概率
            const totalUnrevealed = this.utils.countUnrevealed(grid, rows, cols);
            return remainingMines / totalUnrevealed;
        }

        let totalRisk = 0;
        let weightSum = 0;
        
        for (const neighbor of revealedNeighbors) {
            const neighborSurroundings = this.utils.getSurroundingCells(grid, rows, cols, neighbor.row, neighbor.col);
            const unrevealedCount = neighborSurroundings.filter(c => !c.cell.revealed && !c.cell.flagged).length;
            const flaggedCount = neighborSurroundings.filter(c => c.cell.flagged).length;
            const remainingNeighborMines = neighbor.cell.adjacentMines - flaggedCount;
            
            if (unrevealedCount > 0) {
                const localRisk = remainingNeighborMines / unrevealedCount;
                // 权重基于未揭开格子数量的倒数，使得信息更确定的格子权重更高
                const weight = 1 / unrevealedCount;
                totalRisk += localRisk * weight;
                weightSum += weight;
            }
        }
        
        if (weightSum === 0) {
            // 如果没有有效的权重，使用全局概率
            const totalUnrevealed = this.utils.countUnrevealed(grid, rows, cols);
            return remainingMines / totalUnrevealed;
        }
        
        return totalRisk / weightSum;
    }
    
    /**
     * 高级概率分析 - 使用CSP (约束满足问题) 求解
     * 这是一个更复杂的实现，可以处理更多情况
     */
    advancedProbabilityAnalysis(grid, rows, cols, unrevealedCells, remainingMines) {
        // 构建约束网络
        const constraints = this.buildConstraints(grid, rows, cols);
        
        // 使用回溯搜索计算每个格子的雷概率
        const probabilities = this.calculateProbabilities(constraints, unrevealedCells, remainingMines);
        
        // 选择概率最低的格子
        let minProb = 1;
        let bestCell = null;
        
        for (const cell of unrevealedCells) {
            const key = `${cell.row},${cell.col}`;
            const prob = probabilities[key] || (remainingMines / unrevealedCells.length);
            
            if (prob < minProb) {
                minProb = prob;
                bestCell = cell;
            }
        }
        
        if (bestCell) {
            return {
                row: bestCell.row,
                col: bestCell.col,
                action: 'reveal',
                isGuess: minProb > 0,
                risk: minProb
            };
        }
        
        return null;
    }
    
    /**
     * 构建约束网络
     */
    buildConstraints(grid, rows, cols) {
        const constraints = [];
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].revealed && !grid[r][c].isMine) {
                    const surroundingCells = this.utils.getSurroundingCells(grid, rows, cols, r, c);
                    const unrevealedCells = surroundingCells
                        .filter(cell => !cell.cell.revealed && !cell.cell.flagged)
                        .map(cell => `${cell.row},${cell.col}`);
                    
                    const flaggedCount = surroundingCells.filter(cell => cell.cell.flagged).length;
                    const remainingMines = grid[r][c].adjacentMines - flaggedCount;
                    
                    if (unrevealedCells.length > 0) {
                        constraints.push({
                            cells: unrevealedCells,
                            mines: remainingMines
                        });
                    }
                }
            }
        }
        
        return constraints;
    }
    
    /**
     * 计算概率 (简化版)
     */
    calculateProbabilities(constraints, unrevealedCells, remainingMines) {
        // 简化版本 - 实际实现需要使用回溯搜索
        const probabilities = {};
        
        // 默认概率 - 全局概率
        const defaultProb = remainingMines / unrevealedCells.length;
        
        for (const cell of unrevealedCells) {
            const key = `${cell.row},${cell.col}`;
            probabilities[key] = defaultProb;
        }
        
        // 应用约束调整概率
        for (const constraint of constraints) {
            if (constraint.cells.length === constraint.mines) {
                // 如果约束中的格子数等于雷数，所有格子都是雷
                for (const cellKey of constraint.cells) {
                    probabilities[cellKey] = 1;
                }
            } else if (constraint.mines === 0) {
                // 如果约束中没有雷，所有格子都是安全的
                for (const cellKey of constraint.cells) {
                    probabilities[cellKey] = 0;
                }
            }
        }
        
        return probabilities;
    }
}