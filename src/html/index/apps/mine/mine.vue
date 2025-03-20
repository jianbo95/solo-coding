<template>
    <div class="minesweeper-container" v-if="init">
        <div class="game-header">
            <mine-tab ref="mineTab"
                :rows="rows"
                :cols="cols"
                :mineCount="mineCount"
                :useTime="useTime"
                :gameInstance="this"
                @new-game="newGame"
                @ai-play="startAIGame"
                @hint="showHint"
                @update-options="updateOptions"
                @load-endgame="loadEndgame"
            ></mine-tab>
        </div>
        
        <div class="game-status">
            <div class="mines-left">剩余雷数: {{ flagsLeft }}</div>
            <div class="game-time">用时: {{ gameTime }}秒</div>
            <div v-if="aiPlaying" class="guess-count">AI猜测: {{ guessCount }}</div>
        </div>
        
        <div class="game-message" v-if="gameMessage">
            <el-alert :title="gameMessage" :type="gameMessageType" :closable="false">
            </el-alert>
        </div>
        
        <div class="minesweeper-grid" :style="gridStyle">
            <div 
                v-for="(row, rowIndex) in grid" 
                :key="rowIndex" 
                class="grid-row"
            >
                <div 
                    v-for="(cell, colIndex) in row" 
                    :key="`${rowIndex}-${colIndex}`" 
                    class="grid-cell"
                    :class="getCellClass(cell)"
                    @click="handleCellClick(rowIndex, colIndex)"
                    @contextmenu.prevent="handleRightClick(rowIndex, colIndex)"
                >
                    <template v-if="cell.revealed">
                        <span v-if="cell.isMine">
                            <!-- 💣 -->
                            <img style="width: 100%; height: 100%; margin:0% 0 0 10%;" src="./html/index/apps/mine/bang.png" alt="" srcset="">
                        </span>
                        <span v-else-if="cell.adjacentMines > 0" :class="`number-${cell.adjacentMines}`">
                            {{ cell.adjacentMines }}
                        </span>
                    </template>
                    <span v-else-if="cell.flagged">
                        <img style="width: 70%; height: 70%; margin:20% 0 0 20%;" src="./html/index/apps/mine/flag.png" alt="" srcset="">
                    </span>
                </div>
            </div>
        </div>

        <template v-if="gameOver">
            <div class="game-buttons">
                <el-button size="small" type="primary" @click="replayCurrentGame" style="margin-right: 10px;">
                    重玩本局
                </el-button>
                <el-button 
                    size="small" 
                    type="warning" 
                    @click="undoLastMove"
                    :disabled="moveHistory.length === 0">
                    后退一步
                </el-button>
            </div>
        </template>
    </div>
</template>

<script>
import generateMines from './generateMines.js';
import checkIfMapIsLuckBased from './checkIfMapIsLuckBased.js';
import MinesweeperAI from './aiGame.js';
import MinesweeperAIV2 from './aiGameV2.js';
import MinesweeperAIV3 from './aiGameV3.js';
import MinesweeperAIV4 from './aiGameV4.js';
import MineTab from './mine-tab.vue';

var SelectMineAi = MinesweeperAI;

