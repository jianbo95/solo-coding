function AIGame(controller) {
    // 记录蛇当前的移动方向
    let currentDirection = 'right';
    let futureStepSize = 30;
  
    function startAI(snake, food, boardSize) {
        // 验证游戏板尺寸参数是否有效
        if (!boardSize || !boardSize.width || !boardSize.height) {
            throw new Error('Invalid boardSize');
        }
  
        // 获取蛇头位置
        const head = snake[0];
        // 可选的移动方向
        const directions = ['up', 'down', 'left', 'right'];
        // 初始化最佳移动方向为当前方向
        let bestDirection = currentDirection;
        // 初始化最小距离为无穷大
        let minDistance = Infinity;
  
        // 遍历所有可能的移动方向
        directions.forEach(direction => {
            // 创建新的蛇头位置对象
            const newHead = { ...head };
  
            // 根据方向计算新的蛇头位置
            switch (direction) {
                case 'up':
                    newHead.y -= 1;
                    break;
                case 'down':
                    newHead.y += 1;
                    break;
                case 'left':
                    newHead.x -= 1;
                    break;
                case 'right':
                    newHead.x += 1;
                    break;
            }
  
            // 检查新位置是否会发生碰撞
            if (!isCollision(newHead, snake, boardSize)) {
                const distance = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
                // 新增安全评估（预测未来3步）
                const isSafe = checkFutureSafety(newHead, [...snake], boardSize, futureStepSize);
                
                // 优先选择安全路径
                if (isSafe && distance < minDistance) {
                    minDistance = distance;
                    bestDirection = direction;
                }
            }
        });
  
        // 更新并返回最佳移动方向
        currentDirection = bestDirection;
        return currentDirection;
    }
  
    // 新增安全预测方法
    // 添加递归计数器
    let recursionCount = 0;
    const MAX_RECURSION = 100;
    function checkFutureSafety(head, snake, boardSize, steps) {
        // 检查递归次数
        if (recursionCount >= MAX_RECURSION) {
            return true;
        }
        recursionCount++;
    
        if (steps <= 0) {
            recursionCount = 0; // 重置计数器
            return true;
        }
        
        // 模拟蛇身移动
        const newSnake = [head, ...snake.slice(0, -1)];
        
        // 获取可能移动方向
        const directions = ['up', 'down', 'left', 'right'];
        for (const dir of directions) {
            const nextHead = {...head};
            // 计算下一步位置
            switch(dir) {
                case 'up': nextHead.y -= 1; break;
                case 'down': nextHead.y += 1; break;
                case 'left': nextHead.x -= 1; break;
                case 'right': nextHead.x += 1; break;
            }
            
            // 递归检查后续路径
            if (!isCollision(nextHead, newSnake, boardSize) && 
                checkFutureSafety(nextHead, newSnake, boardSize, steps - 1)) {
                recursionCount = 0; // 重置计数器
                return true;
            }
        }
        recursionCount = 0; // 重置计数器
        return false;
    }
  
    function isCollision(head, snake, boardSize) {
        // 检查是否撞墙
        if (head.x < 0 || head.x >= boardSize.width || head.y < 0 || head.y >= boardSize.height) {
            return true;
        }
  
        // 检查是否撞到蛇身
        return snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
  
    // 返回AI控制器接口
    return {
        startAI
    };
}
  
export default AIGame;