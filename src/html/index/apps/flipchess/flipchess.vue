<template>
  <div class="flipchess">
    <div class="game-menu">
      <!-- 游戏模式选择 -->
      <el-select v-model="gameMode" 
                 :disabled="gameStarted"
                 size="mini"
                 placeholder="游戏模式">
        <el-option label="双人对战" value="pvp"></el-option>
        <el-option label="人机对战" value="pve"></el-option>
      </el-select>

      <!-- 新游戏按钮 -->
      <el-button size="mini" 
                 :type="gameStarted ? 'warning' : 'primary'"
                 @click="startGame">
        {{ gameStarted ? '重新开始' : '新游戏' }}
      </el-button>
    </div>
    <div class="game-container">
      <!-- 红方吃掉的棋子 -->
      <div class="eaten-pieces left-eaten red-eaten">
        <div v-for="(piece, index) in eatenRedPieces" 
             :key="'red-' + index" 
             class="piece red">
          {{ piece.name }}
        </div>
      </div>

      <!-- 中间棋盘区域 -->
      <div class="center-area">

        <div class="game-info">
          <div class="player-info">
            <div :class="['player', { active: currentPlayer === 'red' }]">
              红方 {{ isAIMode ? '(玩家)' : '' }}
            </div>
            <div :class="['player', { active: currentPlayer === 'black' }]">
              黑方 {{ isAIMode ? '(AI)' : '' }}
            </div>
          </div>
        </div>

        <div class="board">
          <div v-for="(row, i) in board" :key="i" class="row">
            <div v-for="(cell, j) in row" 
                :key="j" 
                class="cell"
                @click="handleCellClick(i, j)">
              <div v-if="cell" 
                  :class="['piece', cell.color, { 'covered': !cell.revealed, 'selected': isSelected(i, j) }]">
                {{ cell.revealed ? cell.name : '' }}
              </div>
            </div>
          </div>
        </div>

      </div> <!-- center-area -->

      <!-- 黑方吃掉的棋子 -->
      <div class="eaten-pieces right-eaten black-eaten">
        <div v-for="(piece, index) in eatenBlackPieces" 
              :key="'black-' + index" 
              class="piece black">
          {{ piece.name }}
        </div>
      </div><!-- end 黑方吃掉的棋子 -->

    </div> <!-- game-container -->
    <div class="down-eaten">
      <!-- 红方吃掉的棋子 -->
      <div class="eaten-pieces red-eaten">
        <div v-for="(piece, index) in eatenRedPieces" 
             :key="'red-' + index" 
             class="piece red">
          {{ piece.name }}
        </div>
      </div>
      <!-- 黑方吃掉的棋子 -->
      <div class="eaten-pieces black-eaten">
        <div v-for="(piece, index) in eatenBlackPieces" 
              :key="'black-' + index" 
              class="piece black">
          {{ piece.name }}
        </div>
      </div><!-- end 黑方吃掉的棋子 -->
    </div>
  </div>
</template>

<script>
import RandomChess from './RandomChess.js';
import EatRule from './EatRule.js';
import BetweenPiece from './betweenPiece.js';
import FlipchessAI from './flipchessAi.js';