export default {
    name: 'Minesweeper',
    components: {
        MineTab
    },
    data() {
        return {
            init: false,
            size: window.size,
            rows: 10,
            cols: 10,
            mineCount: 15,
            useTime: 300,
            grid: [],
            gameStarted: false,
            gameOver: false,
            gameWon: false,
            firstClick: true,
            flagsLeft: 0,
            gameTime: 0,
            timer: null,
            gameMessage: '',
            gameMessageType: 'info',
            luckBasedMap: false,
            aiPlaying: false,
            aiInterval: null,
            guessCount: 0,
            currentMapLayout: null,
            moveHistory: [],
        };
    },
    computed: {
        maxMines() {
            return Math.floor(this.rows * this.cols * 0.3); // 最多30%的格子是雷
        },
        gridStyle() {
            return {
                gridTemplateColumns: `repeat(${this.cols}, 30px)`,
                gridTemplateRows: `repeat(${this.rows}, 30px)`
            };
        }
    },
    watch: {
        mineCount(newVal) {
            if (newVal > this.maxMines) {
                this.mineCount = this.maxMines;
            }
            this.flagsLeft = this.mineCount;
        },
        rows() {
            this.resetGame();
        },
        cols() {
            this.resetGame();
        }
    },
    created() {
        this.initGame(true);
        this.init = true;
        Core.waitRef(this.$refs, 'mineTab', () => {
            this.$refs.mineTab.setGameInstance(this);
        });
    },
    beforeDestroy() {
        this.stopAIGame();
        this.stopTimer();
    },

    methods: {
        // 添加新方法处理选项更新
        updateOptions(options) {
            this.rows = options.rows;
            this.cols = options.cols;
            this.mineCount = options.mineCount;
            this.useTime = options.useTime;
            this.resetGame();
        },
        initGame(generateMap) {
            this.gameStarted = false;
            this.gameOver = false;
            this.gameWon = false;
            this.firstClick = true;
            this.flagsLeft = this.mineCount;
            this.gameTime = 0;
            this.gameMessage = '';
            this.luckBasedMap = false;
            this.stopTimer();
            this.moveHistory = [];  // 添加这一行
            
            // 初始化空网格
            this.grid = Array(this.rows).fill().map(() => 
                Array(this.cols).fill().map(() => ({
                    isMine: false,
                    revealed: false,
                    flagged: false,
                    adjacentMines: 0
                }))
            );

            // 在初始化游戏时就生成地图
            if(generateMap == true) {
                this.generateMapWithSafeClick();
            }
        },
        newGame() {
            console.log('newGame');
            this.stopAIGame();
            this.initGame(true);
        },
        resetGame() {
            this.stopAIGame();
            this.initGame(true);
        },

        // 新增方法：生成带有安全点击的地图
        generateMapWithSafeClick() {
            console.log('generateMapWithSafeClick');
            // 随机选择一个安全的第一次点击位置
            const safeRow = Math.floor(Math.random() * this.rows);
            const safeCol = Math.floor(Math.random() * this.cols);
            
            // 生成地图，确保安全位置没有雷
            const { grid, guessCount } = generateMines(this.rows, this.cols, this.mineCount, safeRow, safeCol);
            this.grid = grid;

            // 保存当前地图布局
            this.currentMapLayout = JSON.parse(JSON.stringify(grid));
            
            // 标记安全点击位置
            this.grid[safeRow][safeCol].safeFirstClick = true;
            
            // if(guessCount > 0) {
                // 检查地图是否需要靠运气才能完成
                // this.checkIfMapIsLuckBased();
            // }
            // this.checkIfMapIsLuckBased();
        },

        // 添加加载残局方法
        loadEndgame(endgameData) {
            // 停止当前游戏相关活动
            this.stopAIGame();
            this.stopTimer();
            
            // 设置游戏参数
            this.rows = endgameData.rows;
            this.cols = endgameData.cols;
            this.mineCount = endgameData.mineCount;
            this.flagsLeft = endgameData.flagsLeft;
            this.gameTime = endgameData.gameTime;
            
            // 设置游戏状态
            this.gameStarted = endgameData.gameStarted;
            this.gameOver = endgameData.gameOver;
            this.gameWon = endgameData.gameWon;
            this.firstClick = endgameData.firstClick;
            
            // 加载网格数据
            this.grid = JSON.parse(JSON.stringify(endgameData.grid));
            
            // 保存当前地图布局
            this.currentMapLayout = JSON.parse(JSON.stringify(endgameData.grid));
            
            // 如果游戏正在进行中，重新启动计时器
            if (this.gameStarted && !this.gameOver) {
                this.startTimer();
            }
            
            // 清空游戏消息
            this.gameMessage = '';
            this.gameMessageType = 'info';
            
            // 重置移动历史
            this.moveHistory = [];
        },
        
        // 添加重玩本局方法
        replayCurrentGame() {
            if (!this.currentMapLayout) return;
            
            this.stopAIGame();
            this.stopTimer();
            
            // 重置游戏状态
            this.gameStarted = false;
            this.gameOver = false;
            this.gameWon = false;
            this.firstClick = true;
            this.flagsLeft = this.mineCount;
            this.gameTime = 0;
            this.gameMessage = '';
            this.luckBasedMap = false;
            
            // 恢复保存的地图布局
            this.grid = JSON.parse(JSON.stringify(this.currentMapLayout));
        },
        
        startTimer() {
            this.stopTimer();
            this.timer = setInterval(() => {
                this.gameTime++;
            }, 1000);
        },
        
        stopTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        
        generateMines(firstRow, firstCol) {
            const { grid, guessCount } = generateMines(this.rows, this.cols, this.mineCount, firstRow, firstCol);
            this.grid = grid;
            if(guessCount == 0) {
                return;
            }
            // 检查地图是否需要靠运气才能完成
            this.checkIfMapIsLuckBased();
        },
        
        countAdjacentMines(row, col) {
            let count = 0;
            for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                    if (r === row && c === col) continue;
                    if (this.grid[r][c].isMine) count++;
                }
            }
            return count;
        },
        
        // 修改handleCellClick方法
        handleCellClick(row, col) {
            if (this.gameOver || this.grid[row][col].flagged) return;
            
            // 保存当前状态
            this.moveHistory.push({
                grid: JSON.parse(JSON.stringify(this.grid)),
                flagsLeft: this.flagsLeft,
                gameTime: this.gameTime
            });
            
            if (this.firstClick) {
                this.firstClick = false;
                this.gameStarted = true;
                this.startTimer();
            }
            
            const cell = this.grid[row][col];
            
            if (cell.isMine) {
                cell.isExploded = true;  // 添加这一行，标记踩中的地雷
                this.revealAllMines();
                this.gameOver = true;
                this.stopTimer();
                this.gameMessage = '游戏结束！你踩到了地雷';
                this.gameMessageType = 'error';
                return;
            }
            
            this.revealCell(row, col);
            this.checkWinCondition();
        },
        
        handleRightClick(row, col) {
            if (this.gameOver || this.grid[row][col].revealed) return;
            
            // 保存当前状态
            this.moveHistory.push({
                grid: JSON.parse(JSON.stringify(this.grid)),
                flagsLeft: this.flagsLeft,
                gameTime: this.gameTime
            });
            
            const cell = this.grid[row][col];
            
            if (!cell.flagged && this.flagsLeft <= 0) return;
            
            cell.flagged = !cell.flagged;
            this.flagsLeft += cell.flagged ? -1 : 1;
            
            this.checkWinCondition();
        },
        
        revealCell(row, col) {
            const cell = this.grid[row][col];
            
            if (cell.revealed || cell.flagged) return;
            
            cell.revealed = true;
            
            // 如果周围没有雷，自动展开周围的格子
            if (cell.adjacentMines === 0) {
                for (let r = Math.max(0, row - 1); r <= Math.min(this.rows - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(this.cols - 1, col + 1); c++) {
                        if (r === row && c === col) continue;
                        this.revealCell(r, c);
                    }
                }
            }
        },
        
        revealAllMines() {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c].isMine) {
                        this.grid[r][c].revealed = true;
                    }
                }
            }
        },
        
        checkWinCondition() {
            // 检查是否所有非雷格子都已揭开
            let allNonMinesRevealed = true;
            let allMinesFlagged = true;
            
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const cell = this.grid[r][c];
                    if (!cell.isMine && !cell.revealed) {
                        allNonMinesRevealed = false;
                    }
                    if (cell.isMine && !cell.flagged) {
                        allMinesFlagged = false;
                    }
                }
            }
            
            if (allNonMinesRevealed || (allMinesFlagged && this.flagsLeft === 0)) {
                this.gameWon = true;
                this.gameOver = true;
                this.stopTimer();
                this.gameMessage = '恭喜你赢了！';
                this.gameMessageType = 'success';
                this.revealAllMines();
            }
        },
        
        getCellClass(cell) {
            return {
                'revealed': cell.revealed,
                'mine': cell.revealed && cell.isMine,
                'mine-exploded': cell.isExploded,  // 添加这一行
                'flagged': cell.flagged && !cell.revealed,
                'safe-first-click': cell.safeFirstClick && !cell.revealed && !cell.flagged
            };
        },
        
        checkIfMapIsLuckBased() {
            if (checkIfMapIsLuckBased(this.grid, this.rows, this.cols, this.mineCount)) {
                this.luckBasedMap = true;
                
                // 看看AI赢了没
                const ai = new MinesweeperAIV4();
                const winResult = ai.play(this.grid, this.rows, this.cols, this.mineCount);
                
                // 更新游戏消息，显示胜率
                this.gameMessage = `警告：当前地图可能需要靠运气才能完成，AI结果为${winResult}`;
                this.gameMessageType = "warning";
            }
        },
        async showHint() {
            const ai = new SelectMineAi();
            
            const move = ai.getNextMove(this.grid, this.rows, this.cols, false);
            
            if (move) {
                const cell = this.grid[move.row][move.col];
                const cellStatus = cell.revealed ? '已揭开' : (cell.flagged ? '已标记' : '未揭开');
                const cellContent = cell.revealed ? 
                    (cell.isMine ? '地雷' : (cell.adjacentMines > 0 ? `数字${cell.adjacentMines}` : '空白格')) : 
                    (cell.flagged ? '旗子' : `周围有${this.countAdjacentMines(move.row, move.col)}个地雷`);
                const action = move.action === 'reveal' ? '揭开' : '标记为旗子';
                const position = `第 ${move.row + 1} 行，第 ${move.col + 1} 列`;
                this.gameMessage = `提示：建议${action}${position}的方块（当前状态：${cellStatus}，显示内容：${cellContent}）`;
                this.gameMessageType = 'info';
            } else {
                this.gameMessage = '当前无法给出有效提示';
                this.gameMessageType = 'warning';
            }
        },
        async getHint() {
            if (this.gameOver) return;
            
            // 如果是第一次点击，先点击安全位置
            if (this.firstClick) {
                let safePosition = null;
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.cols; c++) {
                        if (this.grid[r][c].safeFirstClick) {
                            safePosition = { row: r, col: c };
                            break;
                        }
                    }
                    if (safePosition) break;
                }
                
                if (safePosition) {
                    this.handleCellClick(safePosition.row, safePosition.col);
                    return;
                }
            }
            
            const ai = new SelectMineAi();
            
            const move = ai.getNextMove(this.grid, this.rows, this.cols, false);
            console.log('nextMove', move); // {row: 5, col: 1}
            this.guessCount = ai.getGuessCount();
            
            if (!move) return;
            
            if (move.action === 'reveal') {
                this.handleCellClick(move.row, move.col); // 左键，揭开
            } else {
                this.handleRightClick(move.row, move.col); // 标记，旗子
            }
        },

        async startAIGame() {
            if (this.aiPlaying) return;
            this.aiPlaying = true;
            
            const playNextMove = async () => {
                if (this.gameOver || !this.aiPlaying) {
                    this.stopAIGame();
                    return;
                }

                await this.getHint();
                
                // 添加延迟使移动可见
                await new Promise(resolve => setTimeout(resolve, this.useTime));
                
                if (!this.gameOver) {
                    playNextMove();
                }
            };

            playNextMove();
        },

        stopAIGame() {
            this.aiPlaying = false;
        },
        undoLastMove() {
            if (this.moveHistory.length === 0) return;
            
            const lastState = this.moveHistory.pop();
            this.grid = lastState.grid;
            this.flagsLeft = lastState.flagsLeft;
            this.gameTime = lastState.gameTime;
            this.gameOver = false;
            this.gameMessage = '';
        },
        
    }
};
</script>

