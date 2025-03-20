export default class MinesweeperAIV3 {
    constructor(isRand) {
        console.log('MinesweeperAIV3');
        this.isRand = isRand;
        this.guessCount = 0;
    }

    getGuessCount() {
        return this.guessCount;
    }

    // 获取下一步操作
    getNextMove(grid, rows, cols, firstMove) {
        this.grid = grid;
        this.rows = rows;
        this.cols = cols;
        // 1. 首先寻找安全的格子
        const safeMove = this.findSafeMove();
        if (safeMove) {
            var safeMove2 = Util.cloneMap(safeMove);
            safeMove.action = 'reveal';
            return safeMove2;
        }

        // 2. 标记确定是雷的格子
        const mineMove = this.findDefiniteMine();
        if (mineMove)  {
            var mineMove2 = Util.cloneMap(mineMove);
            mineMove.action = 'flag';
            return mineMove2;
        }

        // 3. 如果没有确定的选择，找一个最可能安全的格子
        const next = this.findProbableMove();
        if(firstMove == false) {
            this.guessCount ++;
        }
        return next;
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
            if(this.isRand == false) {
                // 按风险从低到高排序
                cellProbabilities.sort((a, b) => a.probability - b.probability);
                return { row: cellProbabilities[0].row, col: cellProbabilities[0].col, action: 'reveal' };
            } else {
                // 使用加权随机选择，风险越低权重越大
                const totalWeight = cellProbabilities.reduce((sum, cell) => sum + (1 - cell.probability), 0);
                let random = Math.random() * totalWeight;
                
                for (const cell of cellProbabilities) {
                    const weight = 1 - cell.probability;
                    random -= weight;
                    if (random <= 0) {
                        return { row: cell.row, col: cell.col, action: 'reveal' };
                    }
                }
                // 如果上面的循环没有返回（理论上不会发生），返回第一个格子
                return { 
                    row: cellProbabilities[0].row, 
                    col: cellProbabilities[0].col, 
                    action: 'reveal' 
                };
            }
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