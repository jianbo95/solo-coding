import MinesweeperAI from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2.js';

const DebugOption = {
    type: 'overlap', // 当策略为 'overlap' 时
    condition: 'correctFalse', // 当推断结果为错误时
    action: 'close' // close 表示结束AI
};

// 创建基于种子的随机数生成器
function SeededRandom(seed) {
    const rng = new Math.seedrandom(seed);
    
    return {
        random: function() {
            return rng();
        },
        randInt: function(min, max) {
            return Math.floor(rng() * (max - min + 1)) + min;
        }
    };
}

// 在文件顶部添加工具函数
function encodeSeedString(rows, cols, mineCount, firstRow, firstCol, baseSeed) {
    const padNumber = (num, length) => String(num).padStart(length, '0');
    return padNumber(rows, 3) + 
           padNumber(cols, 3) + 
           padNumber(mineCount, 4) + 
           padNumber(firstRow, 2) + 
           padNumber(firstCol, 2) + 
           baseSeed;
}

// 生成包含游戏参数的随机种子
function buildRandSeed(rows/*2-100*/, cols/*2-100*/, mineCount/*2-9999*/, firstRow/*0-99*/, firstCol/*0-99*/) {
    // 参数格式：
    // rows: 3位 (001-100)
    // cols: 3位 (001-100)
    // mineCount: 4位 (0001-9999)
    // firstRow: 2位 (00-99)
    // firstCol: 2位 (00-99)
    // baseSeed: 剩余位数
    
    const timestamp = Date.now();
    const offset = Math.floor(Math.random() * 1000000);
    const baseSeed = timestamp + offset;
    
    // 补零函数
    const padNumber = (num, length) => String(num).padStart(length, '0');
    
    return padNumber(rows, 3) + 
           padNumber(cols, 3) + 
           padNumber(mineCount, 4) + 
           padNumber(firstRow, 2) + 
           padNumber(firstCol, 2) + 
           baseSeed;
}

// 从种子字符串中解析游戏参数
function parseSeed(seedString) {
    // 从前向后解析固定长度的字段
    const rows = parseInt(seedString.slice(0, 3));
    const cols = parseInt(seedString.slice(3, 6));
    const mineCount = parseInt(seedString.slice(6, 10));
    const firstRow = parseInt(seedString.slice(10, 12));
    const firstCol = parseInt(seedString.slice(12, 14));
    const baseSeed = parseInt(seedString.slice(14)); // baseSeed 在最后
    
    return {
        baseSeed,
        rows,
        cols,
        mineCount,
        firstRow,
        firstCol
    };
}

/**
 * 根据种子生成扫雷游戏地图
 * @param {number} rows 地图行数 (2-100)
 * @param {number} cols 地图列数 (2-100)
 * @param {number} mineCount 地雷数量 (2-9999)
 * @param {string|null} finalSeed 种子字符串，格式为"RRRCCCSSSRRCCXXXXXX"，其中：
 *   - RRR: 3位行数
 *   - CCC: 3位列数
 *   - SSS: 4位地雷数
 *   - RR: 2位首次点击行号
 *   - CC: 2位首次点击列号
 *   - XXXXXX: 时间戳+随机偏移
 * @param {number} maxAttempts 最大尝试生成次数，默认50次
 * @returns {Object} 返回生成的地图信息
 *   - grid: 地图数组
 *   - guessCount: AI计算的最少猜测次数
 *   - seed: 最终使用的种子
 *   - rows: 行数
 *   - cols: 列数
 *   - mineCount: 地雷数
 *   - safeRow: 安全起始行
 *   - safeCol: 安全起始列
 */