<style scoped>
.minesweeper-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px;
    font-family: Arial, sans-serif;
}

.game-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    width: 100%;
}

.game-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.game-status {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
}

.game-message {
    margin-bottom: 15px;
    width: 100%;
    max-width: 400px;
}

.minesweeper-grid {
    display: grid;
    gap: 1px;
    background-color: #999;
    padding: 1px;
    border: 2px solid #666;
}

.grid-cell {
    width: 30px;
    height: 30px;
    background-color: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
}

.grid-cell:hover:not(.revealed) {
    background-color: #ddd;
}

.grid-cell.revealed {
    background-color: #eee;
}

.grid-cell.mine {
    background-color: #ff9999;
}

.grid-cell.flagged {
    background-color: #99ff99;
}

/* 数字颜色 */
.number-1 { color: blue; }
.number-2 { color: green; }
.number-3 { color: red; }
.number-4 { color: darkblue; }
.number-5 { color: darkred; }
.number-6 { color: darkcyan; }
.number-7 { color: black; }
.number-8 { color: gray; }

.grid-cell.flagged {
    background-color: #99ff99;
}

.grid-cell.safe-first-click {
    background-color: #99ccff;
}

.grid-cell.mine-exploded {
    background-color: #ff0000;  /* 鲜红色背景 */
}

.game-buttons {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    gap: 10px;
}
</style>