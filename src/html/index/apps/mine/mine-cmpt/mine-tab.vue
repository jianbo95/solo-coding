<template>
    <div class="mine-tabs">
        <div class="tabs-container">
            <div class="menu-items">
                <div class="menu-item dropdown">
                    游戏
                    <div class="dropdown-content">
                        <div @click="$emit('new-game')">新游戏</div>
                        <hr>
                        <div @click="setDifficulty('beginner')">初级</div>
                        <div @click="setDifficulty('intermediate')">中级</div>
                        <div @click="setDifficulty('expert')">高级</div>
                        <div @click="optionsVisible = true">自定义</div>
                        <hr>
                        <div @click="settingVisible = true">游戏选项</div>
                        <div @click="loadSeedVisible = true">加载种子</div>
                    </div>
                </div>

                <div class="menu-item dropdown">
                    AI助手
                    <div class="dropdown-content">
                        <div @click="$emit('ai-step')">AI单步</div>
                        <div @click="$emit('hint')">AI提示</div>
                        <div @click="$emit('ai-play')">AI玩游戏</div>
                    </div>
                </div>

                <div class="menu-item dropdown">
                    残局
                    <div class="dropdown-content">
                        <div @click="downloadEndgame">下载残局</div>
                        <div @click="downloadFullEndgame">下载完整残局</div>
                        <div @click="triggerUpload">上传残局</div>
                        <div @click="saveEndgame">保存残局</div>
                        <div @click="loadEndgameVisible = true">加载残局</div>
                    </div>
                    <input type="file" ref="fileInput" style="display: none" @change="uploadEndgame" accept=".json">
                </div>

                <div class="menu-item dropdown">
                    单元测试
                    <div class="dropdown-content">
                        <div @click="$emit('unit-test')">单元测试</div>
                        <div @click="testAI">策略分析</div>
                    </div>
                </div>

            </div>
        </div>

        <el-dialog
            title="加载种子"
            :visible.sync="loadSeedVisible"
            width="400px"
            :size="size">
            <div style="padding: 1rem">
                <el-input
                    v-model="seedInput"
                    placeholder="请输入游戏种子"
                    clearable
                    @keyup.enter.native="loadSeed">
                </el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button :size="size" @click="loadSeedVisible = false">取消</el-button>
                <el-button :size="size" type="primary" @click="loadSeed">确定</el-button>
            </span>
        </el-dialog>

        <!-- 选项弹框 -->
        <el-dialog
            title="自定义模式"
            :visible.sync="optionsVisible"
            width="400px"
            :size="size"
        >
            <div class="options-container" style="padding: 1rem">
                <div class="option-item">
                    <span>行数:</span>
                    <el-input-number :size="size" v-model="options.rows" :min="5" :max="99"></el-input-number>
                </div>
                <div class="option-item">
                    <span>列数:</span>
                    <el-input-number :size="size" v-model="options.cols" :min="5" :max="99"></el-input-number>
                </div>
                <div class="option-item">
                    <span>雷数:</span>
                    <el-input-number :size="size" v-model="options.mineCount" :min="1" :max="maxMines"></el-input-number>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button :size="size" @click="optionsVisible = false">取消</el-button>
                <el-button :size="size" type="primary" @click="saveOptions">确定</el-button>
            </span>
        </el-dialog>

        <!-- 设置弹框 -->
        <el-dialog
            title="设置"
            :visible.sync="settingVisible"
            width="400px"
            :size="size"
        >
            <div class="options-container" style="padding: 1rem">
                <div class="option-item">
                    <span>人机步时(毫秒):</span>
                    <el-input-number :size="size" v-model="options.useTime" :min="10" :max="2000" :step="100"></el-input-number>
                </div>
                <div class="option-item">
                    <span>显示坐标:</span>
                    <el-switch v-model="options.showCoordinates"></el-switch>
                </div>
                <div class="option-item">
                    <span>减少猜测:</span>
                    <el-switch v-model="options.reduceGuesses"></el-switch>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button :size="size" @click="settingVisible = false">取消</el-button>
                <el-button :size="size" type="primary" @click="saveSettings">确定</el-button>
            </span>
        </el-dialog>

        <!-- 加载残局弹框 -->
        <el-dialog
            title="加载残局"
            :visible.sync="loadEndgameVisible"
            width="500px"
            :size="size"
        >
            <div v-if="savedEndgames.length === 0" class="no-endgames">
                暂无保存的残局
            </div>
            <div v-else class="endgames-list">
                <div 
                    v-for="(endgame, index) in savedEndgames" 
                    :key="index"
                    class="endgame-item"
                >
                    <div class="endgame-info">
                        <div class="endgame-time">{{ formatDate(endgame.timestamp) }}</div>
                        <div class="endgame-details">
                            {{ endgame.rows }}x{{ endgame.cols }} | 雷数: {{ endgame.mineCount }} | 用时: {{ endgame.gameTime }}秒
                            <div v-if="endgame.seed" style="font-size:12px;color:#888;margin-top:3px;">
                                种子: {{ endgame.seed }}
                            </div>
                        </div>
                    </div>
                    <div class="endgame-actions">
                        <el-button 
                            type="primary"
                            size="mini"
                            icon="el-icon-video-play"
                            @click="loadEndgame(endgame)"
                            >
                        </el-button>
                        <el-button 
                            type="danger" 
                            size="mini" 
                            icon="el-icon-delete" 
                            @click.stop="deleteEndgame(index)">
                        </el-button>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import generateMinesTool from '@/html/index/apps/mine/mine-app/generateMinesBySeed.js';
