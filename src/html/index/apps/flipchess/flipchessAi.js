import EatRule from "@/html/index/apps/flipchess/EatRule.js";

// 新增位置权重表（棋盘位置价值映射）
const POSITION_WEIGHTS = [
    [1, 2, 3, 4, 4, 3, 2, 1],
    [2, 3, 4, 5, 5, 4, 3, 2],
    [3, 4, 5, 6, 6, 5, 4, 3],
    [2, 3, 4, 5, 5, 4, 3, 2]
  ];

  
class FlipchessAI {
  constructor() {
    this.color = 'black'; // AI 默认执黑
    // 新增棋子威胁值表
    this.THREAT_VALUES = {
        '帅': 100, '车': 50, '马': 30, '炮': 40, 
        '仕': 20, '相': 15, '兵': 10
      };
  }

  // 评估当前局面分数
  evaluateBoard(board) {
    let score = 0;
    
    // 遍历所有棋子
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (!piece || !piece.revealed) continue;

        const value = this.THREAT_VALUES[piece.name] || 0;
        const weight = POSITION_WEIGHTS[i][j];
        
        // 根据棋子颜色调整分数
        if (piece.color === this.color) {
          score += value * weight;
          // 靠近对方底线加分
          score += (3 - i) * 2; 
        } else {
          score -= value * weight;
          // 威胁我方棋子扣分
          score += this.checkThreats(board, i, j);
        }
      }
    }
    return score;
  }

  // 新增威胁检测
  checkThreats(board, x, y) {
    let threatScore = 0;
    const piece = board[x][y];
    
    // 检查周围是否有更高价值的敌方棋子
    const directions = [[-1,0], [1,0], [0,-1], [0,1]];
    directions.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >=0 && nx <4 && ny >=0 && ny <8) {
        const neighbor = board[nx][ny];
        if (neighbor && neighbor.revealed && neighbor.color !== piece.color) {
          if (this.THREAT_VALUES[neighbor.name] > this.THREAT_VALUES[piece.name]) {
            threatScore -= 15; // 被高价值棋子威胁扣分
          }
        }
      }
    });
    
    return threatScore;
  }

  // 优化后的移动选择（使用minimax算法）
  getBestMove(board) {
    const moves = this.getPossibleMoves(board, this.color);
    let bestScore = -Infinity;
    let bestMoves = [];
    
    // 评估所有可能的移动
    moves.forEach(move => {
      const tempBoard = JSON.parse(JSON.stringify(board));
      const fromPiece = tempBoard[move.from.i][move.from.j];
      const toPiece = tempBoard[move.to.i][move.to.j];
      
      // 执行模拟移动
      tempBoard[move.to.i][move.to.j] = fromPiece;
      tempBoard[move.from.i][move.from.j] = null;
      
      // 考虑两步棋（当前步和对手可能的回应）
      const currentScore = this.evaluateBoard(tempBoard);
      const opponentScore = this.evaluateOpponentBestResponse(tempBoard);
      const finalScore = currentScore - opponentScore * 0.5;
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMoves = [move];
      } else if (finalScore === bestScore) {
        bestMoves.push(move);
      }
    });
    
    // 从最佳候选步中随机选择
    return bestMoves.length > 0 
      ? bestMoves[Math.floor(Math.random() * bestMoves.length)]
      : null;
  }

  // 新增对手最佳回应评估
  evaluateOpponentBestResponse(board) {
    let maxScore = -Infinity;
    const opponentColor = this.color === 'red' ? 'black' : 'red';
    
    this.getPossibleMoves(board, opponentColor).forEach(move => {
      const tempBoard = JSON.parse(JSON.stringify(board));
      const fromPiece = tempBoard[move.from.i][move.from.j];
      tempBoard[move.to.i][move.to.j] = fromPiece;
      tempBoard[move.from.i][move.from.j] = null;
      
      const score = this.evaluateBoard(tempBoard);
      if (score > maxScore) maxScore = score;
    });
    
    return maxScore;
  }

  // 获取所有可能的移动
  // 优化后的移动生成（优先吃子/翻开棋子）
  // 优化后的移动生成（优先吃子/翻开棋子）
  getPossibleMoves(board, color) {
    const moves = [];
    const revealMoves = [];
    const attackMoves = [];
    
    // 先收集所有可能的吃子移动
    for (let fromI = 0; fromI < 4; fromI++) {
      for (let fromJ = 0; fromJ < 8; fromJ++) {
        const piece = board[fromI][fromJ];
        if (!piece || !piece.revealed || piece.color !== color) continue;

        // 检查四个方向的吃子可能
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        directions.forEach(([dx, dy]) => {
          const toI = fromI + dx;
          const toJ = fromJ + dy;
          if (toI >= 0 && toI < 4 && toJ >= 0 && toJ < 8) {
            const target = board[toI][toJ];
            if (target) {
              // 使用 EatRule 判断是否可以吃子
              if (EatRule.canEat(piece, target, board, fromI, fromJ, toI, toJ)) {
                attackMoves.push({
                  from: {i: fromI, j: fromJ, piece: piece},
                  to: {i: toI, j: toJ, piece: target}
                });
              }
            }
          }
        });
      }
    }

    // 如果有吃子机会，打印所有可能的吃子
    if (attackMoves.length > 0) {
      console.log('发现以下吃子机会：');
      attackMoves.forEach(move => {
        console.log(`${move.from.piece.name}(${move.from.i},${move.from.j}) 可以吃 ${move.to.piece.name}(${move.to.i},${move.to.j})`);
      });
      return attackMoves;
    }
    
    // 如果没有吃子机会，再考虑翻棋
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] && !board[i][j].revealed) {
          revealMoves.push({
            type: 'reveal',
            position: {i, j}
          });
        }
      }
    }
    
    if (revealMoves.length > 0) {
      return revealMoves;
    }

    // 最后才考虑普通移动
    for (let fromI = 0; fromI < 4; fromI++) {
      for (let fromJ = 0; fromJ < 8; fromJ++) {
        const piece = board[fromI][fromJ];
        if (!piece || !piece.revealed || piece.color !== color) continue;

        directions.forEach(([dx, dy]) => {
          const toI = fromI + dx;
          const toJ = fromJ + dy;
          if (toI >= 0 && toI < 4 && toJ >= 0 && toJ < 8 && !board[toI][toJ]) {
            moves.push({
              from: {i: fromI, j: fromJ},
              to: {i: toI, j: toJ}
            });
          }
        });
      }
    }
    
    return moves;
  }

  // 新增攻击性移动（优先吃子）
  getAttackMoves(board, fromI, fromJ) {
    const moves = [];
    const piece = board[fromI][fromJ];
    
    // 检查可攻击目标
    const directions = [[-1,0], [1,0], [0,-1], [0,1]];
    directions.forEach(([dx, dy]) => {
      const toI = fromI + dx;
      const toJ = fromJ + dy;
      if (toI >=0 && toI <4 && toJ >=0 && toJ <8) {
        const target = board[toI][toJ];
        if (target && target.revealed && target.color !== piece.color) {
          if (EatRule.canEat(piece, target)) {
            moves.push({
              from: {i: fromI, j: fromJ},
              to: {i: toI, j: toJ},
              score: this.THREAT_VALUES[target.name] // 根据目标价值评分
            });
          }
        }
      }
    });
    
    return moves.sort((a, b) => b.score - a.score); // 按目标价值排序
  }

  // 新增防御性移动（保护重要棋子）
  getDefensiveMoves(board, fromI, fromJ) {
    // ...（实现保护逻辑）
  }

  // 检查移动是否有效
  isValidMove(board, fromI, fromJ, toI, toJ) {
    const fromPiece = board[fromI][fromJ];
    const toPiece = board[toI][toJ];

    // 基本移动规则检查
    if (fromI === toI && fromJ === toJ) return false;
    if (Math.abs(fromI - toI) + Math.abs(fromJ - toJ) !== 1) return false;

    // 如果目标位置有己方棋子，不能移动
    if (toPiece && toPiece.revealed && toPiece.color === fromPiece.color) {
      return false;
    }

    return true;
  }

  // 选择最佳移动
  getBestMove(board) {
    const moves = this.getPossibleMoves(board, this.color);
    if (moves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove = null;

    for (const move of moves) {
      // 模拟移动
      const tempBoard = JSON.parse(JSON.stringify(board));
      const fromPiece = tempBoard[move.from.i][move.from.j];
      tempBoard[move.to.i][move.to.j] = fromPiece;
      tempBoard[move.from.i][move.from.j] = null;

      const score = this.evaluateBoard(tempBoard);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // 获取一个随机的未翻开棋子
  getRandomUnrevealedPiece(board) {
    const unrevealedPieces = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] && !board[i][j].revealed) {
          unrevealedPieces.push({ i, j });
        }
      }
    }
    if (unrevealedPieces.length === 0) return null;
    return unrevealedPieces[Math.floor(Math.random() * unrevealedPieces.length)];
  }

  // AI 主要决策逻辑
  makeMove(board) {
    // 如果有未翻开的棋子，随机翻开一个
    const unrevealedPiece = this.getRandomUnrevealedPiece(board);
    if (unrevealedPiece) {
      return {
        type: 'reveal',
        position: unrevealedPiece
      };
    }

    // 否则进行最佳移动
    const bestMove = this.getBestMove(board);
    if (bestMove) {
      return {
        type: 'move',
        move: bestMove
      };
    }

    return null;
  }
}

export default FlipchessAI;