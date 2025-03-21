import Utils from './utils.js';

export default class RegionStrategy {
    constructor() {
        this.utils = new Utils();
    }

    /**
     * 区域策略分析
     */
    analyze(grid, rows, cols, mineCount, unrevealedCells, flaggedCount) {
        const remainingMines = mineCount - flaggedCount;
        
        // 如果剩余雷数为0，所有未揭开的格子都是安全的
        if (remainingMines === 0 && unrevealedCells.length > 0) {
            return {
                row: unrevealedCells[0].row,
                col: unrevealedCells[0].col,
                action: 'reveal',
                isGuess: false
            };
        }
        
        // 如果剩余雷数等于未揭开格子数，所有未揭开的格子都是雷
        if (remainingMines === unrevealedCells.length && unrevealedCells.length > 0) {
            return {
                row: unrevealedCells[0].row,
                col: unrevealedCells[0].col,
                action: 'flag',
                isGuess: false
            };
        }

        // 区域分析 - 识别独立区域并分析
        console.log('识别独立区域并分析');
        const regions = this.identifyRegions(grid, rows, cols);
        for (const region of regions) {
            const regionMove = this.analyzeRegion(grid, region, remainingMines);
            if (regionMove) return regionMove;
        }

        return null;
    }

    /**
     * 识别独立区域
     */
    identifyRegions(grid, rows, cols) {
        // 使用洪水填充算法识别独立区域
        const visited = Array(rows).fill().map(() => Array(cols).fill(false));
        const regions = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!visited[r][c] && !grid[r][c].revealed && !grid[r][c].flagged) {
                    const region = [];
                    this.floodFill(grid, rows, cols, r, c, visited, region);
                    if (region.length > 0) {
                        regions.push(region);
                    }
                }
            }
        }

        return regions;
    }

    /**
     * 洪水填充算法
     */
    floodFill(grid, rows, cols, r, c, visited, region) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || 
            visited[r][c] || grid[r][c].revealed || grid[r][c].flagged) {
            return;
        }

        // 获取当前格子的相邻已揭开格子
        const surroundingRevealed = this.utils.getSurroundingCells(grid, rows, cols, r, c)
            .filter(c => c.cell.revealed);

        // 只有与已揭开数字相邻的未揭开格子才加入区域
        if (surroundingRevealed.length === 0) {
            return;
        }

        visited[r][c] = true;
        region.push({ row: r, col: c });

        // 仅扩展直接相邻的格子（上下左右）
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                this.floodFill(grid, rows, cols, nr, nc, visited, region);
            }
        }

    }

    /**
     * 分析区域
     */
    analyzeRegion(grid, region, remainingMines) {
        // 收集区域边界数字及对应坐标
        const borderCells = [];
        const processed = new Set();
        
        for (const cell of region) {
            this.utils.getSurroundingCells(grid, grid.length, grid[0].length, cell.row, cell.col)
                .forEach(neighbor => {
                    const key = `${neighbor.row}-${neighbor.col}`;
                    if (neighbor.cell.revealed && neighbor.cell.adjacentMines > 0 && !processed.has(key)) {
                        borderCells.push({
                            row: neighbor.row,
                            col: neighbor.col,
                            value: neighbor.cell.adjacentMines
                        });
                        processed.add(key);
                    }
                });
        }

        // 计算实际需要的雷数（考虑已标记的旗子）
        const existingFlags = this.utils.countFlagsAroundCells(grid, borderCells);
        const minRequired = borderCells.reduce((sum, c) => sum + c.value, 0) - existingFlags;
        
        // 精确判断条件
        const exactCondition = minRequired === remainingMines;
        const possibleCondition = region.length >= minRequired && minRequired <= remainingMines;

        // 当满足精确条件时标记雷
        if (exactCondition && possibleCondition) {
            // 寻找最高概率的格子
            const mineCandidates = this.findMineCandidates(grid, region, borderCells);
            if (mineCandidates.length > 0) {
                return this.createFlagAction(mineCandidates[0]);
            }
        }
        
        return null;
    }

    // 新增方法：寻找真正的雷区候选
    findMineCandidates(grid, region, borderCells) {
        const candidates = [];
        
        // 构建影响关系映射
        const cellWeights = new Map();
        for (const bc of borderCells) {
            const surrounding = this.utils.getSurroundingCells(grid, grid.length, grid[0].length, bc.row, bc.col)
                .filter(c => !c.cell.revealed && !c.cell.flagged);
            
            surrounding.forEach(c => {
                const key = `${c.row}-${c.col}`;
                cellWeights.set(key, (cellWeights.get(key) || 0) + bc.value);
            });
        }

        // 找到权重最高的候选格
        let maxWeight = 0;
        region.forEach(c => {
            const key = `${c.row}-${c.col}`;
            const weight = cellWeights.get(key) || 0;
            if (weight > maxWeight) {
                maxWeight = weight;
                candidates.length = 0;
                candidates.push(c);
            } else if (weight === maxWeight) {
                candidates.push(c);
            }
        });

        return candidates;
    }

    createFlagAction(cell) {
        return {
            row: cell.row,
            col: cell.col,
            action: 'flag',
            isGuess: false
        };
    }

    createRevealAction(cell) {
        return {
            row: cell.row,
            col: cell.col,
            action: 'reveal',
            isGuess: false
        };
    }
}