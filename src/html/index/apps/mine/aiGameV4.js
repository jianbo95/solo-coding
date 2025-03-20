export default class MinesweeperAIV4 {
    constructor() {
        this.guessCount = 0;
        console.log('MinesweeperAIV4');
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
            // 死循环了啊
            console.log('while');
        }
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
        // if (safeMove) return { ...safeMove, action: 'reveal' };

        // 2. 标记确定是雷的格子
        const mineMove = this.findDefiniteMine();
        if (mineMove)  {
            var mineMove2 = Util.cloneMap(mineMove);
            mineMove.action = 'flag';
            return mineMove2;
        }
        // if (mineMove) return { ...mineMove, action: 'flag' };

        // 3. 如果没有确定的选择，找一个最可能安全的格子
        const next = this.findProbableMove();
        if(firstMove == false) {
            this.guessCount ++;
        }
        return next;
    }

    // 无风险找到安全的格子
    findSafeMove() {
        const safeCells = [];
        
        // 收集所有安全候选格
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].revealed && !this.grid[row][col].isMine) {
                    const adjacentUnrevealed = this.getAdjacentUnrevealed(row, col);
                    const adjacentFlags = this.getAdjacentFlags(row, col);
                    const requiredMines = this.grid[row][col].adjacentMines;
                    
                    // 基础安全条件：已标记数 = 需要雷数
                    if (adjacentFlags === requiredMines && adjacentUnrevealed.length > 0) {
                        safeCells.push(...adjacentUnrevealed);
                    }
                    
                    // 新增高级条件：未揭开数 = 剩余需要雷数
                    const remainingMines = requiredMines - adjacentFlags;
                    if (remainingMines === 0 && adjacentUnrevealed.length > 0) {
                        safeCells.push(...adjacentUnrevealed);
                    }
                }
            }
        }
        
        // 交叉验证安全格
        const validatedCells = [];
        for (const cell of safeCells) {
            let isSafe = true;
            
            // 检查该格周围所有已揭开的数字格
            for (let r = Math.max(0, cell.row - 1); r <= Math.min(this.rows - 1, cell.row + 1); r++) {
                for (let c = Math.max(0, cell.col - 1); c <= Math.min(this.cols - 1, cell.col + 1); c++) {
                    if (this.grid[r][c].revealed && !this.grid[r][c].isMine) {
                        const adjFlags = this.getAdjacentFlags(r, c);
                        const adjUnrevealed = this.getAdjacentUnrevealed(r, c);
                        const required = this.grid[r][c].adjacentMines;
                        
                        // 如果该格剩余需要标记的雷数 > 未揭开格数，则该格不安全
                        if ((required - adjFlags) > (adjUnrevealed.length - 1)) {
                            isSafe = false;
                            break;
                        }
                    }
                }
                if (!isSafe) break;
            }
            
            if (isSafe) validatedCells.push(cell);
        }
        
        // 优先返回被多个数字格共同认定的安全格
        if (validatedCells.length > 0) {
            const cellScores = new Map();
            validatedCells.forEach(cell => {
                const key = `${cell.row},${cell.col}`;
                cellScores.set(key, (cellScores.get(key) || 0) + 1);
            });
            
            const bestCell = Array.from(cellScores.entries())
                .sort((a, b) => b[1] - a[1])[0][0]
                .split(',')
                .map(Number);
            
            return { row: bestCell[0], col: bestCell[1] };
        }
        
        return null;
    }

    findDefiniteMine() {
        const mineCandidates = new Map();
        
        // 收集所有候选雷
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].revealed && !this.grid[row][col].isMine) {
                    const adjacentUnrevealed = this.getAdjacentUnrevealed(row, col);
                    const adjacentFlags = this.getAdjacentFlags(row, col);
                    const requiredMines = this.grid[row][col].adjacentMines;
                    
                    // 基础条件：未揭开格子数 = 剩余需要雷数
                    const remainingMines = requiredMines - adjacentFlags;
                    if (adjacentUnrevealed.length === remainingMines && remainingMines > 0) {
                        adjacentUnrevealed.forEach(cell => {
                            const key = `${cell.row},${cell.col}`;
                            mineCandidates.set(key, (mineCandidates.get(key) || 0) + 1);
                        });
                    }
                }
            }
        }
        
        // 交叉验证候选雷
        const validatedMines = [];
        for (const [key, count] of mineCandidates) {
            const [row, col] = key.split(',').map(Number);
            let isDefinite = true;
            
            // 检查该候选雷是否满足所有相邻数字格的条件
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    if (this.grid[r][c].revealed && !this.grid[r][c].isMine) {
                        const adjFlags = this.getAdjacentFlags(r, c);
                        const adjUnrevealed = this.getAdjacentUnrevealed(r, c);
                        const required = this.grid[r][c].adjacentMines;
                        
                        // 如果该候选雷不满足当前数字格的条件
                        if ((required - adjFlags) > (adjUnrevealed.length - (adjUnrevealed.some(uc => uc.row === row && uc.col === col) ? 1 : 0))) {
                            isDefinite = false;
                            break;
                        }
                    }
                }
                if (!isDefinite) break;
            }
            
            if (isDefinite) validatedMines.push({ row, col, confidence: count });
        }
        
        // 返回置信度最高的雷
        if (validatedMines.length > 0) {
            return validatedMines.sort((a, b) => b.confidence - a.confidence)[0];
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