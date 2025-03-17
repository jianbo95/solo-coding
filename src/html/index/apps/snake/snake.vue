<template>
    <div class="snake-game-container">
        <div class="game-layout">
            <game-option :visible.sync="optionsVisible" :super-ai-game="superAiGame"></game-option>
            <!-- 左侧移动控制 -->
            <mobile-control v-if="isMobile || forceMobile" @direction-change="handleDirectionChange" class="left-controls"></mobile-control>

            <!-- 中间游戏区域 -->
            <div class="game-center">
                <div class="game-header">
                    <div class="score">得分: {{ score }}</div>
                    <div class="high-score">最高分: {{ highScore }}</div>
                </div>

                <div class="game-board" ref="gameBoard">
                    <div v-for="(cell, index) in cells" :key="index"
                        :class="['cell', { 'snake': isSnake(index), 'food': isFood(index) }]" :style="getCellStyle(index)">
                    </div>
                </div>

                <div class="game-controls">
                    <button @click="startGame" :disabled="gameRunning">开始游戏</button>
                    <button @click="startAIGame" :disabled="gameRunning">AI玩</button>
                    <button @click="startSuperAIGame" :disabled="gameRunning">超级AI</button>
                    <button @click="pauseGame" :disabled="!gameRunning">暂停游戏</button>
                    <button @click="resetGame">重置游戏</button>
                    <button @click="showOptions" class="options-btn">
                        <i class="el-icon-setting"></i>
                    </button>
                </div>
            </div>

            <!-- 右侧排行榜 -->
            <ranking ref="ranking" class="right-ranking"></ranking>
        </div>

        <div class="game-over" v-if="gameOver">
            <div class="game-over-content">
                <h2>游戏结束</h2>
                <p>得分: {{ score }}</p>
                <button @click="resetGame">再来一次</button>
            </div>
        </div>
        
    </div>
</template>

<script>
import SnakeController from './control.js';
import MobileControl from './mobile-control.vue';
import Ranking from './ranking.vue';
import option from './option.vue';
import aiGame from './aiGame.js'; 
import SuperAIGame from './superAiGame.js';

