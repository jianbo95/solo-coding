<template>
    <div class="minesweeper-container" v-if="init">
        <div class="game-header">
            <mine-tab ref="mineTab"
                @ai-step="aiStep"
                @new-game="newGame"
                @ai-play="startAIGame"
                @hint="showHint"
                @update-options="loadOptions"
                @init-options="initOptions"
                @load-endgame="loadEndgame"
                @load-seed="loadSeed"
            ></mine-tab>
        </div>

        <div class="seed-display">
            种子: {{ currentSeed }}
        </div>
        
        <div class="game-status">
            <div class="mines-left">
                <led-display :value="flagsLeft" :digits="3" />
            </div>
            
            <div v-if="aiPlaying" class="guess-count">AI猜测: {{ guessCount }}</div>

            <div class="game-time">
                <led-display :value="gameTime" :digits="3" />
            </div>
        </div>

        <!-- 添加坐标容器 -->
        <div class="grid-container" :style="gridContainerStyle">
            <!-- 列坐标 -->
            <div v-if="showCoordinates" class="col-coordinates">
                <div class="coordinate-spacer"></div>
                <div v-for="colIndex in cols" :key="'col-'+colIndex" class="coordinate">
                    {{colIndex}}
                </div>
            </div>
            
            <div class="grid-wrapper">
                <!-- 行坐标 -->
                <div v-if="showCoordinates" class="row-coordinates">
                    <div v-for="rowIndex in rows" :key="'row-'+rowIndex" class="coordinate">
                        {{rowIndex}}
                    </div>
                </div>
                
                <!-- 扫雷网格 -->
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
                                    <template v-if="useFont">
                                        💣
                                    </template>
                                    <template v-else>
                                        <img style="width: 100%; height: 100%; margin:0% 0 0 10%;" src="./html/index/apps/mine/image/bang.png" alt="" srcset="">
                                    </template>
                                </span>
                                <span v-else-if="cell.adjacentMines > 0" :class="`number-${cell.adjacentMines}`">
                                    {{ cell.adjacentMines }}
                                </span>
                            </template>
                            <span v-else-if="cell.flagged || cell.tempFlag">
                                <template v-if="useFont">
                                    🚩
                                </template>
                                <temlate v-else>
                                    <img style="width: 70%; height: 70%; margin:20% 0 0 20%;" src="./html/index/apps/mine/image/flag.png" alt="" srcset="">
                                </temlate>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        

        <div class="game-message" v-if="gameMessage">
            <el-alert :title="gameMessage" :type="gameMessageType" :closable="false">
            </el-alert>
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
import generateMines from './mine-app/generateMinesBySeed.js';
import checkIfMapIsLuckBased from './mine-app/checkIfMapIsLuckBased.js';
import MineGameAi from './mine-ai/mine-game-ai-v2.js';
import MineTab from './mine-cmpt/mine-tab.vue';
import LedDisplay from './mine-cmpt/led-display.vue';
var SelectMineAi = MineGameAi;

