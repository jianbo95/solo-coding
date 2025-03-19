import MinesweeperAI from '@/html/index/apps/mine/aiGame.js'; 

export default function generateMines(rows, cols, mineCount, firstRow, firstCol) {
    const maxAttempts = 50; // 最大尝试次数
    let bestGrid = null;
    let bestRevealedCount = 0;

    function countAdjacentMines(grid, rows, cols, row, col) {
        let count = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                if (r === row && c === col) continue;
                if (grid[r][c].isMine) count++;
            }
        }
        return count;
    }

    function simulateReveal(grid, row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return 0;
        if (grid[row][col].revealed || grid[row][col].isMine) return 0;
        
        let revealed = 1;
        grid[row][col].revealed = true;
        
        if (grid[row][col].adjacentMines === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    revealed += simulateReveal(grid, r, c);
                }
            }
        }
        return revealed;
    }

    function evaluateGrid(grid) {
        const testGrid = JSON.parse(JSON.stringify(grid));
        return simulateReveal(testGrid, firstRow, firstCol);
    }

    function generateSingleGrid() {
        const minePositions = new Set();
        const grid = Array(rows).fill().map(() => 
            Array(cols).fill().map(() => ({
                isMine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0
            }))
        );
        
        // 确保第一次点击的位置及其周围不是雷
        const safePositions = new Set();
        for (let r = Math.max(0, firstRow - 1); r <= Math.min(rows - 1, firstRow + 1); r++) {
            for (let c = Math.max(0, firstCol - 1); c <= Math.min(cols - 1, firstCol + 1); c++) {
                safePositions.add(`${r},${c}`);
            }
        }
        
        while (minePositions.size < mineCount) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            const pos = `${row},${col}`;
            
            if (!safePositions.has(pos) && !minePositions.has(pos)) {
                minePositions.add(pos);
                grid[row][col].isMine = true;
            }
        }
        
        // 计算每个格子周围的雷数
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!grid[r][c].isMine) {
                    grid[r][c].adjacentMines = countAdjacentMines(grid, rows, cols, r, c);
                }
            }
        }
        
        return grid;
    }

    // 尝试生成多次地图，选择最佳的一个
    var buildSize = 0;
    var gridList = [];
    var bestScore = -100;
    for (let i = 0; i < maxAttempts; i++) {
        const grid = generateSingleGrid();
        const revealedCount = evaluateGrid(grid);
        buildSize ++;
        
        if (revealedCount > bestRevealedCount) {
            bestRevealedCount = revealedCount;
            
            // 如果找到一个足够好的地图（能揭开70%以上的非雷格子），就提前返回
            const totalNonMines = rows * cols - mineCount;
            const score = totalNonMines - totalNonMines * 0.7;
            if(score > bestScore) {
                bestScore = score;
                bestGrid = grid;
            }
            // if (revealedCount >= totalNonMines * 0.7) {
            //     break;
            // }
            gridList.push({
                grid: grid,
                score: score
            });
        }
    }

    let bestGuessCount = 10000;
    let finalGrid = null;
    
    console.log('gridList.size', gridList.length);
    // 通过 aiGame.js 模拟玩游戏，从 gridList 中找出最好的地图
    let playCount = 0;
    for (const item of gridList) {
        playCount ++;
        const testGrid = JSON.parse(JSON.stringify(item.grid));
        
        // 先模拟第一次点击
        simulateReveal(testGrid, firstRow, firstCol);
        
        const ai = new MinesweeperAI();
        let guessCount = 0;
        let isComplete = false;
        let maxMoves = rows * cols * 2; // 防止无限循环
        let moveCount = 0;

        // 模拟AI玩游戏
        console.log('while start ' + playCount)
        while (!isComplete && moveCount < maxMoves) {
            moveCount++;
            const move = ai.getNextMove(testGrid, rows, cols);
            
            if (!move) {
                break;
            }

            if (move.isGuess) {
                guessCount++;
            }

            // 模拟移动
            if (move.action === 'reveal') {
                if (testGrid[move.row][move.col].isMine) {
                    // 踩雷了，这个地图不是最优解
                    guessCount = Infinity;
                    break;
                }
                simulateReveal(testGrid, move.row, move.col);
            } else {
                testGrid[move.row][move.col].flagged = true;
            }

            // 检查是否完成
            isComplete = checkGridCompletion(testGrid);
        }
        console.log('while end ' + playCount + ' guessCount:' + guessCount)

        // 更新最佳地图
        if (guessCount < bestGuessCount) {
            bestGuessCount = guessCount;
            finalGrid = item.grid;
            
            // 如果找到无需猜测的地图，直接使用
            if (guessCount === 0) {
                console.log('无需猜测，直接使用');
                break;
            }
        }
    }

    console.log('尝试生成地图' + buildSize + '次，好地图' + gridList.length + '个，AI玩次数' + playCount + '，最少需要猜测' + bestGuessCount + '次');

    return { grid: finalGrid || bestGrid, guessCount: bestGuessCount };
}

// 检查地图是否完成
function checkGridCompletion(grid) {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            const cell = grid[row][col];
            if (!cell.isMine && !cell.revealed) {
                return false;
            }
        }
    }
    return true;
}

