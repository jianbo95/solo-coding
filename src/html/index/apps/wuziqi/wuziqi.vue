<template>
  <div class="wuziqi">
    <h1>五子棋</h1>
    <div class="game-info">
      <p>当前玩家: {{ currentPlayer === 1 ? '黑子' : '白子' }}</p>
      <div class="buttons">
        <button @click="resetGame">重新开始</button>
        <button @click="toggleAI">{{ enableAI ? '双人模式' : 'AI对战' }}</button>
      </div>
    </div>
    <div class="board">
      <div v-for="(row, i) in board" :key="i" class="row">
        <div 
          v-for="(cell, j) in row" 
          :key="j" 
          class="cell"
          @click="makeMove(i, j)"
        >
          <div 
            v-if="cell !== 0" 
            class="piece"
            :class="{ 'black': cell === 1, 'white': cell === 2 }"
          ></div>
        </div>
      </div>
    </div>
    <div v-if="winner" class="winner-message">
      {{ winner === 1 ? '黑子' : '白子' }}获胜！
    </div>
  </div>
</template>

<script>
import AIWuziqi from './aiWuziqi.js'

export default {
  data() {
    return {
      board: [],
      currentPlayer: 1,
      winner: null,
      boardSize: 15,
      enableAI: false,
      ai: null
    }
  },
  created() {
    this.ai = new AIWuziqi(this.boardSize)
    this.initBoard()
  },
  methods: {
    initBoard() {
      this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0))
      this.currentPlayer = 1
      this.winner = null
    },
    async makeMove(row, col) {
      if (this.winner || this.board[row][col] !== 0) return
      
      this.board[row][col] = this.currentPlayer
      
      if (this.checkWin(row, col)) {
        this.winner = this.currentPlayer
        return
      }
      
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1

      // AI移动
      if (this.enableAI && !this.winner && this.currentPlayer === 2) {
        await new Promise(resolve => setTimeout(resolve, 500)) // 添加延迟使移动更自然
        const [aiRow, aiCol] = this.ai.getBestMove(this.board, 2)
        if (aiRow !== null && aiCol !== null) {
          this.makeMove(aiRow, aiCol)
        }
      }
    },
    checkWin(row, col) {
      const directions = [
        [[0, 1], [0, -1]],   // 水平
        [[1, 0], [-1, 0]],   // 垂直
        [[1, 1], [-1, -1]],  // 对角线
        [[1, -1], [-1, 1]]   // 反对角线
      ]
      
      return directions.some(direction => {
        const count = 1 + 
          this.countPieces(row, col, direction[0][0], direction[0][1]) +
          this.countPieces(row, col, direction[1][0], direction[1][1])
        return count >= 5
      })
    },
    countPieces(row, col, deltaRow, deltaCol) {
      let count = 0
      let currentRow = row + deltaRow
      let currentCol = col + deltaCol
      const player = this.board[row][col]
      
      while (
        currentRow >= 0 && 
        currentRow < this.boardSize && 
        currentCol >= 0 && 
        currentCol < this.boardSize && 
        this.board[currentRow][currentCol] === player
      ) {
        count++
        currentRow += deltaRow
        currentCol += deltaCol
      }
      
      return count
    },
    toggleAI() {
      this.enableAI = !this.enableAI
      this.resetGame()
    },

    resetGame() {
      this.initBoard()
    }
  }
}
</script>

<style scoped>
.wuziqi {
  background-color: #fff;
  width: 550px;
  margin:0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.game-info {
  margin-bottom: 20px;
  text-align: center;
}

.board {
  background-color: #DEB887;
  padding: 20px;
  border: 2px solid #8B4513;
}

.row {
  display: flex;
}

.cell {
  width: 30px;
  height: 30px;
  border: 1px solid #8B4513;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.cell::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: #8B4513;
  top: 50%;
  transform: translateY(-50%);
}

.cell::after {
  content: '';
  position: absolute;
  width: 1px;
  height: 100%;
  background-color: #8B4513;
  left: 50%;
  transform: translateX(-50%);
}

.piece {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  z-index: 1;
}

.black {
  background: radial-gradient(circle at 30% 30%, #666, #000);
}

.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ccc);
}

.winner-message {
  margin-top: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px;
}

button:hover {
  background-color: #45a049;
}
</style>