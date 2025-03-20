import MinesweeperAI from '@/html/index/apps/mine/mine-ai/aiGame.js';

// 基于种子的随机数生成器
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    // 生成 0-1 之间的随机数
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    // 生成指定范围内的整数
    randInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }
}

export default function generateMinesBySeed(rows, cols, mineCount, firstRow, firstCol, seed = Date.now()) {
    const rng = new SeededRandom(seed);
    const maxAttempts = 50;
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
        
        // 使用基于种子的随机数生成器放置地雷
        while (minePositions.size < mineCount) {
            const row = rng.randInt(0, rows - 1);
            const col = rng.randInt(0, cols - 1);
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
        // 每次尝试使用不同的种子偏移
        const currentSeed = seed + i;
        rng.seed = currentSeed;
        
        const grid = generateSingleGrid();
        const revealedCount = evaluateGrid(grid);
        buildSize++;
        
        if (revealedCount > bestRevealedCount) {
            bestRevealedCount = revealedCount;
            const totalNonMines = rows * cols - mineCount;
            const score = totalNonMines - totalNonMines * 0.7;
            if(score > bestScore) {
                bestScore = score;
                bestGrid = grid;
            }
            gridList.push({
                grid: grid,
                score: score,
                seed: currentSeed
            });
        }
    }

    // ... 其余代码与原文件相同 ...

    console.log('使用种子:', seed, '尝试生成地图' + buildSize + '次，好地图' + gridList.length + '个，AI玩次数' + playCount + '，最少需要猜测' + bestGuessCount + '次');

    return { 
        grid: finalGrid || bestGrid, 
        guessCount: bestGuessCount,
        seed: seed // 返回使用的种子
    };
}

