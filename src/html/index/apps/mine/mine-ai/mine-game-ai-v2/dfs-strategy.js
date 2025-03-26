import Utils from './utils.js';

export default class DFSStrategy {
    constructor(debug) {
        this.debug = debug;
        this.utils = new Utils();
        this.SEARCH_LIMIT = 10000000; // 搜索限制，类似 MineSolver.h 中的 SUMLIMIT
        this.DEEP_DFS_LIMIT = 1000;   // 深度DFS限制，类似 MineSolver.h 中的 DEEPDFSLIMIT
    }


    analyze(grid, rows, cols, revealedCells, remainingMines) {
        this.log('开始DFS分析...');
        const result = this.dfsAnalyze(grid, rows, cols, remainingMines);
        if (!result) return null;

        // 返回找到的安全格子或需要标记的雷
        return {
            row: result.row,
            col: result.col,
            action: result.isMine ? 'flag' : 'reveal',
            isGuess: false
        };
    }

    dfsAnalyze(grid, rows, cols, remainingMines) {
        // 收集未知格子和约束信息
        const unknownCells = [];
        const constraints = [];
        let searchCount = 0;

        // 构建约束网络
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (!cell.revealed && !cell.flagged) {
                    unknownCells.push({ row: r, col: c });
                    continue;
                }
                if (!cell.revealed || cell.isMine) continue;

                // 收集数字格子的约束
                const neighbors = this.utils.getSurroundingCells(grid, rows, cols, r, c);
                const unknownNeighbors = neighbors.filter(n => !n.cell.revealed && !n.cell.flagged);
                const flaggedCount = neighbors.filter(n => n.cell.flagged).length;

                if (unknownNeighbors.length > 0) {
                    constraints.push({
                        value: cell.adjacentMines - flaggedCount,
                        cells: unknownNeighbors
                    });
                }
            }
        }

        // 如果未知格子数量超过深度限制，跳过深度搜索
        if (unknownCells.length > this.DEEP_DFS_LIMIT) {
            this.log(`未知格子数量(${unknownCells.length})超过深度限制(${this.DEEP_DFS_LIMIT})，跳过深度搜索`);
            return null;
        }

        // 开始DFS搜索
        const visited = new Set();
        const result = {
            safeCells: new Set(),
            mineCells: new Set()
        };

        const dfs = (index, minesLeft, currentState) => {
            if (searchCount++ > this.SEARCH_LIMIT) return false;
            
            // 检查是否满足所有约束
            for (const constraint of constraints) {
                let mineCount = 0;
                for (const cell of constraint.cells) {
                    const key = `${cell.row},${cell.col}`;
                    if (currentState.has(key)) mineCount++;
                }
                if (mineCount > constraint.value) return false;
            }

            // 到达叶子节点，记录有效解
            if (index === unknownCells.length) {
                if (minesLeft === 0) {
                    for (let i = 0; i < unknownCells.length; i++) {
                        const key = `${unknownCells[i].row},${unknownCells[i].col}`;
                        if (currentState.has(key)) {
                            result.mineCells.add(key);
                        } else {
                            result.safeCells.add(key);
                        }
                    }
                }
                return true;
            }

            // 尝试放置地雷
            if (minesLeft > 0) {
                const key = `${unknownCells[index].row},${unknownCells[index].col}`;
                currentState.add(key);
                dfs(index + 1, minesLeft - 1, currentState);
                currentState.delete(key);
            }

            // 尝试不放置地雷
            dfs(index + 1, minesLeft, currentState);
        };

        // 执行DFS
        dfs(0, remainingMines, new Set());

        // 分析结果
        if (result.safeCells.size > 0) {
            const cell = result.safeCells.values().next().value.split(',');
            return { row: parseInt(cell[0]), col: parseInt(cell[1]), isMine: false };
        }
        if (result.mineCells.size > 0) {
            const cell = result.mineCells.values().next().value.split(',');
            return { row: parseInt(cell[0]), col: parseInt(cell[1]), isMine: true };
        }

        return null;
    }

    // 添加约束传播方法
    propagateConstraints(constraints, unknownCells) {
        const safeCells = new Set();
        const mineCells = new Set();
        let changed = true;

        while (changed) {
            changed = false;
            
            for (const constraint of constraints) {
                // 过滤掉已经确定的格子
                const unknownConstraintCells = constraint.cells.filter(cell => {
                    const key = `${cell.row},${cell.col}`;
                    return !safeCells.has(key) && !mineCells.has(key);
                });

                // 如果剩余雷数为0，所有未知格子都是安全的
                if (constraint.value === 0) {
                    unknownConstraintCells.forEach(cell => {
                        const key = `${cell.row},${cell.col}`;
                        if (!safeCells.has(key)) {
                            safeCells.add(key);
                            changed = true;
                        }
                    });
                }

                // 如果剩余雷数等于未知格子数，所有未知格子都是雷
                if (constraint.value === unknownConstraintCells.length) {
                    unknownConstraintCells.forEach(cell => {
                        const key = `${cell.row},${cell.col}`;
                        if (!mineCells.has(key)) {
                            mineCells.add(key);
                            changed = true;
                        }
                    });
                }
            }
        }

        return {
            safeCells,
            mineCells
        };
    }

    log(message) {
        if (this.debug) {
            console.log(`[DFSStrategy] ${message}`);
        }
    }
}