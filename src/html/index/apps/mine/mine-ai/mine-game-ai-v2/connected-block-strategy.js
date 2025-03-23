import Utils from './utils.js';

export default class ConnectedBlockStrategy {
    constructor() {
        this.utils = new Utils();
        this.debug = true;
        this.analyzeLargeBlocks = false; // 添加控制参数
    }

    setAnalyzeLargeBlocks(value) {
        this.analyzeLargeBlocks = value;
    }

    analyze(grid, rows, cols, revealedCells, remainingMines) {
        this.log('开始联通块分析...');
        
        // 1. 找出所有联通块
        const blocks = this.findConnectedBlocks(grid, rows, cols);
        
        // 2. 分析每个联通块
        for (const block of blocks) {
            const result = this.analyzeBlock(grid, block, remainingMines);
            if (result) return result;
        }
        
        return null;
    }

    findConnectedBlocks(grid, rows, cols) {
        const blocks = [];
        const visited = new Set();
        
        // 遍历所有已揭开的数字格子
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const key = `${r},${c}`;
                if (visited.has(key)) continue;
                
                const cell = grid[r][c];
                if (!cell.revealed || cell.isMine) continue;
                
                // 找出与当前格子相关的所有格子（BFS）
                const block = this.expandBlock(grid, rows, cols, r, c, visited);
                if (block.unknowns.length > 0) {
                    blocks.push(block);
                }
            }
        }
        
        return blocks;
    }

    expandBlock(grid, rows, cols, startR, startC, visited) {
        const block = {
            numbers: [],    // 数字格子
            unknowns: [],   // 未知格子
            flags: []       // 已标记的雷
        };
        
        const queue = [{row: startR, col: startC}];
        visited.add(`${startR},${startC}`);
        
        while (queue.length > 0) {
            const {row, col} = queue.shift();
            const cell = grid[row][col];
            
            if (cell.revealed && !cell.isMine) {
                block.numbers.push({row, col, value: cell.adjacentMines});
                
                // 检查周围的格子
                const neighbors = this.utils.getSurroundingCells(grid, rows, cols, row, col);
                for (const neighbor of neighbors) {
                    const key = `${neighbor.row},${neighbor.col}`;
                    if (visited.has(key)) continue;
                    visited.add(key);
                    
                    if (neighbor.cell.flagged) {
                        block.flags.push({row: neighbor.row, col: neighbor.col});
                    } else if (!neighbor.cell.revealed) {
                        block.unknowns.push({row: neighbor.row, col: neighbor.col});
                        // 继续搜索与这个未知格子相邻的数字格子
                        const nextNumbers = this.utils.getSurroundingCells(grid, rows, cols, neighbor.row, neighbor.col)
                            .filter(n => n.cell.revealed && !n.cell.isMine);
                        queue.push(...nextNumbers);
                    } else if (!neighbor.cell.isMine) {
                        queue.push({row: neighbor.row, col: neighbor.col});
                    }
                }
            }
        }
        
        return block;
    }

    analyzeBlock(grid, block, remainingMines) {
        // 如果联通块中的未知格子数量较小，进行完整枚举
        if (block.unknowns.length <= 20) {
            const result = this.enumerateBlock(grid, block, remainingMines);
            if (result) return result;
        }
        
        // 只有在开启大型联通块分析时才进行概率分析
        if (this.analyzeLargeBlocks) {
            return this.analyzeProbability(grid, block, remainingMines);
        }
        
        return null;
    }

    enumerateBlock(grid, block, remainingMines) {
        const { numbers, unknowns, flags } = block;
        const totalCombinations = Math.pow(2, unknowns.length);
        const validCombinations = [];

        // 枚举所有可能的组合
        for (let i = 0; i < totalCombinations; i++) {
            const combination = new Set();
            let mineCount = 0;

            // 生成当前组合
            for (let j = 0; j < unknowns.length; j++) {
                if ((i & (1 << j)) !== 0) {
                    combination.add(`${unknowns[j].row},${unknowns[j].col}`);
                    mineCount++;
                }
            }

            // 检查是否满足所有数字约束
            let isValid = true;
            for (const num of numbers) {
                let count = 0;
                const neighbors = this.utils.getSurroundingCells(grid, grid.length, grid[0].length, num.row, num.col);
                
                for (const neighbor of neighbors) {
                    const key = `${neighbor.row},${neighbor.col}`;
                    if (neighbor.cell.flagged || combination.has(key)) {
                        count++;
                    }
                }

                if (count !== num.value) {
                    isValid = false;
                    break;
                }
            }

            if (isValid && mineCount <= remainingMines) {
                validCombinations.push(combination);
            }
        }

        if (validCombinations.length === 0) return null;

        // 分析结果
        const mineProbability = new Map();
        const safeProbability = new Map();

        // 计算每个格子是雷和安全的概率
        for (const unknown of unknowns) {
            const key = `${unknown.row},${unknown.col}`;
            let mineCount = 0;
            let safeCount = 0;

            for (const combination of validCombinations) {
                if (combination.has(key)) {
                    mineCount++;
                } else {
                    safeCount++;
                }
            }

            mineProbability.set(key, mineCount / validCombinations.length);
            safeProbability.set(key, safeCount / validCombinations.length);
        }

        // 找出确定是雷或确定安全的格子
        for (const [key, prob] of mineProbability) {
            if (prob === 1) {
                const [row, col] = key.split(',').map(Number);
                return {
                    row,
                    col,
                    action: 'flag',
                    isGuess: false
                };
            }
        }

        for (const [key, prob] of safeProbability) {
            if (prob === 1) {
                const [row, col] = key.split(',').map(Number);
                return {
                    row,
                    col,
                    action: 'reveal',
                    isGuess: false
                };
            }
        }

        return null;
    }

    analyzeProbability(grid, block, remainingMines) {
        // 对于大型联通块，使用简化的概率分析
        const { numbers, unknowns, flags } = block;
        const probabilities = new Map();

        // 计算每个未知格子的局部概率
        for (const unknown of unknowns) {
            let totalMines = 0;
            let totalCells = 0;

            // 检查相邻的数字格子
            const neighbors = this.utils.getSurroundingCells(grid, grid.length, grid[0].length, unknown.row, unknown.col)
                .filter(n => n.cell.revealed && !n.cell.isMine);

            for (const neighbor of neighbors) {
                const cell = grid[neighbor.row][neighbor.col];
                const surroundingUnknowns = this.utils.getSurroundingCells(grid, grid.length, grid[0].length, neighbor.row, neighbor.col)
                    .filter(n => !n.cell.revealed && !n.cell.flagged);
                const surroundingFlags = this.utils.getSurroundingCells(grid, grid.length, grid[0].length, neighbor.row, neighbor.col)
                    .filter(n => n.cell.flagged);

                totalMines += cell.adjacentMines - surroundingFlags.length;
                totalCells += surroundingUnknowns.length;
            }

            if (totalCells > 0) {
                const probability = totalMines / totalCells;
                probabilities.set(`${unknown.row},${unknown.col}`, probability);
            }
        }

        // 找出最安全的格子
        let safestCell = null;
        let lowestProb = 1;

        for (const [key, prob] of probabilities) {
            if (prob < lowestProb) {
                lowestProb = prob;
                safestCell = key;
            }
        }

        if (safestCell && lowestProb < 0.3) {  // 设置一个阈值
            const [row, col] = safestCell.split(',').map(Number);
            return {
                row,
                col,
                action: 'reveal',
                isGuess: false
            };
        }

        return null;
    }

    log(message) {
        if (this.debug) {
            console.log(`[ConnectedBlockStrategy] ${message}`);
        }
    }
}