/**
 * 自动完成汉诺塔游戏的函数
 * @param {Object} vm - Vue 实例，包含游戏状态和方法
 */
export default function autoGame(vm) {
    // 从Vue实例中解构出需要的属性
    const { discCount, towers, gameFast } = vm;
    // 用于存储所有移动步骤的数组
    const moves = [];

    /**
     * 递归函数，用于生成汉诺塔移动步骤
     * @param {number} n - 当前要移动的圆盘数量
     * @param {number} source - 源塔的索引
     * @param {number} auxiliary - 辅助塔的索引
     * @param {number} target - 目标塔的索引
     */
    function hanoi(n, source, auxiliary, target) {
        // 如果只有一个圆盘，直接移动到目标塔
        if (n === 1) {
            moves.push([source, target]);
            return;
        }
        // 将n-1个圆盘从源塔移动到辅助塔
        hanoi(n - 1, source, target, auxiliary);
        // 将第n个圆盘从源塔移动到目标塔
        moves.push([source, target]);
        // 将n-1个圆盘从辅助塔移动到目标塔
        hanoi(n - 1, auxiliary, source, target);
    }

    // 生成所有移动步骤，从第一个塔（索引0）通过辅助塔（索引1）移动到目标塔（索引2）
    hanoi(discCount, 0, 1, 2);

    /**
     * 按顺序执行移动步骤
     * @param {number} index - 当前要执行的移动步骤的索引
     */
    function executeMoves(index) {
        // 如果所有步骤都执行完毕，结束游戏
        if (index >= moves.length) {
            vm.endGame();
            return;
        }
        // 获取当前步骤的源塔和目标塔
        const [from, to] = moves[index];
        // 执行移动
        vm.moveDisc(from, to);
        // 更新游戏提示信息
        vm.message = `自动将圆盘从第 ${from + 1} 个塔移动到第 ${to + 1} 个塔。`;
        // 设置定时器，按照游戏速度执行下一步
        setTimeout(() => {
            executeMoves(index + 1);
        }, gameFast * 1000);
    }

    // 开始执行移动步骤，从第一个步骤开始
    executeMoves(0);
}