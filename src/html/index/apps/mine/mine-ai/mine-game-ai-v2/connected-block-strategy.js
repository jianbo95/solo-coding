import Utils from './utils.js';

export default class ConnectedBlockStrategy {
    constructor() {
        this.utils = new Utils();
        this.debug = true;
        this.analyzeLargeBlocks = false; // 添加控制参数
        this.maxBlockSize = 15;  // 添加最大联通块大小限制
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
        // 如果联通块太大，直接跳过
        if (block.unknowns.length > this.maxBlockSize) {
            return null;
        }
        
        const result = this.enumerateBlock(grid, block, remainingMines);
        if (result) return result;
        
        // 移除大型联通块分析，因为效果不好且性能差
        return null;
    }

    enumerateBlock(grid, block, remainingMines) {
        const { numbers, unknowns, flags } = block;
        
        // 预计算每个数字格子周围的未知格子索引
        const numberConstraints = numbers.map(num => {
            const neighbors = this.utils.getSurroundingCells(grid, grid.length, grid[0].length, num.row, num.col);
            const unknownIndices = neighbors
                .filter(n => !n.cell.revealed && !n.cell.flagged)
                .map(n => unknowns.findIndex(u => u.row === n.row && u.col === n.col))
                .filter(idx => idx !== -1);
            const flagCount = neighbors.filter(n => n.cell.flagged).length;
            return {
                indices: unknownIndices,
                requiredMines: num.value - flagCount
            };
        });

        const validCombinations = [];
        const totalCombinations = 1 << unknowns.length;

        // 使用位运算枚举
        combinationLoop: for (let i = 0; i < totalCombinations; i++) {
            let mineCount = 0;
            for (let j = 0; j < unknowns.length; j++) {
                if (i & (1 << j)) mineCount++;
            }
            
            if (mineCount > remainingMines) continue;

            // 快速验证每个数字约束
            for (const constraint of numberConstraints) {
                let count = 0;
                for (const idx of constraint.indices) {
                    if (i & (1 << idx)) count++;
                }
                if (count !== constraint.requiredMines) {
                    continue combinationLoop;
                }
            }

            validCombinations.push(i);
        }

        if (validCombinations.length === 0) return null;

        // 使用位运算计算概率
        const mineCounts = new Array(unknowns.length).fill(0);
        const totalCount = validCombinations.length;

        // 统计每个位置在所有有效组合中出现的次数
        for (const combination of validCombinations) {
            for (let j = 0; j < unknowns.length; j++) {
                if (combination & (1 << j)) {
                    mineCounts[j]++;
                }
            }
        }

        // 检查是否有确定的格子
        for (let j = 0; j < unknowns.length; j++) {
            if (mineCounts[j] === totalCount) {
                // 所有组合中这个格子都是雷
                return {
                    row: unknowns[j].row,
                    col: unknowns[j].col,
                    action: 'flag',
                    isGuess: false
                };
            }
            if (mineCounts[j] === 0) {
                // 所有组合中这个格子都是安全的
                return {
                    row: unknowns[j].row,
                    col: unknowns[j].col,
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