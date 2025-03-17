export default class MinesweeperAIV2 {
    constructor() {
        this.guessCount = 0;
        this.successRateList = [];
    }

    getGuessCount() {
        return this.guessCount;
    }

    // 模拟AI玩游戏
    play(grid, rows, cols, totalMines) {
        this.grid = JSON.parse(JSON.stringify(grid)); grid = this.grid;
        this.rows = JSON.parse(JSON.stringify(rows)); rows = this.rows;
        this.cols = JSON.parse(JSON.stringify(cols)); cols = this.cols;
        this.guessCount = 0;
        
        let revealedCount = 0;
        const totalCells = rows * cols;
        let firstMove = true;

        while (true) {
            const move = this.getNextMove(grid, rows, cols, firstMove);
            if (!move) return 'failure';

            firstMove = false;

            if (move.action === 'reveal') {
                const cell = grid[move.row][move.col];
                if (cell.isMine) {
                    return 'failure';
                }
                
                if (!cell.revealed) {
                    cell.revealed = true;
                    revealedCount++;
                }

                // 检查是否获胜（已经揭开所有非雷格子）
                if (revealedCount === totalCells - totalMines) {
                    // 计算成功率
                    const successRate = (this.successRateList.reduce((a, b) => a + b, 0) / this.successRateList.length).toFixed(2);
                    console.log('this.successRateList', this.successRateList);
                    console.log('successRate', successRate);
                    return 'success';
                }
            } else if (move.action === 'flag') {
                grid[move.row][move.col].flagged = true;
            }
        }
    }
    getNextMove(grid, rows, cols, firstMove, cheatMode = true) {
        this.grid = grid;
        this.rows = rows;
        this.cols = cols;

        // 1. 首先寻找安全的格子
        const safeMove = this.findSafeMove();
        if (safeMove) return { ...safeMove, action: 'reveal' };

        // 2. 标记确定是雷的格子
        const mineMove = this.findDefiniteMine();
        if (mineMove) return { ...mineMove, action: 'flag' };
        
        // 3. 如果没有确定的选择，根据是否开启作弊模式选择下一步
        const next = cheatMode ? this.cheatFindMove() : this.findProbableMove();
        if(cheatMode) {
            // 计算所有可能选择的失败概率
            const candidates = [];
            const probs = this.calculateCellProbabilities();
            
            if (probs.length > 0) {
                // 获取最低风险值
                const minProb = Math.min(...probs.map(p => p.probability));
                // 收集所有最低风险的候选格子
                candidates.push(...probs.filter(p => p.probability === minProb));
            } else {
                // 获取边缘格子或所有未揭开格子作为候选
                const edges = this.getEdgeCells();
                if (edges.length > 0) {
                    candidates.push(...edges);
                } else {
                    // 收集所有未揭开的非标记格子
                    for (let row = 0; row < rows; row++) {
                        for (let col = 0; col < cols; col++) {
                            if (!grid[row][col].revealed && !grid[row][col].flagged) {
                                candidates.push({ row, col });
                            }
                        }
                    }
                }
            }

            // 计算失败概率
            if (candidates.length > 0) {
                const mineCount = candidates.filter(c => grid[c.row][c.col].isMine).length;
                const failureRate = (mineCount / candidates.length) * 100;
                const successRate = 100 - failureRate;
                // 收集成功的概率
                this.successRateList.push(Number(successRate.toFixed(2)));
            }
        }
        if(firstMove == false) {
            this.guessCount ++;
        }
        return next;
    }
    cheatFindMove() {
        // 遍历所有未揭开的格子，找到一个非雷格子
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.grid[row][col].revealed && 
                    !this.grid[row][col].flagged && 
                    !this.grid[row][col].isMine) {
                    return { row, col, action: 'reveal' };
                }
            }
        }
        return null;
    }

    findSafeMove() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].revealed && !this.grid[row][col].isMine) {
                    const adjacentUnrevealed = this.getAdjacentUnrevealed(row, col);
                    const adjacentFlags = this.getAdjacentFlags(row, col);
                    
                    if (adjacentFlags === this.grid[row][col].adjacentMines &&
                        adjacentUnrevealed.length > 0) {
                        return adjacentUnrevealed[0];
                    }
                }
            }
        }
        return null;
    }

    findDefiniteMine() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].revealed && !this.grid[row][col].isMine) {
                    const adjacentUnrevealed = this.getAdjacentUnrevealed(row, col);
                    const adjacentFlags = this.getAdjacentFlags(row, col);
                    
                    if (adjacentUnrevealed.length > 0 &&
                        adjacentUnrevealed.length + adjacentFlags === this.grid[row][col].adjacentMines) {
                        return adjacentUnrevealed[0];
                    }
                }
            }
        }
        return null;
    }

    findProbableMove() {
        // 如果是第一步，选择角落位置
        if (this.isFirstMove()) {
            return { row: 0, col: 0, action: 'reveal' };
        }

        // 计算每个未揭开格子的风险值
        const cellProbabilities = this.calculateCellProbabilities();
        
        // 如果有计算出的概率，选择风险最低的格子
        if (cellProbabilities.length > 0) {
            // 按风险从低到高排序
            cellProbabilities.sort((a, b) => a.probability - b.probability);
            return { row: cellProbabilities[0].row, col: cellProbabilities[0].col, action: 'reveal' };
        }

        // 如果无法计算概率，选择边缘格子（靠近已揭开格子的未揭开格子）
        const edgeCells = this.getEdgeCells();
        if (edgeCells.length > 0) {
            // 随机选择一个边缘格子
            const randomIndex = Math.floor(Math.random() * edgeCells.length);
            return { row: edgeCells[randomIndex].row, col: edgeCells[randomIndex].col, action: 'reveal' };
        }

        // 如果没有边缘格子，随机选择一个未揭开的格子
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.grid[row][col].revealed && !this.grid[row][col].flagged) {
                    return { row, col, action: 'reveal' };
                }
            }
        }
        return null;
    }

    // 计算每个未揭开格子是雷的概率
    calculateCellProbabilities() {
        const cellProbabilities = [];
        const visited = Array(this.rows).fill().map(() => Array(this.cols).fill(false));

        // 遍历所有已揭开的格子
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].revealed && !this.grid[row][col].isMine) {
                    const adjacentUnrevealed = this.getAdjacentUnrevealed(row, col);
                    const adjacentFlags = this.getAdjacentFlags(row, col);
                    
                    // 计算周围未揭开格子是雷的概率
                    if (adjacentUnrevealed.length > 0) {
                        const mineProbability = (this.grid[row][col].adjacentMines - adjacentFlags) / adjacentUnrevealed.length;
                        
                        // 为每个未揭开的格子添加概率
                        for (const cell of adjacentUnrevealed) {
                            if (!visited[cell.row][cell.col]) {
                                cellProbabilities.push({
                                    row: cell.row,
                                    col: cell.col,
                                    probability: mineProbability
                                });
                                visited[cell.row][cell.col] = true;
                            }
                        }
                    }
                }
            }
        }
        
        return cellProbabilities;
    }

    // 获取边缘格子（靠近已揭开格子的未揭开格子）
    getEdgeCells() {
        const edgeCells = [];
        const visited = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].revealed && !this.grid[row][col].isMine) {
                    const adjacentUnrevealed = this.getAdjacentUnrevealed(row, col);
                    
                    for (const cell of adjacentUnrevealed) {
                        if (!visited[cell.row][cell.col]) {
                            edgeCells.push(cell);
                            visited[cell.row][cell.col] = true;
                        }
                    }
                }
            }
        }
        
        return edgeCells;
    }
    isFirstMove() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].revealed) {
                    return false;
                }
            }
        }
        return true;
    }

    getAdjacentUnrevealed(row, col) {
        const unrevealed = [];
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (!this.grid[r][c].revealed && !this.grid[r][c].flagged) {
                    unrevealed.push({ row: r, col: c });
                }
            }
        }
        return unrevealed;
    }

    getAdjacentFlags(row, col) {
        let flags = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (this.grid[r][c].flagged) flags++;
            }
        }
        return flags;
    }
}