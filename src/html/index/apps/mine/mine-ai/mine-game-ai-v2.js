import BasicStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/basic-strategy.js';
import RegionStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/region-strategy.js';
import TankChainStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/tank-chain-strategy.js';
import ProbabilityStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/probability-strategy.js';
import Utils from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/utils.js';
import GridPatternStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/grid-pattern-strategy.js';
import ConstraintStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/constraint-strategy.js';
import DFSStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/dfs-strategy.js';
import ConnectedBlockStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/connected-block-strategy.js';
import OverlapRegionStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/overlap-region-strategy.js';
// import PatternStrategy from '/html/index/apps/mine/mine-ai/mine-game-ai-v2/pattern-strategy.js';

export default class MineGameAiV2 {
    constructor() {
        this.guessCount = 0;
        this.debug = false;
        
        // 策略开关配置
        this.strategyConfig = {
            basic: true,            // 基础策略
            overlap: true,          // 重叠区域策略
            // gridPattern: true,      // 网格模式策略
            // region: true,           // 区域策略
            // tankChain: true,        // 坦克链策略
            connectedBlock: true,   // 连通块策略
            probability: true       // 概率策略
        };

        // 工具类，提供通用的辅助函数
        this.utils = new Utils();
        // 基础策略：处理单个数字周围的明显地雷和安全格
        this.basicStrategy = new BasicStrategy(this.debug);
        // 重叠区域策略：分析数字格子周围重叠区域的雷分布
        this.overlapRegionStrategy = new OverlapRegionStrategy(this.debug);
        // 区域策略：分析不同区域的地雷分布
        this.regionStrategy = new RegionStrategy(this.debug);
        // 坦克链策略：分析相邻数字间的复杂关系
        this.tankChainStrategy = new TankChainStrategy(this.debug);
        // 概率策略：计算每个未知格子是地雷的概率
        this.probabilityStrategy = new ProbabilityStrategy(this.debug);
        // 网格模式策略：识别和处理特定的网格模式
        this.gridPatternStrategy = new GridPatternStrategy(this.debug);
        // 连通块策略：分析相互连接的数字块
        this.connectedBlockStrategy = new ConnectedBlockStrategy(this.debug);
        // this.constraintStrategy = new ConstraintStrategy(); // 约束策略：使用约束满足问题求解
        // this.patternStrategy = new PatternStrategy(); // 模式策略：识别常见的地雷分布模式
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
    getNextMove(grid, rows, cols, isGuessing = false, mineCount, debug = false) {
        // 判断安全位置是否已经揭开
        // 判断安全位置是否已经揭开
        const safeMove = this.utils.findUnrevealedSafeCell(grid, rows, cols);
        if (safeMove) {
            this.log(`找到未揭开的安全位置: (${safeMove.row}, ${safeMove.col})`);
            return this.utils.verifyResult({
                row: safeMove.row,
                col: safeMove.col,
                action: 'reveal',
                isGuess: false,
                strategy: 'safe'
            }, grid, '安全位置');
        }

        var data = {grid,rows,cols,mineCount};
        // console.log('data', data);
        // 重置猜测计数
        if (!isGuessing) {
            this.guessCount = 0;
        }

        // 增加一个对象用来指定策略是否打开

        // 收集格子信息
        const { unrevealedCells, revealedCells, flaggedCount } = this.utils.collectCellInfo(grid, rows, cols);
        const remainingMines = mineCount - flaggedCount;

        this.log(`剩余雷数: ${remainingMines}, 未揭开格子: ${unrevealedCells.length}, 揭开格子: ${revealedCells.length}`);

        // 1. 基础逻辑推理
        if (this.strategyConfig.basic) {
            const basicMove = this.basicStrategy.analyze(grid, rows, cols, revealedCells);
            if (basicMove) {
                this.log(`基础逻辑找到移动: ${basicMove.action} at (${basicMove.row}, ${basicMove.col})`);
                return this.utils.verifyResult(Object.assign({}, basicMove, { strategy: 'basic' }), grid, '基础逻辑');
            }
        }

        // 1.2 重叠区域分析
        if (this.strategyConfig.overlap) {
            const overlapMove = this.overlapRegionStrategy.analyze(grid, rows, cols, revealedCells, debug);
            if (overlapMove) {
                this.log(`重叠区域分析找到移动: ${overlapMove.action} at (${overlapMove.row}, ${overlapMove.col})`);
                return this.utils.verifyResult(Object.assign({}, overlapMove, { strategy: 'overlap' }), grid, '重叠区域');
            }
        }

        // 1.5 网格模式分析
        if (this.strategyConfig.gridPattern) {
            const gridPatternMove = this.gridPatternStrategy.analyze(grid, rows, cols, revealedCells);
            if (gridPatternMove) {
                this.log(`网格模式分析找到移动: ${gridPatternMove.action} at (${gridPatternMove.row}, ${gridPatternMove.col})`);
                return this.utils.verifyResult(Object.assign({}, gridPatternMove, { strategy: 'gridPattern' }), grid, '网格模式');
            }
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
        if (this.strategyConfig.region) {
            const regionMove = this.regionStrategy.analyze(grid, rows, cols, mineCount, unrevealedCells, flaggedCount);
            if (regionMove) {
                this.log(`区域分析找到移动: ${regionMove.action} at (${regionMove.row}, ${regionMove.col})`);
                return this.utils.verifyResult(Object.assign({}, regionMove, { strategy: 'region' }), grid, '区域分析');
            }
        }

        // 3. 坦克链分析
        if (this.strategyConfig.tankChain) {
            const tankChainMove = this.tankChainStrategy.analyze(grid, rows, cols, revealedCells);
            if (tankChainMove) {
                this.log(`坦克链分析找到移动: ${tankChainMove.action} at (${tankChainMove.row}, ${tankChainMove.col})`);
                return this.utils.verifyResult(Object.assign({}, tankChainMove, { strategy: 'tankChain' }), grid, '坦克链');
            }
        }

        // 3.5 联通块分析
        if (this.strategyConfig.connectedBlock) {
            const blockMove = this.connectedBlockStrategy.analyze(grid, rows, cols, revealedCells, remainingMines);
            if (blockMove) {
                this.log(`联通块分析找到移动: ${blockMove.action} at (${blockMove.row}, ${blockMove.col})`);
                return this.utils.verifyResult(Object.assign({}, blockMove, { strategy: 'connectedBlock' }), grid, '联通块');
            }
        }

        // 4. 概率分析
        if (this.strategyConfig.probability) {
            const probMove = this.probabilityStrategy.analyze(grid, rows, cols, unrevealedCells, remainingMines);
            if (probMove) {
                if (probMove.isGuess) {
                    this.guessCount++;
                    this.log(`概率分析猜测: ${probMove.action} at (${probMove.row}, ${probMove.col}), 风险: ${probMove.risk.toFixed(4)}`);
                } else {
                    this.log(`概率分析确定: ${probMove.action} at (${probMove.row}, ${probMove.col})`);
                }
                return this.utils.verifyResult(Object.assign({}, probMove, { strategy: 'probability' }), grid, '概率分析');
            }
        }

        return null;
    }

    log(message) {
        if (this.debug) {
            console.log(`[MineAI] ${message}`);
        }
    }
}