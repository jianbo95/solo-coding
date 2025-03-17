export default class AIWuziqi {
    constructor(boardSize = 15) {
        this.boardSize = boardSize;
    }

    // 评估每个位置的分数
    evaluatePosition(board, row, col, player) {
        const directions = [
            [[0, 1], [0, -1]],   // 水平
            [[1, 0], [-1, 0]],   // 垂直
            [[1, 1], [-1, -1]],  // 对角线
            [[1, -1], [-1, 1]]   // 反对角线
        ];

        let score = 0;
        directions.forEach(direction => {
            score += this.evaluateDirection(board, row, col, direction[0], direction[1], player);
        });

        return score;
    }

    // 评估某个方向的分数
    evaluateDirection(board, row, col, dir1, dir2, player) {
        let count = 1;
        let empty = 0;
        let blocked = 0;

        // 检查第一个方向
        let r = row + dir1[0];
        let c = col + dir1[1];
        let firstDirEmpty = 0;

        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
            if (board[r][c] === 0) {
                firstDirEmpty++;
                if (firstDirEmpty > 1) break;
                empty++;
            } else if (board[r][c] === player) {
                if (firstDirEmpty > 0) break;
                count++;
            } else {
                blocked++;
                break;
            }
            r += dir1[0];
            c += dir1[1];
        }

        // 检查第二个方向
        r = row + dir2[0];
        c = col + dir2[1];
        let secondDirEmpty = 0;

        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
            if (board[r][c] === 0) {
                secondDirEmpty++;
                if (secondDirEmpty > 1) break;
                empty++;
            } else if (board[r][c] === player) {
                if (secondDirEmpty > 0) break;
                count++;
            } else {
                blocked++;
                break;
            }
            r += dir2[0];
            c += dir2[1];
        }

        // 根据不同情况返回分数
        if (count >= 5) return 100000;
        if (count === 4) {
            if (blocked === 0) return 10000;
            if (blocked === 1) return 1000;
        }
        if (count === 3) {
            if (blocked === 0) return 1000;
            if (blocked === 1) return 100;
        }
        if (count === 2) {
            if (blocked === 0) return 100;
            if (blocked === 1) return 10;
        }
        return count;
    }

    // 获取AI的最佳落子位置
    getBestMove(board, player) {
        let bestScore = -1;
        let bestMove = null;

        // 遍历所有空位置
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (board[i][j] === 0) {
                    // 评估当前位置对AI的分数
                    let aiScore = this.evaluatePosition(board, i, j, player);
                    // 评估当前位置对玩家的分数
                    let playerScore = this.evaluatePosition(board, i, j, player === 1 ? 2 : 1);
                    
                    // 取较大的分数作为该位置的最终分数
                    let score = Math.max(aiScore, playerScore);

                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = [i, j];
                    }
                }
            }
        }

        return bestMove;
    }
}