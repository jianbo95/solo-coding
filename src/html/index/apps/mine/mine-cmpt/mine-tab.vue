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
                        <div @click="settingVisible = true">设置</div>
                        <div @click="$emit('ai-play')">AI玩游戏</div>
                        <div @click="loadSeedVisible = true">加载种子</div>
                    </div>
                </div>
                
                <div class="menu-item" @click="$emit('ai-step')">AI单步</div>
                <div class="menu-item" @click="$emit('hint')">提示</div>
                <div class="menu-item dropdown">
                    残局
                    <div class="dropdown-content">
                        <div @click="downloadEndgame">下载残局</div>
                        <div @click="triggerUpload">上传残局</div>
                        <div @click="saveEndgame">保存残局</div>
                        <div @click="loadEndgameVisible = true">加载残局</div>
                    </div>
                    <input type="file" ref="fileInput" style="display: none" @change="uploadEndgame" accept=".json">
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
                showCoordinates: false
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
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!Array.isArray(data) || data.length < 2) {
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
                    const endgame = {
                        ...gameInfo,
                        timestamp: Date.now(),
                        data: data
                    };

                    // 加载残局
                    this.$emit('load-endgame', endgame);
                    this.$message.success('残局加载成功');

                } catch (error) {
                    console.error('解析残局文件失败:', error);
                    this.$message.error('无效的残局文件格式');
                }
            };
            
            reader.readAsText(file);
            
            // 清空文件输入框，允许重复选择同一文件
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
            
            // 格式化数组为棋盘样式
            const formattedData = [
                endgameData[0],  // 保持游戏信息数组不变
                ...endgameData.slice(1).map(array => 
                    JSON.stringify(array)
                        .replace(/],\[/g, '],\n    [')  // 每行数据换行
                        .replace(/^\[/, '[\n    [')     // 开头换行
                        .replace(/\]$/, '\n]')          // 结尾换行
                )
            ];
            
            const dataStr = `[\n${JSON.stringify(formattedData[0], null, 4)},\n${formattedData.slice(1).join(',\n')}\n]`;
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileName = `minesweeper_endgame_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            
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
            const savedEndgames = JSON.parse(localStorage.getItem('game.mine.endGames') || '[]');
            savedEndgames.push({
                ...endgameData[0][0],
                timestamp: Date.now(),
                data: endgameData
            });
            localStorage.setItem('game.mine.endGames', JSON.stringify(savedEndgames));

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
                const savedData = localStorage.getItem('game.mine.endGames');
                if (savedData) {
                    this.savedEndgames = JSON.parse(savedData);
                }
            } catch (e) {
                console.error('加载残局列表失败', e);
                this.savedEndgames = [];
            }
        },
        
        // 修改删除保存的残局方法
        deleteEndgame(index) {
            this.savedEndgames.splice(index, 1);
            
            try {
                localStorage.setItem('game.mine.endGames', JSON.stringify(this.savedEndgames));
                this.$message.success('残局删除成功');
            } catch (e) {
                console.error('删除残局失败', e);
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

<style scoped>
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