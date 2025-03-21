import Utils from './utils.js';

export default class TankChainStrategy {
    constructor() {
        this.utils = new Utils();
    }

    /**
     * 坦克链分析
     */
    analyze(grid, rows, cols, revealedCells) {
        // 寻找数字1-2-1模式 (坦克链)
        for (const cell of revealedCells) {
            if (grid[cell.row][cell.col].adjacentMines !== 1) continue;
            
            const neighbors = this.utils.getSurroundingCells(grid, rows, cols, cell.row, cell.col);
            const revealedNeighbors = neighbors.filter(n => n.cell.revealed && !n.cell.isMine);
            
            for (const neighbor of revealedNeighbors) {
                if (grid[neighbor.row][neighbor.col].adjacentMines !== 2) continue;
                
                const neighborOfNeighbor = this.utils.getSurroundingCells(grid, rows, cols, neighbor.row, neighbor.col);
                const revealedNeighborOfNeighbor = neighborOfNeighbor.filter(n => 
                    n.cell.revealed && !n.cell.isMine && 
                    n.row !== cell.row && n.col !== cell.col &&
                    grid[n.row][n.col].adjacentMines === 1
                );
                
                if (revealedNeighborOfNeighbor.length > 0) {
                    // 找到1-2-1模式，检查是否有可以标记或揭开的格子
                    const middleUnrevealed = neighborOfNeighbor.filter(n => 
                        !n.cell.revealed && !n.cell.flagged
                    );
                    
                    if (middleUnrevealed.length === 1) {
                        return {
                            row: middleUnrevealed[0].row,
                            col: middleUnrevealed[0].col,
                            action: 'flag',
                            isGuess: false
                        };
                    }
                }
            }
        }
        
        // 寻找1-1-1模式
        const oneOneOneMove = this.analyzeOneOneOnePattern(grid, rows, cols, revealedCells);
        if (oneOneOneMove) return oneOneOneMove;
        
        return null;
    }
    
    /**
     * 分析1-1-1模式
     * 当三个1连成一条线时，可能存在特殊情况
     */
    analyzeOneOneOnePattern(grid, rows, cols, revealedCells) {
        for (const cell of revealedCells) {
            if (grid[cell.row][cell.col].adjacentMines !== 1) continue;
            
            // 检查水平方向
            if (cell.col + 2 < cols) {
                const mid = grid[cell.row][cell.col + 1];
                const right = grid[cell.row][cell.col + 2];
                
                if (mid.revealed && !mid.isMine && mid.adjacentMines === 1 &&
                    right.revealed && !right.isMine && right.adjacentMines === 1) {
                    
                    // 检查上下是否有可以标记或揭开的格子
                    const move = this.checkLinePattern(grid, rows, cols, 
                        [[cell.row, cell.col], [cell.row, cell.col + 1], [cell.row, cell.col + 2]]);
                    if (move) return move;
                }
            }
            
            // 检查垂直方向
            if (cell.row + 2 < rows) {
                const mid = grid[cell.row + 1][cell.col];
                const bottom = grid[cell.row + 2][cell.col];
                
                if (mid.revealed && !mid.isMine && mid.adjacentMines === 1 &&
                    bottom.revealed && !bottom.isMine && bottom.adjacentMines === 1) {
                    
                    // 检查左右是否有可以标记或揭开的格子
                    const move = this.checkLinePattern(grid, rows, cols, 
                        [[cell.row, cell.col], [cell.row + 1, cell.col], [cell.row + 2, cell.col]]);
                    if (move) return move;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 检查线性模式
     */
    checkLinePattern(grid, rows, cols, positions) {
        // 获取所有相邻的未揭开格子
        const adjacentUnrevealed = new Set();
        const adjacentRevealed = new Set();
        
        for (const [r, c] of positions) {
            const neighbors = this.utils.getSurroundingCells(grid, rows, cols, r, c);
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.row},${neighbor.col}`;
                if (!neighbor.cell.revealed && !neighbor.cell.flagged) {
                    adjacentUnrevealed.add(key);
                } else if (neighbor.cell.revealed && !neighbor.cell.isMine) {
                    adjacentRevealed.add(key);
                }
            }
        }
        
        // 分析特殊情况
        // TODO: 实现更复杂的线性模式分析
        
        return null;
    }
}