import MinesweeperAI from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2.js';

export default {
    name: 'MineTab',
    props: {
        
    },
    data() {
        // 从localStorage获取保存的设置，如果没有则使用默认值
        const savedOptions = this.getSavedOptions();
        
        return {
            size: window.size,
            optionsVisible: false,
            settingVisible: false,
            loadEndgameVisible: false,
            options: savedOptions,
            gameInstance: null,
            savedEndgames: [],
            loadSeedVisible: false,
            seedInput: ''
        };
    },
    computed: {
        maxMines() {
            return Math.floor(this.options.rows * this.options.cols * 0.3); // 最多30%的格子是雷
        }
    },
    watch: {
        'options.rows'() {
            this.validateMineCount();
        },
        'options.cols'() {
            this.validateMineCount();
        }
    },
    mounted() {
        // 组件挂载时，如果有保存的设置，通知父组件更新
        const savedOptions = this.getSavedOptions();

        if (savedOptions) {
            var newOptions = Object.assign({}, savedOptions);
            this.$emit('init-options', newOptions);
        } else {
            this.$emit('init-options');
        }
        // 加载保存的残局
        this.loadSavedEndgames();
    },
    methods: {
        testAI() {
            // 调用 buildMinesGridListBySeed 方法生成多个地图
            var {gridList} = generateMinesTool.buildMinesGridListBySeed({
                rows: this.options.rows,
                cols: this.options.cols,
                mineCount: this.options.mineCount,
                maxAttempts: 500
            });

            // 指定策略，记录该策略触发且成功的种子
            var recordSuccess = 'connectedBlock';   // 连通块策略

            // 统计数据
            const stats = {
                totalGames: gridList.length,
                wins: 0,
                losses: 0,
                strategies: {}, // 策略使用统计
                strategySuccess: {}, // 策略成功统计
                strategyFailure: {}, // 策略失败统计
                totalGuesses: 0,
                averageGuesses: 0,
                failedSeeds: {}, // 记录失败的种子
                successSeeds: {} // 记录成功的种子
            };

            // 遍历每个地图进行AI测试
            gridList.forEach((item, index) => {
                const testGrid = JSON.parse(JSON.stringify(item.grid));
                const ai = new MinesweeperAI();
                let isComplete = false;
                let maxMoves = this.options.rows * this.options.cols * 2;
                let moveCount = 0;
                let guessCount = 0;
                let hitMine = false;

                // 模拟AI玩游戏
                while (!isComplete && moveCount < maxMoves && !hitMine) {
                    moveCount++;
                    const move = ai.getNextMove(testGrid, this.options.rows, this.options.cols);
                    
                    if (!move) break;

                    // 统计策略使用情况
                    stats.strategies[move.strategy] = (stats.strategies[move.strategy] || 0) + 1;
                    
                    if (move.isGuess) {
                        guessCount++;
                    }

                    // 模拟移动
                    if (move.action === 'reveal') {
                        if (!move.isCorrect) {
                            hitMine = true;
                            // 策略失败统计
                            stats.strategyFailure[move.strategy] = (stats.strategyFailure[move.strategy] || 0) + 1;
                            // 记录失败的种子（所有策略）
                            if (!stats.failedSeeds[move.strategy]) {
                                stats.failedSeeds[move.strategy] = [];
                            }
                            
                            // 计算剩余雷数
                            let remainingMines = this.options.mineCount;
                            for (let r = 0; r < testGrid.length; r++) {
                                for (let c = 0; c < testGrid[0].length; c++) {
                                    if (testGrid[r][c].flagged && testGrid[r][c].isMine) {
                                        remainingMines--;
                                    }
                                }
                            }
                            
                            stats.failedSeeds[move.strategy].push({
                                seed: item.seed,
                                position: `(${move.row}, ${move.col})`,
                                remainingMines: remainingMines
                            });
                        } else {
                            // 策略成功统计
                            stats.strategySuccess[move.strategy] = (stats.strategySuccess[move.strategy] || 0) + 1;
                            
                            // 记录指定策略的成功案例
                            if (move.strategy === recordSuccess) {
                                if (!stats.successSeeds[move.strategy]) {
                                    stats.successSeeds[move.strategy] = [];
                                }
                                stats.successSeeds[move.strategy].push({
                                    seed: item.seed,
                                    position: `(${move.row}, ${move.col})`
                                });
                            }
                            
                            this.simulateReveal(testGrid, move.row, move.col);
                        }
                    } else {
                        testGrid[move.row][move.col].flagged = true;
                    }

                    // 检查是否完成
                    isComplete = this.checkGridCompletion(testGrid);
                }

                // 更新统计数据
                if (isComplete && !hitMine) {
                    stats.wins++;
                } else {
                    stats.losses++;
                }
                stats.totalGuesses += guessCount;
            });

            // 计算平均值
            stats.averageGuesses = (stats.totalGuesses / stats.totalGames).toFixed(2);
            stats.winRate = ((stats.wins / stats.totalGames) * 100).toFixed(2);

            // 策略名称映射
            const strategyNames = {
                'basic': '基础策略',
                'pattern': '模式匹配',
                'overlap': '重叠分析',
                'probability': '概率计算',
                'guess': '随机猜测'
            };

            // 计算每个策略的使用率和成功率
            const strategyStats = Object.keys(stats.strategies).map(strategy => {
                const uses = stats.strategies[strategy];
                const success = stats.strategySuccess[strategy] || 0;
                const failure = stats.strategyFailure[strategy] || 0;
                const totalAttempts = success + failure;
                
                return {
                    name: strategyNames[strategy] || strategy,
                    uses,
                    success,
                    failure,
                    useRate: ((uses / Object.values(stats.strategies).reduce((a, b) => a + b, 0)) * 100).toFixed(2),
                    successRate: totalAttempts > 0 ? ((success / totalAttempts) * 100).toFixed(2) : '0.00'
                };
            });

            // 输出统计结果
            console.log('AI 测试统计:', {
                总场数: stats.totalGames,
                胜场: stats.wins,
                负场: stats.losses,
                胜率: `${stats.winRate}%`,
                平均猜测次数: stats.averageGuesses,
                策略统计: strategyStats.map(s => ({
                    策略名称: s.name,
                    // 使用次数: s.uses,
                    使用率: `${s.useRate}%`,
                    // 成功次数: s.success,
                    // 失败次数: s.failure,
                    成功率: `${s.successRate}%`
                }))
            });

            // 输出每个策略的失败种子信息（最多5个）
            Object.keys(stats.failedSeeds).forEach(strategy => {
                if (stats.failedSeeds[strategy] && stats.failedSeeds[strategy].length > 0) {
                    const failedCases = stats.failedSeeds[strategy].slice(0, 5);
                    console.log(`${strategyNames[strategy] || strategy}失败案例(${stats.failedSeeds[strategy].length}个中的前5个):`, 
                        failedCases.map(item => ({
                            种子: item.seed,
                            失败位置: item.position,
                            剩余雷数: item.remainingMines
                        }))
                    );
                }
            });

            // 输出指定策略的成功案例（最多5个）
            Object.keys(stats.successSeeds).forEach(strategy => {
                if (stats.successSeeds[strategy] && stats.successSeeds[strategy].length > 0) {
                    const successCases = stats.successSeeds[strategy].slice(0, 5);
                    console.log(`${strategyNames[strategy] || strategy}成功案例(${stats.successSeeds[strategy].length}个中的前5个):`, 
                        successCases.map(item => ({
                            种子: item.seed,
                            成功位置: item.position
                        }))
                    );
                }
            });

            // this.$message({
            //     dangerouslyUseHTMLString: true,
            //     message: `
            //         <div style="text-align:left">
            //             <div>AI测试完成：</div>
            //             <div>总场数: ${stats.totalGames}</div>
            //             <div>胜率: ${stats.winRate}%</div>
            //             <div>平均猜测次数: ${stats.averageGuesses}</div>
            //         </div>
            //     `,
            //     type: 'success',
            //     duration: 5000
            // });
        },

        // 辅助方法：模拟揭开格子
        simulateReveal(grid, row, col) {
            if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;
            if (grid[row][col].revealed || grid[row][col].isMine) return;
            
            grid[row][col].revealed = true;
            
            if (grid[row][col].adjacentMines === 0) {
                for (let r = Math.max(0, row - 1); r <= Math.min(grid.length - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(grid[0].length - 1, col + 1); c++) {
                        if (r === row && c === col) continue;
                        this.simulateReveal(grid, r, c);
                    }
                }
            }
        },

        // 辅助方法：检查地图是否完成
        checkGridCompletion(grid) {
            for (let row = 0; row < grid.length; row++) {
                for (let col = 0; col < grid[0].length; col++) {
                    if (!grid[row][col].isMine && !grid[row][col].revealed) {
                        return false;
                    }
                }
            }
            return true;
        },
        loadSeed() {
            if (!this.seedInput) {
                this.$message.warning('请输入有效的种子');
                return;
            }
            
            this.loadSeedVisible = false;
            this.$emit('load-seed', this.seedInput.trim());
            this.seedInput = '';
        },
        setGameInstance(gameInstance) {
            this.gameInstance = gameInstance;
        },
        // 获取保存的设置
        getSavedOptions() {
            try {
                const savedOptions = localStorage.getItem('game.mine.options');
                if (savedOptions) {
                    return JSON.parse(savedOptions);
                }
            } catch (e) {
                console.error('读取保存的设置失败', e);
            }
            
            // 如果没有保存的设置或解析失败，返回默认值
            return {
                rows: 10,
                cols: 10,
                mineCount: 15,
                useTime: 300,
                showCoordinates: false,
                reduceGuesses: true
            };
        },
        
        // 保存设置到localStorage
        saveOptionsToStorage() {
            try {
                localStorage.setItem('game.mine.options', JSON.stringify(this.options));
            } catch (e) {
                console.error('保存设置失败', e);
            }
        },
        
        saveOptions() {
            this.optionsVisible = false;
            
            // 获取上一次保存的设置
            const lastSettings = this.getSavedOptions();
            
            // 保存到localStorage
            this.saveOptionsToStorage();

            // 判断地图参数是否改变
            var isChangeGameMap = 
                lastSettings.rows !== this.options.rows || 
                lastSettings.cols !== this.options.cols || 
                lastSettings.mineCount !== this.options.mineCount;
            var notChangeGameMap = (isChangeGameMap == false);
            var newOptions = Object.assign({}, this.options);
            newOptions.notChangeGameMap = notChangeGameMap;
            // 通知父组件更新
            this.$emit('update-options', newOptions);
        },
        saveSettings() {
            this.settingVisible = false;
            // 保存到localStorage
            this.saveOptionsToStorage();
            // 通知父组件更新
            var newOptions = Object.assign({}, this.options);
            newOptions.notChangeGameMap = true;
            this.$emit('update-options', newOptions);
        },
        validateMineCount() {
            const maxMines = Math.floor(this.options.rows * this.options.cols * 0.3);
            if (this.options.mineCount > maxMines) {
                this.options.mineCount = maxMines;
            }
        },
        
        // 触发文件上传
        triggerUpload() {
            this.$refs.fileInput.click();
        },
        
        // 上传残局
        uploadEndgame(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const fileData = JSON.parse(e.target.result);
                    let data;
                    
                    // 判断是下载的残局还是直接的数据格式
                    if (fileData.data && Array.isArray(fileData.data)) {
                        // 下载的残局格式
                        data = fileData.data;
                    } else if (Array.isArray(fileData)) {
                        // 直接的数据格式
                        data = fileData;
                    } else {
                        throw new Error('无效的残局文件格式');
                    }

                    const gameInfo = data[0][0];
                    const userState = data[1];
                    
                    // 验证必要的游戏信息
                    if (!gameInfo.rows || !gameInfo.cols || !gameInfo.mineCount) {
                        throw new Error('残局文件缺少必要的游戏信息');
                    }

                    // 验证用户状态数组
                    if (!Array.isArray(userState) || userState.length !== gameInfo.rows) {
                        throw new Error('残局状态数据无效');
                    }

                    // 构造残局数据
                    const endgame = Object.assign({}, gameInfo, {
                        timestamp: Date.now(),
                        data: data
                    });

                    // 加载残局
                    this.$emit('load-endgame', endgame);
                    this.$message.success('残局加载成功');

                } catch (error) {
                    console.error('解析残局文件失败:', error);
                    this.$message.error(error.message || '无效的残局文件格式');
                }
            };
            
            reader.readAsText(file);
            event.target.value = '';
        },
        
        createEndgameData(gameInstance) {
            if (!gameInstance) return null;

            // 创建游戏信息数组
            const gameInfo = {
                rows: gameInstance.rows,
                cols: gameInstance.cols,
                mineCount: gameInstance.mineCount,
                flagsLeft: gameInstance.flagsLeft,
                gameTime: gameInstance.gameTime,
                gameStarted: gameInstance.gameStarted,
                gameOver: gameInstance.gameOver,
                gameWon: gameInstance.gameWon,
                firstClick: gameInstance.firstClick,
                seed: gameInstance.currentSeed
            };

            // 创建用户操作状态数组
            const userState = Array(gameInstance.rows).fill().map(() => 
                Array(gameInstance.cols).fill('_')
            );

            // 填充状态数组
            for (let r = 0; r < gameInstance.rows; r++) {
                for (let c = 0; c < gameInstance.cols; c++) {
                    const cell = gameInstance.grid[r][c];
                    if (cell.revealed) {
                        userState[r][c] = 'o';
                    } else if (cell.flagged) {
                        userState[r][c] = 'f';
                    }
                }
            }

            return [
                [gameInfo],
                userState
            ];
        },

        downloadEndgame() {
            const endgameData = this.createEndgameData(this.gameInstance);
            if (!endgameData) return;
            
            // 构造与本地存储格式一致的数据结构
            const singleEndgame = 
            Object.assign({},endgameData[0][0],
                {
                    timestamp: Date.now(),
                    data: endgameData
                }
            );
            
            // 格式化并下载
            const dataStr = JSON.stringify(singleEndgame, null, 4);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileName = `minesweeper_endgame_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.click();
        },

        downloadFullEndgame() {
            if (!this.gameInstance) return;
            
            // 创建完整游戏信息
            const gameInfo = {
                rows: this.gameInstance.rows,
                cols: this.gameInstance.cols,
                mineCount: this.gameInstance.mineCount,
                flagsLeft: this.gameInstance.flagsLeft,
                gameTime: this.gameInstance.gameTime,
                gameStarted: this.gameInstance.gameStarted,
                gameOver: this.gameInstance.gameOver,
                gameWon: this.gameInstance.gameWon,
                firstClick: this.gameInstance.firstClick
            };

            // 创建完整的网格状态
            const gridState = Array(this.gameInstance.rows).fill().map((_, r) => 
                Array(this.gameInstance.cols).fill().map((_, c) => {
                    const cell = this.gameInstance.grid[r][c];
                    return {
                        isMine: cell.isMine,
                        revealed: cell.revealed,
                        flagged: cell.flagged,
                        adjacentMines: cell.adjacentMines
                    };
                })
            );

            const fullData = {
                gameInfo: gameInfo,
                gridState: gridState
            };

            // 格式化并下载
            const dataStr = JSON.stringify(fullData, null, 4);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileName = `minesweeper_full_endgame_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.click();
        },

        // 修改保存残局方法
        saveEndgame() {
            const endgameData = this.createEndgameData(this.gameInstance);
            if (!endgameData) return;

            // 保存到本地存储
            const savedEndgames = JSON.parse(localStorage.getItem('game.mine.endGameMap') || '{}');
            const newEndgame = Object.assign({}, endgameData[0][0], {
                timestamp: Date.now(),
                data: endgameData
            });
            
            // 使用种子作为键名
            const key = 'handSave-' + (endgameData[0][0].seed || Date.now());
            savedEndgames[key] = newEndgame;
            
            localStorage.setItem('game.mine.endGameMap', JSON.stringify(savedEndgames));

            // 立即重新加载残局列表
            this.loadSavedEndgames();
            this.$message.success('残局保存成功');
        },

        // 加载残局
        loadEndgame(endgame) {
            // 发送加载事件，包含种子和用户状态信息
            console.log('endgame', JSON.stringify(endgame));
            this.$emit('load-endgame', endgame);

            this.loadEndgameVisible = false;
            this.$message.success('残局加载成功');
        },
        
       // 加载保存的残局列表
       loadSavedEndgames() {
            try {
                const savedData = localStorage.getItem('game.mine.endGameMap');
                if (savedData) {
                    const endgamesObj = JSON.parse(savedData);
                    // 将对象转换为数组用于显示
                    this.savedEndgames = Object.values(endgamesObj);
                } else {
                    this.savedEndgames = [];
                }
            } catch (e) {
                console.error('加载残局列表失败', e);
                this.savedEndgames = [];
            }
        },
        
        // 修改删除保存的残局方法
        deleteEndgame(index) {
            const endgame = this.savedEndgames[index];
            const savedEndgames = JSON.parse(localStorage.getItem('game.mine.endGameMap') || '{}');
            
            // 查找并删除对应的键
            const key = Object.keys(savedEndgames).find(k => 
                savedEndgames[k].timestamp === endgame.timestamp
            );
            
            if (key) {
                delete savedEndgames[key];
                localStorage.setItem('game.mine.endGameMap', JSON.stringify(savedEndgames));
                this.loadSavedEndgames(); // 重新加载列表
                this.$message.success('残局删除成功');
            } else {
                this.$message.error('删除残局失败');
            }
        },
        
        // 格式化日期
        formatDate(timestamp) {
            const date = new Date(timestamp);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        },
        setDifficulty(level) {
            const difficulties = {
                beginner: { rows: 9, cols: 9, mineCount: 10 },
                intermediate: { rows: 16, cols: 16, mineCount: 40 },
                expert: { rows: 16, cols: 30, mineCount: 99 }
            };
            
            const config = difficulties[level];
            this.options = Object.assign({}, this.options, config);
            
            // 使用 saveOptions 来保存和更新设置
            this.saveOptions();
        }
    }
};
</script>