export default {
  data() {
    return {
      gameMode: 'pvp', // 添加游戏模式数据
      board: [], // 8x4 的棋盘
      gameStarted: false,
      currentPlayer: null,
      selectedPiece: null,
      moveHistory: [], // 记录移动历史，用于检测追逐
      eatenRedPieces: [],  // 被吃掉的红色棋子
      eatenBlackPieces: [], // 被吃掉的黑色棋子
      isAIMode: false,
      ai: null,
    }
  },
  created() {
    // 创建一个空棋盘
    this.board = Array(4).fill().map(() => Array(8).fill(null));
  },
  methods: {
    handleGameMode(command) {
      this.isAIMode = command === 'pve';
      this.startGame();
    },
    startGame() {
      this.board = RandomChess.initBoard();
      this.gameStarted = true;
      this.currentPlayer = null;
      this.selectedPiece = null;
      this.moveHistory = [];
      this.eatenRedPieces = [];
      this.eatenBlackPieces = [];

      if (this.isAIMode) {
        this.ai = new FlipchessAI();
      }
    },

    restartGame() {
      if (confirm('确定要重新开始游戏吗？')) {
        this.startGame();
      }
    },
    
    isSelected(i, j) {
      return this.selectedPiece && 
             this.selectedPiece.i === i && 
             this.selectedPiece.j === j;
    },
    
    async handleCellClick(i, j) {
      if (!this.gameStarted) return;

      // 如果是 AI 模式且当前是 AI 回合，不响应点击
      if (this.isAIMode && this.currentPlayer === 'black') return;
      
      const piece = this.board[i][j];
      
      // 优先处理已选中棋子的移动/吃子
      if (this.selectedPiece) {
        // 如果点击的是当前已选中的棋子，取消选中
        if (this.isSelected(i, j)) {
          this.selectedPiece = null;
          return;
        }
        await this.tryMove(i, j);
        
        // 在移动完成后，如果是 AI 模式且轮到 AI，则执行 AI 移动
        if (this.isAIMode && this.currentPlayer === 'black') {
          await this.makeAIMove();
        }
        return;
      }

      if (!piece) return;

      // 处理未翻开的棋子
      if (!piece.revealed) {
        piece.revealed = true;
        if (!this.currentPlayer) {
          this.currentPlayer = piece.color;
        }
        console.log('翻开棋子:', piece.name);
        this.switchPlayer();
        
        // 在翻开棋子后，如果是 AI 模式且轮到 AI，则执行 AI 移动
        if (this.isAIMode && this.currentPlayer === 'black') {
          await this.makeAIMove();
        }
      } else if (piece.color === this.currentPlayer) {
        this.selectedPiece = { i, j, piece };
      }
    },

    async makeAIMove() {
      // 添加延迟，使 AI 走子更自然
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiDecision = this.ai.makeMove(this.board);
      if (!aiDecision) return;

      if (aiDecision.type === 'reveal') {
        // 翻开棋子
        const { i, j } = aiDecision.position;
        const piece = this.board[i][j];
        piece.revealed = true;
        console.log('AI 翻开棋子:', piece.name);
        this.switchPlayer();
      } else if (aiDecision.type === 'move') {
        // 移动棋子
        const { from, to } = aiDecision.move;
        this.selectedPiece = {
          i: from.i,
          j: from.j,
          piece: this.board[from.i][from.j]
        };
        this.tryMove(to.i, to.j);
      }
    },

    // 添加轮换玩家方法
    switchPlayer() {
      this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    },

    tryMove(toI, toJ) {
      const fromI = this.selectedPiece.i;
      const fromJ = this.selectedPiece.j;
      const fromPiece = this.selectedPiece.piece;
      const toPiece = this.board[toI][toJ];
      
      // 检查是否是有效移动
      if (!this.isValidMove(fromI, fromJ, toI, toJ)) {
        console.log('移动失败:', fromPiece.name, '行动力不够');
        this.selectedPiece = null;
        return;
      }
      
      // 如果目标位置有棋子，识别为吃子操作
      if (toPiece) {
        console.log('尝试吃子:', fromPiece.name, '→', toPiece.revealed ? toPiece.name : '未翻开的子');
        
        // 1. 检查是否是自己的子（如果是已翻开的子）
        if (toPiece.revealed && fromPiece.color === toPiece.color) {
          console.log('吃子失败: 不能吃自己的子');
          this.selectedPiece = null;
          return;
        }

        // 2. 检查是否是未翻开的子（炮可以吃未翻开的子）
        if (!toPiece.revealed && fromPiece.name !== '炮') {
          console.log('吃子失败: 只有炮可以吃未翻开的子');
          this.selectedPiece = null;
          return;
        }

        // 3. 检查是否能吃对方的子（包含等级判断）
        if (toPiece.revealed && !EatRule.canEat(fromPiece, toPiece, this.board, fromI, fromJ, toI, toJ)) {
          console.log('吃子失败: 不能吃比自己大的子');
          this.selectedPiece = null;
          return;
        }
        
        // 记录移动历史
        this.moveHistory.push({
          from: { i: fromI, j: fromJ, piece: fromPiece },
          to: { i: toI, j: toJ, piece: toPiece }
        });
        
        // 检查追逐
        if (this.isChasing()) {
          return;
        }
        
        // 执行吃子时，添加被吃的棋子到对应数组
        if (EatRule.isSamePiece(fromPiece, toPiece)) {
           // 同归于尽
           console.log(`${fromPiece.name} 与 ${toPiece.name} 同归于尽`);
          // 同归于尽时两个棋子都要加入对应数组
          if (fromPiece.color === 'red') {
            this.eatenRedPieces.push(fromPiece);
            this.eatenBlackPieces.push(toPiece);
          } else {
            this.eatenBlackPieces.push(fromPiece);
            this.eatenRedPieces.push(toPiece);
          }
          this.board[fromI][fromJ] = null;
          this.board[toI][toJ] = null;
        } else {
          // 正常吃子
          if (!toPiece.revealed) {
            // 炮吃未翻开的子
            toPiece.revealed = true;
            if (fromPiece.color === toPiece.color) {
              console.log(`${fromPiece.name} 吃到了自己的 ${toPiece.name}`);
            } else {
              console.log(`${fromPiece.name} 吃掉了对方的 ${toPiece.name}`);
            }
          } else {
            console.log(`${fromPiece.name} 吃掉了 ${toPiece.name}`);
          }

          if (toPiece.color === 'red') {
            this.eatenRedPieces.push(toPiece);
          } else {
            this.eatenBlackPieces.push(toPiece);
          }
          this.board[fromI][fromJ] = null;
          this.board[toI][toJ] = fromPiece;
        }
        this.switchPlayer();
      } else {
        // 普通移动
        console.log('移动:', fromPiece.name);
        this.board[fromI][fromJ] = null;
        this.board[toI][toJ] = fromPiece;
        this.switchPlayer();
      }
      
      this.selectedPiece = null;
      this.checkGameOver();
    },
    
    isValidMove(fromI, fromJ, toI, toJ) {
      const fromPiece = this.board[fromI][fromJ];
      const toPiece = this.board[toI][toJ];
      
      // 炮的特殊移动规则
      if (fromPiece.name === '炮') {
        // 必须在同一直线上
        if (fromI !== toI && fromJ !== toJ) {
          return false;
        }
        // 如果目标位置有棋子，需要隔着一个子
        if (toPiece) {
          return BetweenPiece.hasOnePieceBetween(this.board, fromI, fromJ, toI, toJ);
        }
        // 如果是空位置，允许移动一格
        return Math.abs(fromI - toI) + Math.abs(fromJ - toJ) === 1;
      }
      
      // 其他棋子只能横竖移动一格
      return Math.abs(fromI - toI) + Math.abs(fromJ - toJ) === 1;
    },
    
    isChasing() {
      if (this.moveHistory.length < 10) return false;
      
      // 获取最后10步移动
      const last10Moves = this.moveHistory.slice(-10);
      
      // 检查是否同一个棋子在追逐同一个目标
      const lastMove = last10Moves[last10Moves.length - 1];
      let chaseCount = 0;
      
      for (let i = last10Moves.length - 2; i >= 0; i--) {
        const move = last10Moves[i];
        if (move.from.piece === lastMove.from.piece &&
            move.to.piece === lastMove.to.piece) {
          chaseCount++;
        }
      }
      
      return chaseCount >= 8; // 如果10步中有8步都是追逐，则认为是在追逐
    },
    
    checkGameOver() {
      const redPieces = this.countPieces('red');
      const blackPieces = this.countPieces('black');
      console.log('redPieces', redPieces);
      console.log('blackPieces', blackPieces);
    //   if (redPieces === 0 || blackPieces === 0) {
    //     this.gameStarted = false;
    //     alert(redPieces === 0 ? '黑方胜利！' : '红方胜利！');
    //   }
    },
    
    countPieces(color) {
      let count = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
          if (this.board[i][j] && 
              this.board[i][j].revealed && 
              this.board[i][j].color === color) {
            count++;
          }
        }
      }
      return count;
    }
  }
}
</script>

