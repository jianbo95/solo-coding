import BasicStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/basic-strategy.js';
import RegionStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/region-strategy.js';
import TankChainStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/tank-chain-strategy.js';
import ProbabilityStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/probability-strategy.js';
import Utils from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/utils.js';
import GridPatternStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/grid-pattern-strategy.js';
import ConstraintStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/constraint-strategy.js';
import DFSStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/dfs-strategy.js';
import ConnectedBlockStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/connected-block-strategy.js';
// import PatternStrategy from '@/html/index/apps/mine/mine-ai/mine-game-ai-v2/pattern-strategy.js';

export default class MineGameAiV2 {
    constructor() {
        this.guessCount = 0;
        this.debug = true;
        
        // 初始化各个策略
        this.basicStrategy = new BasicStrategy();
        this.regionStrategy = new RegionStrategy();
        this.tankChainStrategy = new TankChainStrategy();
        this.probabilityStrategy = new ProbabilityStrategy();
        this.utils = new Utils();
        this.gridPatternStrategy = new GridPatternStrategy();
        // this.constraintStrategy = new ConstraintStrategy(); // 添加约束策略
        this.connectedBlockStrategy = new ConnectedBlockStrategy();
        // this.patternStrategy = new PatternStrategy();
    }

    getGuessCount() {
        return this.guessCount;
    }

    /**
     * 获取下一步操作
     * @param {Array} grid 游戏网格
     * @param {Number} rows 行数
     * @param {Number} cols 列数
     * @param {Boolean} isGuessing 是否正在猜测
     * @param {Number} mineCount 总地雷数
     * @returns {Object} 下一步操作
     */
    getNextMove(grid, rows, cols, isGuessing = false, mineCount) {
        var data = {grid,rows,cols,mineCount};
        console.log('data', data);
        // 重置猜测计数
        if (!isGuessing) {
            this.guessCount = 0;
        }

        // 收集格子信息
        const { unrevealedCells, revealedCells, flaggedCount } = this.utils.collectCellInfo(grid, rows, cols);
        const remainingMines = mineCount - flaggedCount;

        this.log(`剩余雷数: ${remainingMines}, 未揭开格子: ${unrevealedCells.length}`);

        // 1. 基础逻辑推理 - 单格分析
        const basicMove = this.basicStrategy.analyze(grid, rows, cols, revealedCells);
        if (basicMove) {
            this.log(`基础逻辑找到移动: ${basicMove.action} at (${basicMove.row}, ${basicMove.col})`);
            return basicMove;
        }

        // 1.5 网格模式分析
        const gridPatternMove = this.gridPatternStrategy.analyze(grid, rows, cols, revealedCells);
        if (gridPatternMove) {
            this.log(`网格模式分析找到移动: ${gridPatternMove.action} at (${gridPatternMove.row}, ${gridPatternMove.col})`);
            return gridPatternMove;
        }

        // 2. 约束推理分析
        // if(this.constraintStrategy != null) {
        //     const constraintMove = this.constraintStrategy.analyze(grid, rows, cols, revealedCells);
        //     if (constraintMove) {
        //         this.log(`约束推理找到移动: ${constraintMove.action} at (${constraintMove.row}, ${constraintMove.col})`);
        //         return constraintMove;
        //     }
        // }

        // 1.5 定式分析（在基础逻辑之后）
        // const patternMove = this.patternStrategy.analyze(grid, rows, cols, revealedCells);
        // if (patternMove) {
        //     this.log(`定式分析找到移动: ${patternMove.action} at (${patternMove.row}, ${patternMove.col})`);
        //     return patternMove;
        // }

        // 3. 剩余雷数和区域分析
        const regionMove = this.regionStrategy.analyze(
            grid, rows, cols, mineCount, unrevealedCells, flaggedCount
        );
        if (regionMove) {
            this.log(`区域分析找到移动: ${regionMove.action} at (${regionMove.row}, ${regionMove.col})`);
            return regionMove;
        }

        // 3. 坦克链分析 (Tank Chains) - 分析相邻数字之间的关系
        const tankChainMove = this.tankChainStrategy.analyze(grid, rows, cols, revealedCells);
        if (tankChainMove) {
            this.log(`坦克链分析找到移动: ${tankChainMove.action} at (${tankChainMove.row}, ${tankChainMove.col})`);
            return tankChainMove;
        } else {
            // 添加调试信息
            this.log('坦克链分析未找到移动');
            // console.log('当前已知数字:', revealedCells);
        }

        // 3.5 联通块分析（在坦克链分析之后，概率分析之前）
        const blockMove = this.connectedBlockStrategy.analyze(grid, rows, cols, revealedCells, remainingMines);
        if (blockMove) {
            this.log(`联通块分析找到移动: ${blockMove.action} at (${blockMove.row}, ${blockMove.col})`);
            return blockMove;
        }

        // 4. 概率分析
        const probMove = this.probabilityStrategy.analyze(grid, rows, cols, unrevealedCells, remainingMines);
        if (probMove) {
            if (probMove.isGuess) {
                this.guessCount++;
                this.log(`概率分析猜测: ${probMove.action} at (${probMove.row}, ${probMove.col}), 风险: ${probMove.risk.toFixed(4)}`);
            } else {
                this.log(`概率分析确定: ${probMove.action} at (${probMove.row}, ${probMove.col})`);
            }
            return probMove;
        }

        // 5. 随机选择
        if (unrevealedCells.length > 0) {
            this.guessCount++;
            const randomIndex = Math.floor(Math.random() * unrevealedCells.length);
            const randomMove = {
                row: unrevealedCells[randomIndex].row,
                col: unrevealedCells[randomIndex].col,
                action: 'reveal',
                isGuess: true
            };
            this.log(`随机选择: ${randomMove.action} at (${randomMove.row}, ${randomMove.col})`);
            return randomMove;
        }

        return null;
    }

    log(message) {
        if (this.debug) {
            console.log(`[MineAI] ${message}`);
        }
    }
}