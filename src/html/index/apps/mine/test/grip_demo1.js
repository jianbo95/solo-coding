/**
 * 描述一个简单地图
 * 0 1 +
 * 0 2 -
 * 0 2 +
 * - - -
 * - - -
 * - - -
 * 
 * 0 表示不是雷，已揭开
 * 1 表示不是雷，周围1个雷
 * 2 表示不是雷，周围2个雷
 * - 表示未揭开,不是雷
 * + 表示未揭开,是雷
 * 生成grid数据
 */
var easyMap = [
    ['0', '0', '1', '+', '-',],
    ['0', '0', '2', '-', '-',],
    ['0', '0', '2', '+', '-',],
    ['0', '0', '2', '-', '-',],
    ['0', '0', '1', '+', '-',],
];


function grid_demo1() {
    const rows = easyMap.length;
    const cols = easyMap[0].length;
    const grid = Array(rows).fill().map(() => 
        Array(cols).fill().map(() => ({
            isMine: false,
            revealed: false,
            flagged: false,
            adjacentMines: 0
        }))
    );

    // 计算地雷总数和未揭开格子数
    let mineCount = 0;
    let unrevealedCount = 0;

    // 根据 easyMap 设置格子状态
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const value = easyMap[r][c];
            if (value === '+') {
                grid[r][c].isMine = true;
                mineCount++;
                unrevealedCount++;
            } else if (value === '-') {
                unrevealedCount++;
            } else {
                grid[r][c].revealed = true;
                grid[r][c].adjacentMines = parseInt(value);
            }
        }
    }

    return {
        grid,
        rows,
        cols,
        mineCount,
        unrevealedCount  // 新增返回未揭开格子数
    };
}

export default grid_demo1;
