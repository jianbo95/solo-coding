import Utils from './utils.js';
import GridPrinter from './grid-printer.js';

export default class TankChainStrategy {
    constructor(debug) {
        this.debug = debug;
        this.utils = new Utils();
    }

    analyzeOneTwoPattern(grid, rows, cols, revealedCells) {
        for (const cell of revealedCells) {
            if (grid[cell.row][cell.col].adjacentMines !== 1) continue;
            
            const neighbors = this.utils.getSurroundingCells(grid, rows, cols, cell.row, cell.col);
            const twoNeighbors = neighbors.filter(n => 
                n.cell.revealed && !n.cell.isMine && 
                grid[n.row][n.col].adjacentMines === 2
            );
            
            for (const twoCell of twoNeighbors) {
                // 获取数字2周围的未知格子和已标记的雷
                const twoSurrounding = this.utils.getSurroundingCells(grid, rows, cols, twoCell.row, twoCell.col);
                const twoUnknowns = twoSurrounding.filter(n => !n.cell.revealed && !n.cell.flagged);
                const twoFlags = twoSurrounding.filter(n => n.cell.flagged).length;
                
                // 获取数字1周围的未知格子和已标记的雷
                const oneUnknowns = neighbors.filter(n => !n.cell.revealed && !n.cell.flagged);
                const oneFlags = neighbors.filter(n => n.cell.flagged).length;
                
                // 获取重叠区域
                const overlap = oneUnknowns.filter(n1 => 
                    twoUnknowns.some(n2 => n2.row === n1.row && n2.col === n1.col)
                );
                
                // 获取数字2独有的未知格子
                const uniqueToTwo = twoUnknowns.filter(n1 => 
                    !overlap.some(n2 => n2.row === n1.row && n2.col === n1.col)
                );

                // 如果数字1已经有一个雷，且与数字2共享未知格子
                if (oneFlags === 1 && overlap.length > 0) {
                    // 数字1的非重叠区域应该安全
                    const safeSquares = oneUnknowns.filter(n1 => 
                        !overlap.some(n2 => n2.row === n1.row && n2.col === n1.col)
                    );
                    
                    if (safeSquares.length > 0) {
                        this.log('找到1-2定式（数字1已有雷，非重叠区域安全）');
                        return {
                            row: safeSquares[0].row,
                            col: safeSquares[0].col,
                            action: 'reveal',
                            isGuess: false
                        };
                    }
                }
                
                // 如果数字2已经有一个雷，且还有两个未知格子
                // if (twoFlags === 1 && twoUnknowns.length === 2) {
                //     // 检查这两个未知格子中是否有一个与数字1共享
                //     const sharedUnknown = twoUnknowns.find(n1 => 
                //         oneUnknowns.some(n2 => n2.row === n1.row && n2.col === n1.col)
                //     );
                    
                //     if (sharedUnknown) {
                //         // 非共享的格子一定是安全的
                //         const safeSquare = twoUnknowns.find(n1 => 
                //             n1.row !== sharedUnknown.row || n1.col !== sharedUnknown.col
                //         );
                        
                //         this.log('找到1-2定式（数字2已有雷，非共享格子安全）');
                //         return {
                //             row: safeSquare.row,
                //             col: safeSquare.col,
                //             action: 'reveal',
                //             isGuess: false
                //         };
                //     }
                // }
            }
        }
        return null;
    }

    analyze(grid, rows, cols, revealedCells) {
        // 先检查1-2定式
        const oneTwoMove = this.analyzeOneTwoPattern(grid, rows, cols, revealedCells);
        if (oneTwoMove) return oneTwoMove;
        
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
                    !(n.row === cell.row && n.col === cell.col) &&
                    grid[n.row][n.col].adjacentMines === 1
                );
        
                if (revealedNeighborOfNeighbor.length > 0) {
                    // 验证是否形成真正的1-2-1模式
                    const isValidPattern = this.validateTankChainPattern(
                        grid, rows, cols,
                        cell,                           // 第一个1
                        neighbor,                       // 中间的2
                        revealedNeighborOfNeighbor[0]  // 第二个1
                    );

                    if (!isValidPattern) continue;

                    // 检查是否已经有标记的雷
                    const flaggedCount = neighborOfNeighbor.filter(n => n.cell.flagged).length;
                    const unrevealed = neighborOfNeighbor.filter(n => !n.cell.revealed && !n.cell.flagged);
                    
                    // 如果已经标记了一个雷，且剩下一个未知格子，那么这个格子一定安全
                    if (flaggedCount === 1 && unrevealed.length === 1) {
                        this.log('找到1-2-1坦克链（已有一个雷，剩余格子安全）');
                        return {
                            row: unrevealed[0].row,
                            col: unrevealed[0].col,
                            action: 'reveal',
                            isGuess: false
                        };
                    }
                    // 如果还没有标记雷，且只有两个未知格子，其中一个一定是雷
                    else if (flaggedCount === 0 && unrevealed.length === 2) {
                        // 检查这两个未知格子是否在正确的位置上
                        if (this.areCellsInValidPosition(grid, rows, cols, unrevealed, cell, revealedNeighborOfNeighbor[0])) {
                            this.log('找到1-2-1坦克链（需要标记雷）');
                            return {
                                row: unrevealed[0].row,
                                col: unrevealed[0].col,
                                action: 'flag',
                                isGuess: false
                            };
                        }
                    }
                }
            }
        }
        
        // 寻找1-1-1模式
        const oneOneOneMove = this.analyzeOneOneOnePattern(grid, rows, cols, revealedCells);
        if (oneOneOneMove) return oneOneOneMove;

 

        // 打印当前网格状态
        // GridPrinter.printGrid(grid, rows, cols);


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
                        if (move) {
                            this.log('找到1-1-1模式');
                            return move;
                        }
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
                        if (move) {
                            this.log('找到1-1-1模式');
                            return move;
                        }
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

    validateTankChainPattern(grid, rows, cols, one1, two, one2) {
        // 验证三个数字是否形成有效的1-2-1模式
        // 1. 检查两个1是否在2的对角位置
        const dx1 = Math.abs(one1.row - two.row);
        const dy1 = Math.abs(one1.col - two.col);
        const dx2 = Math.abs(one2.row - two.row);
        const dy2 = Math.abs(one2.col - two.col);
        
        if (dx1 !== 1 || dy1 !== 1 || dx2 !== 1 || dy2 !== 1) return false;
        
        // 2. 检查两个1是否在对角线上
        if (Math.abs(one1.row - one2.row) !== 2 || Math.abs(one1.col - one2.col) !== 2) return false;
        
        return true;
    }

    areCellsInValidPosition(grid, rows, cols, unknowns, one1, one2) {
        // 检查未知格子是否在2的旁边，且不在1的旁边
        for (const unknown of unknowns) {
            const isNextToOne1 = Math.abs(unknown.row - one1.row) <= 1 && Math.abs(unknown.col - one1.col) <= 1;
            const isNextToOne2 = Math.abs(unknown.row - one2.row) <= 1 && Math.abs(unknown.col - one2.col) <= 1;
            if (isNextToOne1 || isNextToOne2) return false;
        }
        return true;
    }
 
    log(message) {
        if (this.debug) {
            console.log(`[TankChainStrategy] ${message}`);
        }
    }

}