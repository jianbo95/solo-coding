<template>
  <div class="flipchess">
    <div class="game-info">
      <div class="player-info">
        <div :class="['player', { active: currentPlayer === 'red' }]">
          红方
        </div>
        <div :class="['player', { active: currentPlayer === 'black' }]">
          黑方
        </div>
      </div>
      <el-button @click="startGame" v-if="!gameStarted">开始游戏</el-button>
    </div>

    <div class="board">
      <div v-for="(row, i) in board" :key="i" class="row">
        <div v-for="(cell, j) in row" 
             :key="j" 
             class="cell"
             @click="handleCellClick(i, j)">
          <div v-if="cell" 
               :class="['piece', cell.color, { 'covered': !cell.revealed, 'selected': isSelected(i, j) }]">
            {{ cell.revealed ? cell.name : '?' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RandomChess from './RandomChess.js';
import EatRule from './EatRule.js';
import BetweenPiece from './betweenPiece.js';

export default {
  data() {
    return {
      board: [], // 8x4 的棋盘
      gameStarted: false,
      currentPlayer: null,
      selectedPiece: null,
      moveHistory: [], // 记录移动历史，用于检测追逐
    }
  },
  methods: {
    startGame() {
      this.board = RandomChess.initBoard();
      this.gameStarted = true;
      this.currentPlayer = null;
      this.selectedPiece = null;
      this.moveHistory = [];
    },
    
    isSelected(i, j) {
      return this.selectedPiece && 
             this.selectedPiece.i === i && 
             this.selectedPiece.j === j;
    },
    
    handleCellClick(i, j) {
      if (!this.gameStarted) return;
      
      const piece = this.board[i][j];
      
      // 优先处理已选中棋子的移动/吃子
      if (this.selectedPiece) {
        // 如果点击的是当前已选中的棋子，取消选中
        if (this.isSelected(i, j)) {
          this.selectedPiece = null;
          return;
        }
        this.tryMove(i, j);
        return;
      }

      if (!piece) return;

      // 处理未翻开的棋子（仅在没有选中时）
      if (!piece.revealed) {
        piece.revealed = true;
        if (!this.currentPlayer) {
          this.currentPlayer = piece.color;
        }
        console.log('翻开棋子:', piece.name);
        this.switchPlayer();
      } else if (piece.color === this.currentPlayer) {
        this.selectedPiece = { i, j, piece };
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
        
        // 执行吃子
        if (EatRule.isSamePiece(fromPiece, toPiece)) {
          console.log('同归于尽:', fromPiece.name, '与', toPiece.name);
          this.board[fromI][fromJ] = null;
          this.board[toI][toJ] = null;
        } else {
          if (!toPiece.revealed) {
            // 炮吃未翻开的子时，翻开并显示信息
            toPiece.revealed = true;
            if (fromPiece.color === toPiece.color) {
              console.log('吃子:', fromPiece.name, '吃到了自己的', toPiece.name);
            } else {
              console.log('吃子:', fromPiece.name, '吃到了对方的', toPiece.name);
            }
          } else {
            console.log('吃子:', fromPiece.name, '吃', toPiece.name);
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
  padding: 20px;
  
  .game-info {
    margin-bottom: 20px;
    
    .player-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      .player {
        padding: 10px;
        border-radius: 4px;
        
        &.active {
          background: #e6f7ff;
        }
      }
    }
  }
  
  .board {
    display: inline-block;
    border: 2px solid #333;
    
    .row {
      display: flex;
    }
    
    .cell {
      width: 60px;
      height: 60px;
      border: 1px solid #999;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:hover {
        background: #f0f0f0;
      }
    }
    
    .piece {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      
      &.red {
        background: #ff4d4f;
        color: white;
      }
      
      &.black {
        background: #000;
        color: white;
      }
      
      &.covered {
        background: #8c8c8c;
        color: white;
      }
      
      &.selected {
        box-shadow: 0 0 0 2px #1890ff;
      }
    }
  }
}
</style>