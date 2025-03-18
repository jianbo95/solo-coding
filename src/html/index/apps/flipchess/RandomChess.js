export default {
  initBoard() {
    // 初始化棋子
    const pieces = [
      { name: '帅', count: 1, rank: 7 },
      { name: '士', count: 2, rank: 6 },
      { name: '相', count: 2, rank: 5 },
      { name: '车', count: 2, rank: 4 },
      { name: '马', count: 2, rank: 3 },
      { name: '炮', count: 2, rank: 2 },
      { name: '兵', count: 5, rank: 1 }
    ];

    // 生成所有棋子
    let allPieces = [];
    pieces.forEach(piece => {
      for (let i = 0; i < piece.count; i++) {
        // 红方棋子
        allPieces.push({
          name: piece.name,
          color: 'red',
          rank: piece.rank,
          revealed: false
        });
        // 黑方棋子
        allPieces.push({
          name: piece.name,
          color: 'black',
          rank: piece.rank,
          revealed: false
        });
      }
    });

    // 随机打乱棋子
    for (let i = allPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
    }

    // 创建棋盘并放置棋子
    const board = Array(4).fill().map(() => Array(8).fill(null));
    let pieceIndex = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        board[i][j] = allPieces[pieceIndex++];
      }
    }

    return board;
  }
};