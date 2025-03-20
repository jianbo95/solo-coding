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

        // 2.1 在概率分析之前，添加剩余雷数分析
        const remainingMinesAnalysis = this.analyzeRemainingMines(grid, rows, cols, mineCount);
        console.log('remainingMinesAnalysis', remainingMinesAnalysis);
        if (remainingMinesAnalysis) {
            return remainingMinesAnalysis;
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

    // 新增方法：分析剩余雷数
    // analyzeRemainingMines(grid, rows, cols, mineCount) {
        // console.log('开始剩余雷数分析，总雷数:', mineCount);
        
        // 分析多个格子的总雷数，上方的总雷数是1
        // 中间的总雷数也是1
        // 4周围的总雷数是2，剩余雷数是4，那最下面两个位置就不是雷了
        // TODO 思路有了，完成代码

        // 剩余雷数是4，
        // 根据九宫格去分析，最上面那个九宫格还有一颗雷
        // 第二个九宫格也还有一颗雷
        // 第三个九宫格也确定还有两颗雷

        // 对未处理的格子进行分析
        // 1. 上面两颗未处理的必有一颗是雷
        // 2. 然后下面两颗未处理的必有一颗是雷
        // 3. 然后再下面4周围，必有两颗雷
        // 4. 1,2,3 就一共四颗雷了
        // 5， 最下面两个必定不是雷

    // }

    analyzeRemainingMines(grid, rows, cols, mineCount) {
        const flaggedCount = grid.flat().filter(cell => cell.flagged).length;
        const remainingMines = mineCount - flaggedCount;
    
        // 新增：优先处理完全满足需求的区域
        const safeCells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell.revealed || cell.flagged) continue;
    
                // 新增：直接检测周围数字是否全部满足
                let isSafe = true;
                const neighbors = this.getSurroundingCells(grid, rows, cols, r, c);
                for (const {row: nr, col: nc, cell: nCell} of neighbors) {
                    if (!nCell.revealed) continue;
                    
                    const nNeighbors = this.getSurroundingCells(grid, rows, cols, nr, nc);
                    const required = nCell.adjacentMines - nNeighbors.filter(x => x.cell.flagged).length;
                    const unrevealed = nNeighbors.filter(x => !x.cell.revealed && !x.cell.flagged).length;
                    
                    if (required > 0 && unrevealed === 1) { 
                        // 如果当前格子是唯一可能，则不安全
                        isSafe = false;
                        break;
                    }
                }
                
                if (isSafe) {
                    safeCells.push({row: r, col: c});
                }
            }
        }
    
        // 优先返回安全区域
        if (safeCells.length > 0) {
            return {
                row: safeCells[0].row,
                col: safeCells[0].col,
                action: 'reveal',
                isGuess: false
            };
        }
        
        // 情况1：剩余雷数为零，所有未揭开的格子安全
        if (remainingMines <= 0) {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = grid[r][c];
                    if (!cell.revealed && !cell.flagged) {
                        return {
                            row: r,
                            col: c,
                            action: 'reveal',
                            isGuess: false
                        };
                    }
                }
            }
        }
    
        // 情况2：检查周围所有数字的剩余需求为零的格子
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell.revealed || cell.flagged) continue;
    
                const surroundingRevealed = this.getSurroundingCells(grid, rows, cols, r, c)
                    .filter(info => info.cell.revealed && info.cell.adjacentMines > 0);
    
                let allZero = true;
                for (const { row: sr, col: sc, cell: sCell } of surroundingRevealed) {
                    const surrounding = this.getSurroundingCells(grid, rows, cols, sr, sc);
                    const flaggedAround = surrounding.filter(info => info.cell.flagged).length;
                    const required = sCell.adjacentMines - flaggedAround;
                    if (required > 0) {
                        allZero = false;
                        break;
                    }
                }
    
                if (allZero && surroundingRevealed.length > 0) {
                    return {
                        row: r,
                        col: c,
                        action: 'reveal',
                        isGuess: false
                    };
                }
            }
        }
    
        // 情况3：检查总需求超过剩余雷数的格子
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell.revealed || cell.flagged) continue;
    
                const surroundingRevealed = this.getSurroundingCells(grid, rows, cols, r, c)
                    .filter(info => info.cell.revealed && info.cell.adjacentMines > 0);
    
                let totalRequired = 0;
                for (const { row: sr, col: sc, cell: sCell } of surroundingRevealed) {
                    const surrounding = this.getSurroundingCells(grid, rows, cols, sr, sc);
                    const flaggedAround = surrounding.filter(info => info.cell.flagged).length;
                    const required = sCell.adjacentMines - flaggedAround;
                    totalRequired += Math.max(required, 0); // 确保需求非负
                }
    
                if (totalRequired > remainingMines) {
                    return {
                        row: r,
                        col: c,
                        action: 'reveal',
                        isGuess: false
                    };
                }
            }
        }
    
        return null;
    }
}