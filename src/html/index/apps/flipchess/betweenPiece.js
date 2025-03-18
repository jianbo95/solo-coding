export default {
  // 检查两点之间是否只有一个棋子
  hasOnePieceBetween(board, fromI, fromJ, toI, toJ) {
    let count = 0;
    
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
    else if (fromJ === toJ) {
      const start = Math.min(fromI, toI);
      const end = Math.max(fromI, toI);
      for (let i = start + 1; i < end; i++) {
        if (board[i][fromJ]) {
          count++;
        }
      }
    }
    
    return count === 1;
  }
};