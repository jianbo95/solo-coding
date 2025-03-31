const GridPrinter = {
    debug: false,

    setDebug(value) {
        this.debug = value;
    },

    printGrid(grid, rows, cols) {
        if (!this.debug) return;
        
        let output = '\n';
        
        // 计算最大列数的字符宽度
        const maxColWidth = Math.max(2, cols.toString().length);
        
        // 打印列标题
        output += '   ';
        for (let c = 0; c < cols; c++) {
            output += ` ${c.toString().padStart(maxColWidth)} `;
        }
        output += '\n';
        
        // 打印分隔线
        output += '   ' + '━'.repeat(cols * (maxColWidth + 2) + 1) + '\n';
        
        // 打印每一行
        for (let r = 0; r < rows; r++) {
            output += `${r.toString().padStart(2)} ┃`;
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                const symbol = this.getCellSymbol(cell).toString();
                output += `${symbol.padStart(maxColWidth)}  `;
            }
            output += '\n';
        }
        
        console.log(output);
    },
    
    getCellSymbol(cell) {
        if (cell.flagged) return 'F';
        if (!cell.revealed) return '■';
        if (cell.isMine) return '*';
        if (cell.adjacentMines === 0) return '0';
        return cell.adjacentMines;
    },
    
    printMine(grid, rows, cols) {
        if (!this.debug) return;
        
        console.log('\n雷的位置:');
        console.log('     0   1   2 ');
        console.log('   ━━━━━━━━━━');
        
        for (let r = 0; r < rows; r++) {
            let row = ` ${r} ┃`;
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell.isMine) {
                    row += '  * ';
                } else {
                    row += '    ';
                }
            }
            console.log(row);
        }
        console.log('');
    },
    
    printRevealed(grid, rows, cols) {
        if (!this.debug) return;
        
        console.log('\n揭开状态:');
        console.log('     0   1   2 ');
        console.log('   ━━━━━━━━━━');
        
        for (let r = 0; r < rows; r++) {
            let row = ` ${r} ┃`;
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                const p = r + ',' + c;
                if (cell.revealed) {
                    row += ` ${p} R `;
                } else {
                    row += ` ${p} - `;
                }
            }
            console.log(row);
        }
        console.log('');
    }
};

export default GridPrinter;