export default {
    name: 'Minesweeper',
    components: {
        MineTab,
        LedDisplay
    },
    data() {
        return {
            init: false,
            useFont: true,
            size: window.size,
            rows: 15,
            cols: 10,
            mineCount: 15,
            useTime: 300,
            showCoordinates: false,
            grid: [],
            gameInit: false,
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
            currentSeed: null, // 新增种子存储字段
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
        },
        gridContainerStyle() {
            return {
                width: 'fit-content'
            };
        }
    },
    created() {
        var modeuls = [
            'seedrandom',
        ];
        ModuleDefine.load(modeuls, () => {
            console.log('load finish');
            this.init = true;
            Core.waitRef(this.$refs, 'mineTab', () => {
                this.$refs.mineTab.setGameInstance(this);
                // 由 loadOptions 触发初始化游戏
            });
        });
    },
    beforeDestroy() {
        this.stopAIGame();
        this.stopTimer();
    },

    methods: {
        loadNewOptions(options) {
            if(options != null) {
                this.rows = options.rows;
                this.cols = options.cols;
                this.mineCount = options.mineCount;
                this.useTime = options.useTime;
                this.showCoordinates = options.showCoordinates;
            }
        },
        /**
         * 如果游戏未初始化，则开启新游戏
         * 如果游戏已经初始化，则设置不影响游戏对局的参数
         * @param {Object} options 
         */
        loadOptions(options) {
            console.log('loadOptions', options);
            // 加载新的选项
            this.loadNewOptions(options); 

            // 地图没有改变，不需要自动开始新游戏
            if(options.notChangeGameMap == true) {
                return;
            }
            // 开新游戏
            this.newGame();
        },
        initOptions(options) {
            console.log('initOptions', options);
            // 加载新的选项
            this.loadNewOptions(options); 
            // 开新游戏
            this.newGame();
        },
        newGame(seed) {
            this.stopAIGame();
            this.initGame(true, seed);
            this.gameInit = true;
        },
        initGame(generateMap, seed) {
            console.log('initGame(generateMap)');
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
                this.generateMapWithSafeClick(seed);
            }
        },

        loadSeed(seed) {
            this.generateMapWithSafeClick(seed);
        },

        // 生成带有安全点击的地图
        generateMapWithSafeClick(seed) {
            console.log('generateMapWithSafeClick');
            
            // 生成地图，确保安全位置没有雷
            const { grid, guessCount, safeRow, safeCol, seed: genSeed } = generateMines(this.rows, this.cols, this.mineCount, seed);
            seed = genSeed;
            this.currentSeed = seed; // 存储生成的种子
            console.log('seed', seed);
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

        // 格式： {"rows":9,"cols":9,"mineCount":10,"flagsLeft":10,"gameTime":2,"gameStarted":true,"gameOver":false,"gameWon":false,"firstClick":false,"seed":"009009001005051742637537891","timestamp":1742637495030,"data":[[{"rows":9,"cols":9,"mineCount":10,"flagsLeft":10,"gameTime":2,"gameStarted":true,"gameOver":false,"gameWon":false,"firstClick":false,"seed":"009009001005051742637537891"}],[["_","_","_","_","_","_","_","_","_"],["_","_","_","_","_","_","_","_","_"],["_","_","_","_","_","_","_","_","_"],["_","o","o","o","_","_","_","_","_"],["_","o","o","o","o","o","o","_","_"],["o","o","o","o","o","o","o","o","_"],["o","o","o","o","o","o","o","o","_"],["o","o","o","o","o","o","o","o","_"],["o","o","o","o","_","_","_","_","_"]]]}
        loadEndgame(endgameData) {
            // 初始化游戏状态
            this.initGame(false);
            
            // 从数据中获取游戏信息
            const [gameInfo, userState] = endgameData.data;
            const gameInfoData = gameInfo[0];
            
            // 设置基本游戏参数
            this.rows = gameInfoData.rows;
            this.cols = gameInfoData.cols;
            this.mineCount = gameInfoData.mineCount;
            this.gameTime = gameInfoData.gameTime || 0;
            this.flagsLeft = gameInfoData.flagsLeft;
            this.gameStarted = gameInfoData.gameStarted;
            this.gameOver = gameInfoData.gameOver;
            this.gameWon = gameInfoData.gameWon;
            this.firstClick = gameInfoData.firstClick;
            
            // 使用种子生成地图
            this.generateMapWithSafeClick(gameInfoData.seed);
            
            // 还原用户操作状态
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const state = userState[r][c];
                    if (state === 'o') {
                        // 揭开的格子
                        this.grid[r][c].revealed = true;
                    } else if (state === 'f') {
                        // 标记的格子
                        this.grid[r][c].flagged = true;
                    }
                }
            }

            // 如果游戏已经开始且未结束，启动计时器
            if (this.gameStarted && !this.gameOver) {
                this.startTimer();
            }
        },
        
        // 添加重玩本局方法
        replayCurrentGame() {
            this.newGame(this.currentSeed);
            // if (!this.currentMapLayout) return;
            
            // this.stopAIGame();
            // this.stopTimer();
            
            // // 重置游戏状态
            // this.gameStarted = false;
            // this.gameOver = false;
            // this.gameWon = false;
            // this.firstClick = true;
            // this.flagsLeft = this.mineCount;
            // this.gameTime = 0;
            // this.gameMessage = '';
            // this.luckBasedMap = false;
            
            // // 恢复保存的地图布局
            // this.grid = JSON.parse(JSON.stringify(this.currentMapLayout));
            
            // // 新增：重新标记安全点击位置
            // let foundSafeCell = false;
            // for (let r = 0; r < this.rows && !foundSafeCell; r++) {
            //     for (let c = 0; c < this.cols && !foundSafeCell; c++) {
            //         if (!this.grid[r][c].revealed && !this.grid[r][c].flagged) {
            //             this.grid[r][c].safeFirstClick = true;
            //             foundSafeCell = true;
            //         }
            //     }
            // }
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
            
            // 新增操作日志
            console.log(`用户点击 [揭開] 位置: 行 ${row + 1}, 列 ${col + 1}`);
            
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
                'mine-exploded': cell.isExploded,
                'flagged': cell.flagged && !cell.revealed,
                'safe-first-click': cell.safeFirstClick && !cell.revealed && !cell.flagged,
                'temp-flagged': cell.tempFlagged && !cell.revealed && !cell.flagged,
                'temp-safe': cell.tempSafe && !cell.revealed && !cell.flagged
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
            
            console.log('this.mineCount', this.mineCount);
            const move = ai.getNextMove(this.grid, this.rows, this.cols, false, this.mineCount);
            
            // 打印未处理的格子数量
            let unhandledCells = 0;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const cell = this.grid[r][c];
                    if (!cell.revealed && !cell.flagged) {
                        unhandledCells++;
                    }
                }
            }
            console.log(`当前还有 ${unhandledCells} 个格子需要处理`);
            
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
                
                // 保存当前状态，以便恢复
                const originalState = {
                    flagged: cell.flagged,
                    tempFlagged: cell.tempFlagged,
                    tempSafe: cell.tempSafe
                };
                
                // 添加临时标记
                if (move.action === 'flag') {
                    // 如果是标记操作，显示实际的旗子
                    cell.tempFlagged = true;
                    cell.tempFlag = true; // 新增属性，用于显示临时旗子图标
                } else {
                    // 如果是揭开操作，添加临时安全标记
                    cell.tempSafe = true;
                }
                
                // 1秒后移除临时标记
                setTimeout(() => {
                    if (this.grid[move.row] && this.grid[move.row][move.col]) {
                        // 恢复原始状态
                        cell.tempFlagged = originalState.tempFlagged;
                        cell.tempSafe = originalState.tempSafe;
                        cell.tempFlag = false; // 移除临时旗子图标
                    }
                }, 1000);
            } else {
                this.gameMessage = '当前无法给出有效提示';
                this.gameMessageType = 'warning';
            }
        },
        async aiStep() {
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
            
            const move = ai.getNextMove(this.grid, this.rows, this.cols, false, this.mineCount);
            console.log('nextMove', move);
            this.guessCount = ai.getGuessCount();
            
            if (!move) {
                this.gameMessage = 'AI无法确定下一步操作';
                this.gameMessageType = 'warning';
                return;
            }
            
            if (move.action === 'reveal') {
                this.handleCellClick(move.row, move.col); // 左键，揭开
            } else {
                this.handleRightClick(move.row, move.col); // 标记，旗子
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
            
            const move = ai.getNextMove(this.grid, this.rows, this.cols, false, this.mineCount);
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
    background-color: #eee;
    height: 100%;
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
    margin-bottom: 0px;
    border:0px solid #000;
    height: 40px;
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
    align-items: center;
    width: 100%;
    max-width: 400px;
    margin-bottom: 15px;
    padding: 8px;
    background-color: #c0c0c0;
    border: 3px solid;
    border-color: #ffffff #808080 #808080 #ffffff;
}

.mines-left, .game-time {
    display: flex;
    align-items: center;
}

.game-message {
    margin-top: 20px;
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
    width: fit-content;  /* 添加这行 */
}

.grid-row {
    display: contents;  /* 添加这行 */
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

.grid-cell.temp-flagged {
    background-color: #99ff99;
    animation: pulse-flag 1s;
}

.grid-cell.temp-safe {
    background-color: #99ccff;
    animation: pulse-safe 1s;
}

@keyframes pulse-flag {
    0% { background-color: #ccc; }
    50% { background-color: #99ff99; }
    100% { background-color: #ccc; }
}

@keyframes pulse-safe {
    0% { background-color: #ccc; }
    50% { background-color: #99ccff; }
    100% { background-color: #ccc; }
}

.game-buttons {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    gap: 10px;
}
.ai-controls {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
}
.seed-display {
    color: #aaa;
}

.grid-container {
    display: flex;
    flex-direction: column;
}

.grid-wrapper {
    display: flex;
}

.col-coordinates {
    display: flex;
    height: 20px;
    margin-bottom: 4px;
    margin-left: 4px;
}

.row-coordinates {
    display: flex;
    flex-direction: column;
    width: 20px;
    margin-top: 2px;
    margin-right: 4px;
}

.coordinate {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #666;
}

.coordinate-spacer {
    width: 20px;
}

.col-coordinates .coordinate {
    width: 31px;
    height: 20px;
    font-size: 12px;
}

.row-coordinates .coordinate {
    height: 31px;
    width: 20px;
    font-size: 12px;
}
</style>