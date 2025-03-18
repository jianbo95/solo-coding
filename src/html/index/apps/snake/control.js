/**
 * 贪吃蛇游戏控制器
 */
class SnakeController {
  constructor(boardSize) {
    this.boardSize = boardSize;
  }

  /**
   * 初始化游戏状态
   * @returns {Object} 包含蛇和食物位置的游戏状态
   */
  initializeGame() {
    // 初始化蛇的位置（从中间开始）
    const startX = Math.floor(this.boardSize.width / 4);
    const startY = Math.floor(this.boardSize.height / 2);
    
    const snake = [
      { x: startX + 2, y: startY },
      { x: startX + 1, y: startY },
      { x: startX, y: startY }
    ];
    
    // 生成第一个食物
    const food = this.generateFood(snake);
    
    return { snake, food };
  }

  /**
   * 生成食物（不与蛇身重叠）
   * @param {Array} snake 蛇身体位置数组
   * @returns {Object} 食物位置
   */
  generateFood(snake) {
    let food;
    let foodOnSnake;
    
    do {
      foodOnSnake = false;
      food = {
        x: Math.floor(Math.random() * this.boardSize.width),
        y: Math.floor(Math.random() * this.boardSize.height)
      };
      
      // 检查食物是否与蛇身重叠
      for (const segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
          foodOnSnake = true;
          break;
        }
      }
    } while (foodOnSnake);
    
    return food;
  }

  /**
   * 移动蛇
   * @param {Array} snake 当前蛇身体位置
   * @param {Object} food 食物位置
   * @param {String} direction 移动方向
   * @returns {Object} 移动后的游戏状态
   */
  moveSnake(snake, food, direction) {
    const newSnake = [...snake];
    const head = Util.cloneMap(newSnake[0] );
    
    // 根据方向移动蛇头
    switch (direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }
    
    // 检查是否游戏结束（撞墙或撞到自己）
    if (this.isCollision(head, newSnake)) {
      return { gameOver: true, snake: newSnake, foodEaten: false };
    }
    
    // 将新头部添加到蛇身
    newSnake.unshift(head);
    
    // 检查是否吃到食物
    let foodEaten = false;
    if (food && head.x === food.x && head.y === food.y) {
      foodEaten = true;
    } else {
      // 如果没吃到食物，移除尾部
      newSnake.pop();
    }
    
    return { gameOver: false, snake: newSnake, foodEaten };
  }

  /**
   * 检查是否发生碰撞
   * @param {Object} head 蛇头位置
   * @param {Array} snake 蛇身体位置
   * @returns {Boolean} 是否碰撞
   */
  isCollision(head, snake) {
    // 检查是否撞墙
    if (
      head.x < 0 || 
      head.x >= this.boardSize.width || 
      head.y < 0 || 
      head.y >= this.boardSize.height
    ) {
      return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查，因为头部刚移动时可能与第一个部分重叠）
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 处理键盘按键
   * @param {String} key 按键
   * @param {String} currentDirection 当前方向
   * @param {Function} callback 回调函数，用于更新方向
   */
  handleKeyPress(key, currentDirection, callback) {
    let newDirection = currentDirection;
    
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (currentDirection !== 'down') {
          newDirection = 'up';
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currentDirection !== 'up') {
          newDirection = 'down';
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currentDirection !== 'right') {
          newDirection = 'left';
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currentDirection !== 'left') {
          newDirection = 'right';
        }
        break;
    }
    
    if (callback && typeof callback === 'function') {
      callback(newDirection);
    }
  }

  /**
   * 改变方向（用于移动端控制）
   * @param {String} direction 新方向
   * @param {String} currentDirection 当前方向
   * @param {Function} callback 回调函数，用于更新方向
   */
  changeDirection(direction, currentDirection, callback) {
    let newDirection = currentDirection;
    
    switch (direction) {
      case 'up':
        if (currentDirection !== 'down') {
          newDirection = 'up';
        }
        break;
      case 'down':
        if (currentDirection !== 'up') {
          newDirection = 'down';
        }
        break;
      case 'left':
        if (currentDirection !== 'right') {
          newDirection = 'left';
        }
        break;
      case 'right':
        if (currentDirection !== 'left') {
          newDirection = 'right';
        }
        break;
    }
    
    if (callback && typeof callback === 'function') {
      callback(newDirection);
    }
  }
}

export default SnakeController;