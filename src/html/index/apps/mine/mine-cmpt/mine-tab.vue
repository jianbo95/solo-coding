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
                        <div @click="$emit('ai-play')">AI玩游戏</div>
                        <div @click="loadSeedVisible = true">加载种子</div>
                    </div>
                    <input type="file" ref="fileInput" style="display: none" @change="uploadEndgame" accept=".json">
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
            title="游戏选项"
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
                <div class="option-item">
                    <span>人机步时(毫秒):</span>
                    <el-input-number :size="size" v-model="options.useTime" :min="10" :max="2000" :step="100"></el-input-number>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button :size="size" @click="optionsVisible = false">取消</el-button>
                <el-button :size="size" type="primary" @click="saveOptions">确定</el-button>
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
            this.$emit('update-options', { ...savedOptions });
        } else {
            this.$emit('update-options');
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
                useTime: 300
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
            // 保存到localStorage
            this.saveOptionsToStorage();
            // 通知父组件更新
            this.$emit('update-options', { ...this.options });
        },
        validateMineCount() {
            const maxMines = Math.floor(this.options.rows * this.options.cols * 0.3);
            if (this.options.mineCount > maxMines) {
                this.options.mineCount = maxMines;
            }
        },
        
        // 新增方法 - 下载残局
        downloadEndgame() {
            if (!this.gameInstance) return;
            
            const endgameData = {
                grid: this.gameInstance.grid,
                rows: this.gameInstance.rows,
                cols: this.gameInstance.cols,
                mineCount: this.gameInstance.mineCount,
                gameTime: this.gameInstance.gameTime,
                flagsLeft: this.gameInstance.flagsLeft,
                gameStarted: this.gameInstance.gameStarted,
                gameOver: this.gameInstance.gameOver,
                gameWon: this.gameInstance.gameWon,
                firstClick: this.gameInstance.firstClick,
                timestamp: new Date().getTime()
            };
            
            const dataStr = JSON.stringify(endgameData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileName = `minesweeper_endgame_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.click();
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
                    const endgameData = JSON.parse(e.target.result);
                    this.$emit('load-endgame', endgameData);
                    this.$message.success('残局加载成功');
                } catch (error) {
                    console.error('解析残局文件失败', error);
                    this.$message.error('残局文件格式错误');
                }
                
                // 重置文件输入，以便可以重复上传同一个文件
                this.$refs.fileInput.value = '';
            };
            
            reader.readAsText(file);
        },
        
        // 保存残局到浏览器
        saveEndgame() {
            if (!this.gameInstance || !this.gameInstance.gameStarted) {
                this.$message.warning('没有可保存的游戏');
                return;
            }
            
            const endgameData = {
                grid: this.gameInstance.grid,
                rows: this.gameInstance.rows,
                cols: this.gameInstance.cols,
                mineCount: this.gameInstance.mineCount,
                gameTime: this.gameInstance.gameTime,
                flagsLeft: this.gameInstance.flagsLeft,
                gameStarted: this.gameInstance.gameStarted,
                gameOver: this.gameInstance.gameOver,
                gameWon: this.gameInstance.gameWon,
                firstClick: this.gameInstance.firstClick,
                seed: this.gameInstance.currentSeed,
                timestamp: new Date().getTime()
            };
            
            try {
                // 获取已保存的残局
                let savedEndgames = [];
                const savedData = localStorage.getItem('minesweeper-endgames');
                if (savedData) {
                    savedEndgames = JSON.parse(savedData);
                }
                
                // 添加新残局
                savedEndgames.push(endgameData);
                
                // 限制保存数量，最多保存10个
                if (savedEndgames.length > 10) {
                    savedEndgames = savedEndgames.slice(-10);
                }
                
                // 保存到localStorage
                localStorage.setItem('minesweeper-endgames', JSON.stringify(savedEndgames));
                this.$message.success('残局保存成功');
                
                // 更新本地残局列表
                this.savedEndgames = savedEndgames;
            } catch (e) {
                console.error('保存残局失败', e);
                this.$message.error('保存残局失败');
            }
        },
        
        // 加载保存的残局列表
        loadSavedEndgames() {
            try {
                const savedData = localStorage.getItem('minesweeper-endgames');
                if (savedData) {
                    this.savedEndgames = JSON.parse(savedData);
                }
            } catch (e) {
                console.error('加载残局列表失败', e);
                this.savedEndgames = [];
            }
        },
        
        // 加载指定残局
        loadEndgame(endgame) {
            this.$emit('load-endgame', endgame);
            this.loadEndgameVisible = false;
            UI.success('残局加载成功');
        },
        
        // 删除保存的残局
        deleteEndgame(index) {
            this.savedEndgames.splice(index, 1);
            
            try {
                localStorage.setItem('minesweeper-endgames', JSON.stringify(this.savedEndgames));
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
            this.options = { ...this.options, ...config };
            
            // 保存到localStorage
            this.saveOptionsToStorage();
            // 通知父组件更新并开始新游戏
            this.$emit('update-options', { ...this.options });
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