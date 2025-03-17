class MinesweeperAI {
    constructor() {
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
        if (safeMove) return { ...safeMove, action: 'reveal' };

        // 2. 标记确定是雷的格子
        const mineMove = this.findDefiniteMine();
        if (mineMove) return { ...mineMove, action: 'flag' };

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

function calculateWinRate(grid, rows, cols, mineCount, simulations = 50) {
    let wins = 0;
    
    // 运行多次模拟
    for (let i = 0; i < simulations; i++) {
        // 深度复制当前网格状态
        const gridCopy = deepCopyGrid(grid, rows, cols);
        
        // 模拟一局游戏
        if (simulateGame(gridCopy, rows, cols, mineCount)) {
            wins++;
        }
    }
    
    // 计算胜率
    return Math.round((wins / simulations) * 100);
}

/**
 * 深度复制网格，确保所有属性都被正确复制
 * @param {Array} grid 原始网格
 * @param {Number} rows 行数
 * @param {Number} cols 列数
 * @returns {Array} 复制后的网格
 */
function deepCopyGrid(grid, rows, cols) {
    const newGrid = [];
    
    for (let r = 0; r < rows; r++) {
        newGrid[r] = [];
        for (let c = 0; c < cols; c++) {
            newGrid[r][c] = {
                isMine: grid[r][c].isMine,
                revealed: grid[r][c].revealed,
                flagged: grid[r][c].flagged,
                adjacentMines: grid[r][c].adjacentMines,
                safeFirstClick: grid[r][c].safeFirstClick || false
            };
        }
    }
    
    return newGrid;
}

/**
 * 模拟一局完整的游戏
 * @param {Array} grid 游戏网格
 * @param {Number} rows 行数
 * @param {Number} cols 列数
 * @param {Number} mineCount 雷数
 * @returns {Boolean} 是否获胜
 */
function simulateGame(grid, rows, cols, mineCount) {
    const ai = new MinesweeperAI();
    let firstMove = true;
    
    // 找到安全的第一步
    let safePosition = null;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c].safeFirstClick) {
                safePosition = { row: r, col: c };
                break;
            }
        }
        if (safePosition) break;
    }
    
    // 如果有安全位置，先点击它
    if (safePosition) {
        const result = revealCell(grid, safePosition.row, safePosition.col, rows, cols);
        if (!result) return false; // 如果点到雷，游戏失败
        firstMove = false;
    }
    
    // 模拟AI的移动，直到游戏结束
    let maxMoves = rows * cols * 2; // 防止无限循环
    while (maxMoves > 0) {
        // 检查是否已经赢了
        if (checkWinCondition(grid, rows, cols, mineCount)) {
            return true;
        }
        
        // 获取AI的下一步操作
        const move = ai.getNextMove(grid, rows, cols, firstMove);
        firstMove = false;
        
        if (!move) break; // 没有可行的移动
        
        if (move.action === 'reveal') {
            const result = revealCell(grid, move.row, move.col, rows, cols);
            if (!result) return false; // 如果点到雷，游戏失败
        } else {
            // 标记雷
            grid[move.row][move.col].flagged = true;
        }
        
        maxMoves--;
    }
    
    // 检查最终状态
    return checkWinCondition(grid, rows, cols, mineCount);
}

/**
 * 揭开一个格子
 * @param {Array} grid 游戏网格
 * @param {Number} row 行
 * @param {Number} col 列
 * @param {Number} rows 总行数
 * @param {Number} cols 总列数
 * @returns {Boolean} 是否成功（没有踩到雷）
 */
function revealCell(grid, row, col, rows, cols) {
    const cell = grid[row][col];
    
    if (cell.revealed || cell.flagged) return true;
    
    cell.revealed = true;
    
    // 如果踩到雷，游戏结束
    if (cell.isMine) {
        return false;
    }
    
    // 如果周围没有雷，自动展开周围的格子
    if (cell.adjacentMines === 0) {
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                revealCell(grid, r, c, rows, cols);
            }
        }
    }
    
    return true;
}

/**
 * 检查是否满足胜利条件
 * @param {Array} grid 游戏网格
 * @param {Number} rows 行数
 * @param {Number} cols 列数
 * @param {Number} mineCount 雷数
 * @returns {Boolean} 是否获胜
 */
function checkWinCondition(grid, rows, cols, mineCount) {
    // 检查是否所有雷都被正确标记
    let correctFlags = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            if (cell.flagged && !cell.isMine) return false; // 错误标记立即失败
            if (cell.isMine && cell.flagged) correctFlags++;
        }
    }
    if (correctFlags === mineCount) return true;

    // 检查是否所有非雷格子已揭开
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!grid[r][c].isMine && !grid[r][c].revealed) return false;
        }
    }
    return true;
}

