export default {
  canEat(fromPiece, toPiece, board, fromI, fromJ, toI, toJ) {
    // 不能吃自己的棋子
    if (fromPiece.color === toPiece.color) {
      return false;
    }

    // 炮的特殊规则
    if (fromPiece.name === '炮') {
      return this.canPaoEat(board, fromI, fromJ, toI, toJ);
    }

    // 帅不能吃兵
    if (fromPiece.name === '帅' && toPiece.name === '兵') {
      return false;
    }

    // 兵可以吃帅
    if (fromPiece.name === '兵' && toPiece.name === '帅') {
      return true;
    }

    // 其他情况按照等级判断
    return fromPiece.rank >= toPiece.rank;
  },

  canPaoEat(board, fromI, fromJ, toI, toJ) {
    console.log('canPaoEat');
    // 炮必须直线移动
    if (fromI !== toI && fromJ !== toJ) {
      return false;
    }

    // 目标位置必须存在棋子
    if (!board[toI][toJ]) {
      return false;
    }

    let count = 0; // 计算中间的棋子数
    
    // 横向移动
    if (fromI === toI) {
      const start = Math.min(fromJ, toJ);
      const end = Math.max(fromJ, toJ);
      for (let j = start + 1; j < end; j++) {
        if (board[fromI][j]) { 
          count++;
        }
      }
    }
    // 纵向移动
    else {
      const start = Math.min(fromI, toI);
      const end = Math.max(fromI, toI);
      for (let i = start + 1; i < end; i++) {
        if (board[i][fromJ]) { 
          count++;
        }
      }
    }

    // 必须正好隔一个棋子（无论是否翻开）
    return count === 1;
  },

  isSamePiece(piece1, piece2) {
    return piece1.name === piece2.name && piece1.rank === piece2.rank;
  }
};