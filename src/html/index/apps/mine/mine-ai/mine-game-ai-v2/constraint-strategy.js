import Utils from './utils.js';

export default class ConstraintStrategy {
    constructor() {
        this.utils = new Utils();
        this.debug = true;
    }

    analyze(grid, rows, cols, revealedCells, remainingMines) {
        // 构建约束网络
        const constraints = this.buildConstraints(grid, rows, cols);
        if (constraints.length === 0) return null;

        // 约束传播
        const result = this.propagateConstraints(grid, constraints);
        if (!result) return null;

        // 处理确定的安全格子
        const safeCells = result.safeCells;
        if (safeCells.length > 0) {
            const [row, col] = safeCells[0].split(',').map(Number);
            return {
                row,
                col,
                action: 'reveal',
                isGuess: false
            };
        }

        // 处理确定的雷格子
        const mineCells = result.mineCells;
        if (mineCells.length > 0) {
            const [row, col] = mineCells[0].split(',').map(Number);
            return {
                row,
                col,
                action: 'flag',
                isGuess: false
            };
        }

        return null;
    }

    buildConstraints(grid, rows, cols) {
        const constraints = [];
        
        // 遍历所有已揭开的数字格子
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!grid[r][c].revealed || grid[r][c].isMine) continue;
                
                const cell = grid[r][c];
                const neighbors = this.utils.getSurroundingCells(grid, rows, cols, r, c);
                const unknownNeighbors = neighbors.filter(n => !n.cell.revealed && !n.cell.flagged);
                const flaggedCount = neighbors.filter(n => n.cell.flagged).length;
                
                if (unknownNeighbors.length > 0) {
                    constraints.push({
                        center: { row: r, col: c },
                        unknowns: unknownNeighbors.map(n => `${n.row},${n.col}`),
                        remainingMines: cell.adjacentMines - flaggedCount
                    });
                }
            }
        }
        
        return constraints;
    }

    propagateConstraints(grid, constraints) {
        const safeCells = new Set();
        const mineCells = new Set();
        let changed = true;

        while (changed) {
            changed = false;

            for (const constraint of constraints) {
                const { unknowns, remainingMines } = constraint;
                
                // 如果剩余雷数为0，所有未知格子都是安全的
                if (remainingMines === 0) {
                    unknowns.forEach(cell => safeCells.add(cell));
                    changed = true;
                }
                
                // 如果剩余雷数等于未知格子数，所有未知格子都是雷
                if (remainingMines === unknowns.length) {
                    unknowns.forEach(cell => mineCells.add(cell));
                    changed = true;
                }

                // 检查约束交集
                for (const other of constraints) {
                    if (other === constraint) continue;
                    
                    const intersection = unknowns.filter(cell => other.unknowns.includes(cell));
                    if (intersection.length === 0) continue;

                    // 如果一个约束的未知格子是另一个约束的子集，可以进行推导
                    if (this.isSubset(unknowns, other.unknowns)) {
                        const diff = this.difference(other.unknowns, unknowns);
                        if (other.remainingMines === remainingMines) {
                            diff.forEach(cell => safeCells.add(cell));
                            changed = true;
                        }
                    }
                }
            }
        }

        return {
            safeCells: Array.from(safeCells),
            mineCells: Array.from(mineCells)
        };
    }

    isSubset(arr1, arr2) {
        return arr1.every(item => arr2.includes(item));
    }

    difference(arr1, arr2) {
        return arr1.filter(item => !arr2.includes(item));
    }

    log(message) {
        if (this.debug) {
            console.log(`[ConstraintStrategy] ${message}`);
        }
    }
}