<style lang="less" scoped>
.mine-tabs {
    width: 100%;
    margin-bottom: 20px;


.tabs-container {
    width: 100%;
    border-bottom: 1px solid #dcdfe6;
    background-color: #f5f7fa;
}

.menu-items {
    display: flex;
    justify-content: center;
    gap: 0;
}

.menu-item {
    padding: 10px 25px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    position: relative;
    color: #606266;
}

.menu-item:hover {
    color: #409EFF;
    background-color: #ecf5ff;
}

.menu-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: #409EFF;
    transition: width 0.3s;
}

.menu-item:hover::after {
    width: 100%;
}

/* 下拉菜单样式 */
.dropdown {
    position: relative;
}

.dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    min-width: 120px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    z-index: 1;
    border-radius: 4px;
}

.dropdown-content div {
    padding: 5px 15px;
    color: #606266;
    transition: all 0.3s;
}

.dropdown-content div:hover {
    background-color: #ecf5ff;
    color: #409EFF;
}

.dropdown:hover .dropdown-content {
    display: block;
}

/* 残局列表样式 */
.endgames-list {
    max-height: 400px;
    overflow-y: auto;
}

.endgame-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #ebeef5;
    transition: background-color 0.3s;
}

.endgame-item:hover {
    background-color: #f5f7fa;
}

.endgame-info {
    flex: 1;
}

.endgame-time {
    font-weight: bold;
    margin-bottom: 5px;
}

.endgame-details {
    color: #909399;
    font-size: 12px;
}

.no-endgames {
    text-align: center;
    padding: 20px;
    color: #909399;
}

.options-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
}

</style>