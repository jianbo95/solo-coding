function SuperAIGame(controller) {
    let model = null;
    let currentDirection = 'right';
    const directions = ['up', 'down', 'left', 'right'];
    // 添加训练数据存储
    let trainingData = [];
    const MAX_TRAINING_DATA = 5000; // 限制训练数据量

    // 初始化时加载训练数据
    loadTrainingData();

    // 添加游戏结束处理方法
    function handleGameOver(score) {
        // 记录最终得分
        const finalScore = score || (trainingData.length > 0 ? trainingData[trainingData.length - 1].score : 0);
        
        // 为所有训练数据添加最终得分
        trainingData = trainingData.map(data => ({
            ...data,
            finalScore: finalScore
        }));
        
        // 保存训练数据
        return saveTrainingData();
    }

    async function createModel() {
        const model = tf.sequential();
        
        model.add(tf.layers.dense({
            units: 32,
            activation: 'relu',
            inputShape: [12]  // 增加输入特征数量
        }));
        
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu'
        }));
        
        model.add(tf.layers.dense({
            units: 4,
            activation: 'softmax'
        }));

        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        return model;
    }

    function getState(snake, food, boardSize) {
        const head = snake[0];
        const state = new Array(12).fill(0);  // 增加到12个特征

        // 检查四个方向的危险
        const checkDirections = [
            [-1, 0],  // 上
            [1, 0],   // 下
            [0, -1],  // 左
            [0, 1]    // 右
        ];

        // 前4个特征：检查四个方向是否有障碍
        checkDirections.forEach((dir, index) => {
            const newX = head.x + dir[1];
            const newY = head.y + dir[0];

            if (newX < 0 || newX >= boardSize.width || 
                newY < 0 || newY >= boardSize.height ||
                snake.some(segment => segment.x === newX && segment.y === newY)) {
                state[index] = 1;
            }
        });

        // 接下来4个特征：食物的相对方向
        state[4] = food.y < head.y ? 1 : 0;  // 食物在上方
        state[5] = food.y > head.y ? 1 : 0;  // 食物在下方
        state[6] = food.x < head.x ? 1 : 0;  // 食物在左方
        state[7] = food.x > head.x ? 1 : 0;  // 食物在右方

        // 最后4个特征：食物的距离
        state[8] = Math.abs(food.x - head.x) / boardSize.width;
        state[9] = Math.abs(food.y - head.y) / boardSize.height;
        state[10] = (food.x - head.x) / boardSize.width;
        state[11] = (food.y - head.y) / boardSize.height;

        return state;
    }

    async function predictDirection(snake, food, boardSize) {
        if (!model) {
            model = await createModel();
        }

        const state = getState(snake, food, boardSize);
        const stateTensor = tf.tensor2d([state]);
        
        const prediction = await model.predict(stateTensor).array();
        stateTensor.dispose();

        // 获取预测概率最高的方向
        let maxIndex = prediction[0].indexOf(Math.max(...prediction[0]));
        
        // 优先选择朝向食物的安全方向
        const head = snake[0];
        const possibleDirections = [];

        directions.forEach((dir, index) => {
            const newHead = { ...head };
            switch (dir) {
                case 'up': newHead.y -= 1; break;
                case 'down': newHead.y += 1; break;
                case 'left': newHead.x -= 1; break;
                case 'right': newHead.x += 1; break;
            }

            if (!isCollision(newHead, snake, boardSize)) {
                const distance = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
                possibleDirections.push({ direction: dir, index, distance });
            }
        });

        if (possibleDirections.length > 0) {
            // 选择距离食物最近的安全方向
            possibleDirections.sort((a, b) => a.distance - b.distance);
            currentDirection = possibleDirections[0].direction;
        } else {
            // 如果没有安全方向，使用模型预测的方向
            currentDirection = directions[maxIndex];
        }

        // 记录训练数据
        trainingData.push({
            state: state,
            action: directions.indexOf(currentDirection),
            prediction: prediction[0],
            timestamp: Date.now(),
            score: snake.length - 1
        });

        // 控制训练数据大小
        if (trainingData.length > MAX_TRAINING_DATA) {
            trainingData.shift();
        }

        return currentDirection;
    }

    function isCollision(head, snake, boardSize) {
        if (head.x < 0 || head.x >= boardSize.width || 
            head.y < 0 || head.y >= boardSize.height) {
            return true;
        }
        return snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    // 添加保存训练数据的方法
    function saveTrainingData() {
        if (trainingData.length === 0) {
            console.warn('没有可保存的训练数据');
            return false;
        }

        try {
            // 方法1: 保存到localStorage
            localStorage.setItem('snake_training_data', JSON.stringify(trainingData));
            
            // 方法2: 下载为JSON文件
            const dataStr = JSON.stringify(trainingData);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `snake_training_data_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('保存训练数据失败:', error);
            return false;
        }
    }

    // 添加加载训练数据的方法
    function loadTrainingData() {
        try {
            const savedData = localStorage.getItem('snake_training_data');
            if (savedData) {
                console.log('加载训练数据成功');
                trainingData = JSON.parse(savedData);
                return trainingData.length;
            } else {
                console.log('没有训练数据');
            }
            return 0;
        } catch (error) {
            console.error('加载训练数据失败:', error);
            return 0;
        }
    }

    return {
        startAI: async (snake, food, boardSize) => {
            return await predictDirection(snake, food, boardSize);
        },
        saveTrainingData,
        loadTrainingData,
        getTrainingDataCount: () => trainingData.length,
        // 添加游戏结束处理方法
        gameOver: (score) => handleGameOver(score)
    };
}

export default SuperAIGame;