export default {
    name: 'SnakeGame',
    components: {
        'game-option' : option,
        MobileControl,
        Ranking
    },
    data() {
        return {
            controller: null,
            aiGame: null, // AI游戏实例
            boardSize: { width: 20, height: 20 },
            cells: [],
            snake: [],
            food: null,
            direction: 'right',
            nextDirection: 'right',
            gameRunning: false,
            gameOver: false,
            score: 0,
            highScore: 0,
            gameInterval: null,
            aiInterval: null, // AI游戏间隔
            speed: 50,
            forceMobile: true,
            isMobile: false,
            stepsSinceLastFood: 0,
            maxStepsWithoutFood: 100,
            superAiGame: null,
            // 新增选项相关数据
            optionsVisible: false
        };
    },
    mounted() {
        this.checkDevice();
        this.initGame();
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('resize', this.checkDevice);
    },
    beforeDestroy() {
        this.cleanupGame();
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.checkDevice);
    },
    methods: {
        initGame() {
            this.controller = new SnakeController(this.boardSize);
            this.aiGame = new aiGame(this.controller);
            this.superAiGame = new SuperAIGame(this.controller);
            this.cells = Array(this.boardSize.width * this.boardSize.height).fill(0);
            this.resetGame();
        },

        // 新增方法 - 显示选项弹框
        showOptions() {
            console.log('showOptions before', this.optionsVisible);
            this.optionsVisible = true;
            console.log('showOptions', this.optionsVisible);
            // 添加一个延迟检查，确认值是否被正确设置
            setTimeout(() => {
                console.log('optionsVisible after timeout:', this.optionsVisible);
            }, 100);

            // this.optionsVisible = true;
            // console.log('showOptions', this.optionsVisible);
        },
        async startSuperAIGame() {
            if (this.gameOver) {
                this.resetGame();
            }

            this.gameRunning = true;
            this.gameOver = false;

            this.aiInterval = setInterval(async () => {
                if (this.snake && this.food && this.boardSize) {
                    this.nextDirection = await this.superAiGame.startAI(this.snake, this.food, this.boardSize);
                    this.updateGame();
                }
            }, this.speed);
        },

        startGame() {
            if (this.gameOver) {
                this.resetGame();
            }

            this.gameRunning = true;
            this.gameOver = false;

            this.gameInterval = setInterval(() => {
                this.updateGame();
            }, this.speed);
        },

        startAIGame() {
            if (this.gameOver) {
                this.resetGame();
            }

            this.gameRunning = true;
            this.gameOver = false;

            this.aiInterval = setInterval(() => {
                if (this.snake && this.food && this.boardSize) { // 确保 boardSize 已定义
                    this.nextDirection = this.aiGame.startAI(this.snake, this.food, this.boardSize);
                    this.updateGame();
                }
            }, this.speed);
        },

        pauseGame() {
            this.gameRunning = false;
            clearInterval(this.gameInterval);
            clearInterval(this.aiInterval);
        },

        resetGame() {
            if (this.gameInterval) {
                clearInterval(this.gameInterval);
            }
            if (this.aiInterval) {
                clearInterval(this.aiInterval);
            }
            this.stepsSinceLastFood = 0; // 重置步数计数器
            const gameState = this.controller.initializeGame();
            this.snake = gameState.snake;
            this.food = gameState.food;
            this.direction = 'right';
            this.nextDirection = 'right';
            this.gameRunning = false;
            this.gameOver = false;
            this.score = 0;
        },

        updateGame() {
            this.direction = this.nextDirection;
            
            // 增加步数计数
            this.stepsSinceLastFood++;
            
            // 检查是否超过最大步数
            if (this.stepsSinceLastFood > this.maxStepsWithoutFood) {
                this.endGame();
                return;
            }

            const result = this.controller.moveSnake(this.snake, this.food, this.direction);

            if (result.gameOver) {
                this.endGame();
                return;
            }

            this.snake = result.snake;

            if (result.foodEaten) {
                this.food = this.controller.generateFood(this.snake);
                this.score += 10;
                this.stepsSinceLastFood = 0; // 重置步数计数器

                // 增加游戏难度
                if (this.score % 50 === 0 && this.speed > 50) {
                    this.speed -= 10;
                    clearInterval(this.gameInterval);
                    this.gameInterval = setInterval(() => {
                        this.updateGame();
                    }, this.speed);
                }
            }
        },

        endGame() {
            this.gameRunning = false;
            this.gameOver = true;
            clearInterval(this.gameInterval);
            clearInterval(this.aiInterval); // 添加这行，清理AI定时器

            // 调用 superAiGame 的 gameOver 方法保存训练数据
            if (this.superAiGame) {
                this.superAiGame.gameOver(this.score);
            }
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snakeHighScore', this.highScore);
            }
            // 添加分数到排行榜
            this.$refs.ranking.addScore(this.score);
        },
        cleanupGame() {
            if (this.gameInterval) {
                clearInterval(this.gameInterval);
            }
            if (this.aiInterval) {  // 添加这段，确保在组件销毁时清理AI定时器
                clearInterval(this.aiInterval);
            }
        },
        handleKeyDown(event) {
            this.controller.handleKeyPress(event.key, this.direction, (newDirection) => {
                this.nextDirection = newDirection;
            });
        },

        handleDirectionChange(direction) {
            this.controller.changeDirection(direction, this.direction, (newDirection) => {
                this.nextDirection = newDirection;
            });
        },

        isSnake(index) {
            return this.snake.some(segment => segment.y * this.boardSize.width + segment.x === index);
        },

        isFood(index) {
            if (!this.food) return false;
            return this.food.y * this.boardSize.width + this.food.x === index;
        },

        getCellStyle(index) {
            // 为蛇头添加特殊样式
            if (this.snake.length > 0 && this.snake[0].y * this.boardSize.width + this.snake[0].x === index) {
                return {
                    backgroundColor: '#2ecc71',
                    borderRadius: '4px'
                };
            }
            return {};
        },

        checkDevice() {
            this.isMobile = window.innerWidth <= 768;
        },

        cleanupGame() {
            if (this.gameInterval) {
                clearInterval(this.gameInterval);
            }
        }
    },
    created() {
        // 从本地存储加载最高分
        const savedHighScore = localStorage.getItem('snakeHighScore');
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore);
        }
    }
};
</script>

<style scoped>
/* 修改布局样式 */
.snake-game-container {
  padding: 20px;
  font-family: Arial, sans-serif;
  width: 100%;
  box-sizing: border-box;
}

.game-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  margin: 0 auto;
}

.game-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.left-controls {
  flex: 0 0 auto;
  align-self: flex-start;
  position: sticky;
  top: 20px;
}

.right-ranking {
  flex: 0 0 auto;
  align-self: flex-start;
  position: sticky;
  top: 20px;
}

/* 响应式布局调整 */
@media (max-width: 1000px) {
  .game-layout {
    flex-direction: column;
    align-items: center;
  }

  .left-controls, .right-ranking {
    position: static;
    margin-top: 20px;
  }
}

/* 保留原有样式 */
.game-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin-bottom: 15px;
}

.score,
.high-score {
    font-size: 18px;
    font-weight: bold;
}

.game-board {
    display: grid;
    grid-template-columns: repeat(20, 1fr);
    grid-template-rows: repeat(20, 1fr);
    width: 400px;
    height: 400px;
    border: 2px solid #333;
    background-color: #f0f0f0;
}

.cell {
    border: 1px solid #ddd;
    box-sizing: border-box;
}

.snake {
    background-color: #3498db;
    border-radius: 2px;
}

.food {
    background-color: #e74c3c;
    border-radius: 50%;
}

.game-controls {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.game-controls button {
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.game-controls button:hover {
    background-color: #2980b9;
}

.game-controls button:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
}

.control-row {
    display: flex;
    gap: 10px;
    margin: 5px 0;
}

.direction-btn {
    width: 50px;
    height: 50px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.game-over {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.game-over-content {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
}

.game-over-content h2 {
    margin-top: 0;
    color: #e74c3c;
}

.game-over-content button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 15px;
}

@media (max-width: 768px) {
    .game-board {
        width: 300px;
        height: 300px;
    }
}

@media (max-width: 480px) {
    .game-board {
        width: 280px;
        height: 280px;
    }
}
</style>