function generateMinesBySeed(rows, cols, mineCount, finalSeed, maxAttempts = 50) {

    let safeRow, safeCol, buildSeed, params;
    
    if(finalSeed == null) {
        // 随机选择一个安全的第一次点击位置
        safeRow = Math.floor(Math.random() * rows);
        safeCol = Math.floor(Math.random() * cols);
        var notFinalSeed = buildRandSeed(rows, cols, mineCount, safeRow, safeCol);
        params = parseSeed(notFinalSeed);
        buildSeed = true;
    } else {
        buildSeed = false;
        // 从种子中解析参数，包括第一次点击位置
        // 使用解析出的参数
        params = parseSeed(finalSeed);
        rows = params.rows;
        cols = params.cols;
        mineCount = params.mineCount;
        safeRow = params.firstRow;
        safeCol = params.firstCol;
    }
    // console.log('参数', {rows, cols, mineCount, firstRow: safeRow, firstCol: safeCol});

    // 如果是使用已有种子，直接生成一次地图并返回
    if (buildSeed == false) {
        const rng = new SeededRandom(finalSeed);
        const grid = generateSingleGrid(rng);
        console.log('使用已有种子，直接生成一次地图并返回', finalSeed);
        return {
            grid: grid,
            guessCount: 0,  // 这里不需要计算猜测次数
            seed: finalSeed,
            rows,
            cols,
            mineCount,
            safeRow: safeRow,
            safeCol: safeCol
        };
    }

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
        return simulateReveal(testGrid, safeRow, safeCol);
    }

    function generateSingleGrid(rng) {
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
        for (let r = Math.max(0, safeRow - 1); r <= Math.min(rows - 1, safeRow + 1); r++) {
            for (let c = Math.max(0, safeCol - 1); c <= Math.min(cols - 1, safeCol + 1); c++) {
                safePositions.add(`${r},${c}`);
            }
        }
        
        // TODO 使用 seedrandom 放置地雷
        // 放置地雷
        let placedMines = 0;
        while (placedMines < mineCount) {
            const row = Math.floor(rng.random() * rows);
            const col = Math.floor(rng.random() * cols);
            const posKey = `${row},${col}`;
            
            // 如果这个位置没有雷，且不在安全区域内
            if (!minePositions.has(posKey) && !safePositions.has(posKey)) {
                minePositions.add(posKey);
                grid[row][col].isMine = true;
                placedMines++;
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
        
        // 最终种子
        const finalSeed = encodeSeedString(rows, cols, mineCount, safeRow, safeCol, params.baseSeed + i);
        
        const currentRng = new SeededRandom(finalSeed);
        
        const grid = generateSingleGrid(currentRng);
        
        const revealedCount = evaluateGrid(grid); // 去掉这个逻辑，所有地图都让ai玩一遍
        buildSize++;
        
        if (revealedCount > bestRevealedCount) {
            bestRevealedCount = revealedCount;
            const totalNonMines = rows * cols - mineCount;
            const score = totalNonMines - totalNonMines * 0.7;
            if(score > bestScore) {
                bestScore = score;
            }
            gridList.push({
                grid: grid,
                score: score,
                seed: finalSeed
            });
        } else {
            gridList.push({
                grid: grid,
                score: 0,
                seed: finalSeed
            });
        }
    }

    let bestGuessCount = 10000;
    let finalItem = null;
    
    // console.log('gridList.size', gridList.length);
    // 通过 aiGame.js 模拟玩游戏，从 gridList 中找出最好的地图
    let playCount = 0;
    for (const item of gridList) {
        playCount ++;
        const testGrid = JSON.parse(JSON.stringify(item.grid));
        
        // 先模拟第一次点击
        simulateReveal(testGrid, safeRow, safeCol);
        
        const ai = new MinesweeperAI();
        let guessCount = 0;
        let isComplete = false;
        let maxMoves = rows * cols * 2; // 防止无限循环
        let moveCount = 0;

        // 模拟AI玩游戏
        // console.log('while start ' + playCount)
        while (!isComplete && moveCount < maxMoves) {
            moveCount++;
            const move = ai.getNextMove(testGrid, rows, cols);
            // console.log('getNextMove', move);
            
            if (!move) {
                break;
            }

            // 检查是否需要根据 DebugOption 结束 AI
            if (DebugOption.type === move.strategy && 
                ((DebugOption.condition === 'correctFalse' && !move.isCorrect)
                 )) {
                if (DebugOption.action === 'close') {
                    console.log('根据 DebugOption 设置结束 AI');
                    finalItem = item;
                    bestGuessCount = guessCount;
                    return {
                        grid: finalItem.grid,
                        guessCount: bestGuessCount,
                        seed: finalItem.seed,
                        rows,
                        cols,
                        mineCount,
                        safeRow,
                        safeCol,
                        debugState: {
                            currentGrid: testGrid,
                            lastMove: move
                        }
                    };
                }
            }

            if (move.isGuess) {
                guessCount++;
            }

            // 模拟移动
            if (move.action === 'reveal') {
                if (testGrid[move.row][move.col].isMine) {
                    // 计算当前已经揭开的格子数量
                    let revealedCount = 0;
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            if (testGrid[r][c].revealed) {
                                revealedCount++;
                            }
                        }
                    }
                    // 剩余待处理的格子数量作为猜测次数
                    guessCount = rows * cols - revealedCount - mineCount;
                    break;
                }
                simulateReveal(testGrid, move.row, move.col);
            } else {
                testGrid[move.row][move.col].flagged = true;
            }

            // 检查是否完成
            isComplete = checkGridCompletion(testGrid);
        }
        // console.log('while end ' + playCount + ' guessCount:' + guessCount)

        // 在更新最佳地图时
        if (guessCount < bestGuessCount) {
            bestGuessCount = guessCount;
            finalItem = item;
            finalSeed = encodeSeedString(rows, cols, mineCount, safeRow, safeCol, params.baseSeed);
            
            if (guessCount === 0) {
                console.log('无需猜测，直接使用');
                break;
            }
        }
    }

    console.log('生成种子:', finalSeed, '尝试生成地图' + buildSize + '次，好地图' + gridList.length + '个，AI玩次数' + playCount + '，最少需要猜测' + bestGuessCount + '次');

    // 修改返回的种子格式
    return { 
        grid: finalItem.grid, 
        guessCount: bestGuessCount,
        seed: `${finalItem.seed}`, // 返回完整的种子字符串
        rows,
        cols,
        mineCount,
        safeRow: safeRow,
        safeCol: safeCol
    };
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

export default generateMinesBySeed;