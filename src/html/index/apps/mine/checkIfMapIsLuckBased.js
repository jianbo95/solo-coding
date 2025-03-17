export default function checkIfMapIsLuckBased(grid, rows, cols, mineCount) {
    const simulationGrid = JSON.parse(JSON.stringify(grid));
    let revealedCount = 0;

    function simulateReveal(grid, rows, cols, row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return;
        if (grid[row][col].revealed || grid[row][col].isMine) return;
        
        grid[row][col].revealed = true;
        
        // 如果周围没有雷，继续揭开周围的格子
        if (grid[row][col].adjacentMines === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    simulateReveal(grid, rows, cols, r, c);
                }
            }
        }
    }
    
    // 找到一个安全的起始点（非雷格子）
    let startRow = -1, startCol = -1;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!simulationGrid[r][c].isMine) {
                startRow = r;
                startCol = c;
                break;
            }
        }
        if (startRow !== -1) break;
    }
    
    // 模拟揭开第一个格子
    simulateReveal(simulationGrid, rows, cols, startRow, startCol);
    
    // 计算已揭开的格子数
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (simulationGrid[r][c].revealed) {
                revealedCount++;
            }
        }
    }
    
    // 如果揭开的格子数少于非雷格子总数的70%，认为地图可能需要靠运气
    const totalNonMines = rows * cols - mineCount;
    return revealedCount < totalNonMines * 0.7;
}
