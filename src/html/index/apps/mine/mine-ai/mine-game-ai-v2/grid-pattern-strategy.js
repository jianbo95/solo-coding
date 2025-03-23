// grip_demo1.js grid-pattern-strategy.js 行 3, 列 3 一定是雷，九宫格分析不出来吗？
// 重新分析，遍历一下九宫格内上面放置雷的所有可能，然后多个可能叠加在一起，重叠的哪个雷，
// 不就是确定的了吗，应该找有雷的格子
// 这个策略是找雷策略，不是去找安全的格子，格子安不安全不用管
// 第一步先匹配九宫格

// - 表示未揭开的格子
// 数字表示周围有几颗雷
// ? 表示不确定的格子
// 0 表示已经揭开的格子
// N 表示已经揭开的格子，可以是任何数字
var mode = [
['N', 'N', 'N'], // 有个条件，就是上方必须是揭开的格子
['0', '1', '-'],
['0', '2', '-'],
['0', '?', '-']
];
    
export default class GridPatternStrategy {
    constructor() {
        this.debug = true;
    }

    analyze(grid, rows, cols, revealedCells) {
        this.log('开始九宫格模式分析...');
        
        // 遍历网格寻找匹配模式
        for (let row = 0; row <= rows - 3; row++) {
            for (let col = 0; col <= cols - 3; col++) {
                if (this.matchPattern(grid, row, col)) {
                    return this.printMatchedGrid(grid, row, col); // 修改这里，返回策略结果
                }
            }
        }
        return null;
    }

    matchPattern(grid, startRow, startCol) {
        // 第一列的实际要求是都是揭开的格子
        for (let r = 0; r < 3; r++) {
            const cell = grid[startRow + r][startCol];
            if (cell.revealed == false) {
                return false;
            }
        }

        // 检查第二列的1和2
        if (!grid[startRow][startCol + 1].revealed || grid[startRow][startCol + 1].adjacentMines !== 1) {
            return false;
        }
        if (!grid[startRow + 1][startCol + 1].revealed || grid[startRow + 1][startCol + 1].adjacentMines !== 2) {
            return false;
        }

        // 检查第三列是否都是未揭开的格子
        for (let r = 0; r < 3; r++) {
            const cell = grid[startRow + r][startCol + 2];
            if (cell.revealed) {
                return false;
            }
        }

        return true;
    }

    printMatchedGrid(grid, startRow, startCol) {
        console.log('找到匹配的九宫格模式：');
        console.log('格子内容：');
        
        for (let r = 0; r < 3; r++) {
            let row = [];
            for (let c = 0; c < 3; c++) {
                const cell = grid[startRow + r][startCol + c];
                if (cell.revealed) {
                    row.push(cell.adjacentMines);
                } else {
                    row.push('-');
                }
            }
            console.log(row.join(' '));
        }

        console.log('\n格子坐标：');
        for (let r = 0; r < 3; r++) {
            let row = [];
            for (let c = 0; c < 3; c++) {
                row.push(`(${startRow + r},${startCol + c})`);
            }
            console.log(row.join(' '));
        }

        // 推算所有存在雷的情况，有以下两种情况
        // 并把两种情况的格子内容打印出来
        console.log('\n所有可能的雷的分布情况：');
        
        // 第一种可能
        console.log('可能性 1:');
        const possibility1 = [
            ['0', '1', '+'],
            ['0', '2', '-'],
            ['0', '-', '+']
        ];
        for (let r = 0; r < 3; r++) {
            console.log(possibility1[r].join(' '));
        }

        // 第二种可能
        console.log('\n可能性 2:');
        const possibility2 = [
            ['0', '1', '-'],
            ['0', '2', '+'],
            ['0', '-', '+']
        ];
        for (let r = 0; r < 3; r++) {
            console.log(possibility2[r].join(' '));
        }

        // 直接可以判断出坐标 (2,2) 一定有雷，并推算出九宫格内 (2,2) 对应 grid 中的实际位置，并返回
        // 策略结果
        // 计算九宫格内坐标(2,2)在grid中的实际位置
        const definiteRow = startRow + 2;
        const definiteCol = startCol + 2;
        
        console.log(`\n确定位置(${definiteRow},${definiteCol})是雷`);
        
        // 检查该格子是否已经被标记
        const targetCell = grid[definiteRow][definiteCol];
        if (targetCell.flagged) {
            console.log('该格子已经被标记为雷，跳过');
            return null;
        }

        // 返回策略结果
        return {
            row: definiteRow,
            col: definiteCol,
            action: 'flag'
        };
    }

    log(message) {
        if (this.debug) {
            console.log(`[GridPatternStrategy] ${message}`);
        }
    }
}