<style lang="less" scoped>
.flipchess {
  background-color: #fff;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  // src\html\index\apps\flipchess\image.png
  background-image: url('/html/index/apps/flipchess/images/bg.png');
  background-repeat: repeat;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .game-menu {
    margin-bottom: 20px;
    padding: 10px;
    display: flex;
    justify-content: center;
    gap: 15px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
  }

  .game-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .left-eaten {
    @media screen and (max-width: 768px) {
      display: none !important;
    }
  }
  .right-eaten {
    @media screen and (max-width: 768px) {
      display: none !important;
    }
  }
  .down-eaten {
    justify-content: space-between;
    gap: 10px;
    margin-top: 20px;
    
    .eaten-pieces {
      width: calc(50% - 5px);  // 各占50%宽度，减去gap的一半
      min-height: 100px;        // 移除最小高度限制
      padding: 5px;           // 减小内边距

      .piece {
        width: 25px;  // 原来是50px，减小50%
        height: 25px; // 原来是50px，减小50%
        font-size: 14px; // 原来是20px，相应减小字体
      }
    }

    @media screen and (max-width: 768px) {
      display: flex !important;
    }
    // 非移动设备时隐藏down-eaten
    @media screen and (min-width: 768.00001px) {
      display: none!important;
    }
  }

  .eaten-pieces {
    width: 10%;
    min-height: 500px;
    border: 0px solid #aaa;
    padding: 10px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    background-image: url('/html/index/apps/flipchess/images/bg2.png');
    background-repeat: repeat;
    background-size: cover;

    .piece {
      background-color: #eee;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;

      @media screen and (max-width: 768px) {
        width: 30px;
        height: 30px;
        font-size: 16px;
      }
    }

    .red {
        background: #ff4d4f;
      }
      
      .black {
        background: #000;
      }
  }

  .center-area {
    border:0px solid red;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .game-info {
    width: 100%;
    margin-bottom: 20px;
    
    .player-info {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 10px;

      .start-button {
        flex: 1;
        text-align: center;
        margin: 0 20px;
      }
      
      .player {
        padding: 10px;
        border-radius: 4px;
        min-width: 80px;
        text-align: center;
        transition: all 0.3s ease;
        
        &.active {
          color: white;
      
          &:first-child {  // 红方
            background: #ff4d4f;
          }
          
          &:last-child {   // 黑方
            background: #000;
          }
        }
      }
    }
  }
  
  .board {
    display: block;
    border: 2px solid #333;
    width: calc(100% - 4px);
    margin:0 auto;
    
    .row {
      display: flex;
    }
    
    .cell {
      width: calc(100% / 8); // 8列等分
      aspect-ratio: 1; // 保持正方形
      border: 1px solid #999;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      // &:hover {
      //   background: #000;
      //   opacity: 0.2;
      // }
    }
    
    .piece {
      width: 80%;
      height: 80%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      
      /* 小屏幕 */
      @media (max-width: 600px) {
          font-size: 25px;
      }

      /* 中等屏幕 */
      @media (min-width: 601px) and (max-width: 1200px) {
          font-size: 36px;
      }

      /* 大屏幕 */
      @media (min-width: 1201px) {
          font-size: 48px;
      }
      
      &.red {
        background: #ff4d4f;
        color: white;
      }
      
      &.black {
        background: #000;
        color: white;
      }
      
      &.covered {
        background-image: url('/html/index/apps/flipchess/images/image.png');
        background-repeat: repeat;
        background-size: cover;
        border: 2px solid #666;
        color: #333;
        font-weight: bold;
        text-shadow: 1px 1px 1px rgba(255,255,255,0.5);
      }
      
      &.selected {
        box-shadow: 0 0 0 4px #fff; // 改为白色且加大宽度
        border: 2px solid rgba(255, 255, 255, 0.8); // 添加实线边框
      }
    }
  }
}
</style>