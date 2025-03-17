function SuperAIGame(controller) {
    // 神经网络模型
    let model = null;
    // 训练数据
    let trainingData = {
        inputs: [],
        outputs: [],
        gameScores: []
    };
    // 当前游戏的决策记录
    let currentGameData = {
        inputs: [],
        outputs: []
    };
    // 游戏状态
    let gameState = {
        highestScore: 0
    };
    // 方向映射
    const DIRECTIONS = {
        up: 0,
        right: 1,
        down: 2,
        left: 3
    };
    // 反向映射
    const DIRECTIONS_MAP = ['up', 'right', 'down', 'left'];

    // 初始化模型
    function initModel() {
        model = tf.sequential();
        
        // 输入层 - 接收游戏状态特征
        model.add(tf.layers.dense({
            units: 16,
            inputShape: [12],
            activation: 'relu'
        }));
        
        // 隐藏层
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu'
        }));
        
        // 输出层 - 4个方向的概率
        model.add(tf.layers.dense({
            units: 4,
            activation: 'softmax'
        }));
        
        // 编译模型
        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        console.log('神经网络模型已初始化');
        return model;
    }

    // 从游戏状态提取特征
    function extractFeatures(snake, food, boardSize) {
        const head = snake[0];
        const features = [];
        
        // 1-4: 四个方向是否有障碍物
        features.push(head.y === 0 ? 1 : 0); // 上方是否是墙
        features.push(head.x === boardSize.width - 1 ? 1 : 0); // 右方是否是墙
        features.push(head.y === boardSize.height - 1 ? 1 : 0); // 下方是否是墙
        features.push(head.x === 0 ? 1 : 0); // 左方是否是墙
        
        // 5-8: 四个方向是否有蛇身
        const directions = [
            {x: 0, y: -1}, // 上
            {x: 1, y: 0},  // 右
            {x: 0, y: 1},  // 下
            {x: -1, y: 0}  // 左
        ];
        
        for (const dir of directions) {
            const checkPos = {x: head.x + dir.x, y: head.y + dir.y};
            const hasSnake = snake.slice(1).some(segment => 
                segment.x === checkPos.x && segment.y === checkPos.y
            );
            features.push(hasSnake ? 1 : 0);
        }
        
        // 9-10: 食物相对位置
        features.push((food.x - head.x) / boardSize.width); // 食物x方向相对位置
        features.push((food.y - head.y) / boardSize.height); // 食物y方向相对位置
        
        // 11-12: 蛇头相对位置
        features.push(head.x / boardSize.width); // 蛇头x相对位置
        features.push(head.y / boardSize.height); // 蛇头y相对位置
        
        return features;
    }
    // 添加模型加载状态标记
    let isModelLoading = false;

    let gameStart = false;

    async function startGame(snake, food, boardSize) {
        if(gameStart ==  false) {
            loadTrainingData();
            await loadModel();
            gameStart = true;
        }
        return await predictDirection(snake, food, boardSize);
    }
    
    // 预测下一步方向
    async function predictDirection(snake, food, boardSize) {
        // 修改模型加载逻辑，避免重复加载
        if (!model && !isModelLoading) {
            isModelLoading = true;
            await loadModel() || initModel();
            isModelLoading = false;
        }
        
        const features = extractFeatures(snake, food, boardSize);
        currentGameData.inputs.push(features);
        
        
        // 如果训练数据不足或随机概率，使用传统AI的决策
        // if (trainingData.inputs.length < 500 || Math.random() < 0.3) {
        //     const traditionalDecision = makeTraditionalDecision(snake, food, boardSize);
        //     const output = [0, 0, 0, 0];
        //     output[DIRECTIONS[traditionalDecision]] = 1;
        //     currentGameData.outputs.push(output);
        //     return traditionalDecision;
        // }
        
        // 使用神经网络预测
        const prediction = tf.tidy(() => {
            const inputTensor = tf.tensor2d([features]);
            return model.predict(inputTensor);
        });
        
        // 获取预测结果
        const predictionData = await prediction.data();
        prediction.dispose();
        
        // 找出可行的方向
        const head = snake[0];
        const validDirections = [];
        const directionScores = [];
        
        // 检查每个方向是否可行
        for (let i = 0; i < 4; i++) {
            const dir = DIRECTIONS_MAP[i];
            const newHead = {...head};
            
            switch (dir) {
                case 'up': newHead.y -= 1; break;
                case 'right': newHead.x += 1; break;
                case 'down': newHead.y += 1; break;
                case 'left': newHead.x -= 1; break;
            }
            
            // 检查是否会碰撞
            const willCollide = isCollision(newHead, snake, boardSize);
            
            if (!willCollide) {
                validDirections.push(dir);
                directionScores.push(predictionData[i]);
            }
        }
        
        // 如果没有可行方向，随机选择一个
        if (validDirections.length === 0) {
            const randomDir = DIRECTIONS_MAP[Math.floor(Math.random() * 4)];
            
            // 记录输出
            const output = [0, 0, 0, 0];
            output[DIRECTIONS[randomDir]] = 1;
            currentGameData.outputs.push(output);
            
            return randomDir;
        }
        
        // 从可行方向中选择得分最高的
        let bestScore = -1;
        let bestDirection = validDirections[0];
        
        for (let i = 0; i < validDirections.length; i++) {
            if (directionScores[i] > bestScore) {
                bestScore = directionScores[i];
                bestDirection = validDirections[i];
            }
        }
        
        // 记录输出
        const output = [0, 0, 0, 0];
        output[DIRECTIONS[bestDirection]] = 1;
        currentGameData.outputs.push(output);
        
        return bestDirection;
    }

    // 添加传统AI决策函数
    function makeTraditionalDecision(snake, food, boardSize) {
        const head = snake[0];
        const directions = ['up', 'down', 'left', 'right'];
        let bestDirection = 'right';
        let minDistance = Infinity;

        directions.forEach(direction => {
            const newHead = { ...head };
            
            switch (direction) {
                case 'up': newHead.y -= 1; break;
                case 'down': newHead.y += 1; break;
                case 'left': newHead.x -= 1; break;
                case 'right': newHead.x += 1; break;
            }

            if (!isCollision(newHead, snake, boardSize)) {
                const distance = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestDirection = direction;
                }
            }
        });

        return bestDirection;
    }

    // 检查碰撞
    function isCollision(head, snake, boardSize) {
        // 检查是否撞墙
        if (head.x < 0 || head.x >= boardSize.width || head.y < 0 || head.y >= boardSize.height) {
            return true;
        }
        
        // 检查是否撞到蛇身
        return snake.some((segment, index) => {
            // 跳过蛇头
            if (index === 0) return false;
            return segment.x === head.x && segment.y === head.y;
        });
    }

    // 游戏结束，保存训练数据
    async function gameOver(score) {
        if (currentGameData.inputs.length === 0) return;
        
        // 更新最高分
        if (score > gameState.highestScore) {
            gameState.highestScore = score;
        }
        
        // 添加到训练数据
        trainingData.inputs = trainingData.inputs.concat(currentGameData.inputs);
        trainingData.outputs = trainingData.outputs.concat(currentGameData.outputs);
        trainingData.gameScores.push(score);
        
        // 重置当前游戏数据
        currentGameData = {
            inputs: [],
            outputs: []
        };
        
        // 如果积累了足够的数据，进行训练
        if (trainingData.inputs.length > 1000) {
            await trainModel();
        }
        
        // 保存训练数据
        saveTrainingData();

        gameStart = false;
    }

    // 训练模型
    async function trainModel() {
        if (!model) {
            model = initModel();
        }
        
        // 标记模型正在训练
        model.isTraining = true;
        
        if (trainingData.inputs.length === 0) {
            console.log('没有训练数据');
            return;
        }
        
        console.log(`开始训练模型，数据量: ${trainingData.inputs.length}`);
        
        // 转换为张量
        const inputTensor = tf.tensor2d(trainingData.inputs);
        const outputTensor = tf.tensor2d(trainingData.outputs);
        
        // 训练模型
        await model.fit(inputTensor, outputTensor, {
            epochs: 10,
            batchSize: 32,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`训练轮次 ${epoch}: 损失 = ${logs.loss.toFixed(4)}`);
                }
            }
        });
        
        // 释放张量
        inputTensor.dispose();
        outputTensor.dispose();
        
        console.log('模型训练完成');
        
        // 训练完成后移除标记
        model.isTraining = false;
        
        // 保存模型
        await saveModel();
    }

    // 保存模型
    async function saveModel() {
        if (!model) return;
        
        try {
            const saveResults = await model.save('indexeddb://snake-ai-model');
            console.log('模型已保存', saveResults);
        } catch (error) {
            console.error('保存模型失败:', error);
        }
    }

    // 加载模型
    async function loadModel() {
        try {
            if (model) return true; // 如果模型已存在，直接返回
            
            const loadedModel = await tf.loadLayersModel('indexeddb://snake-ai-model');
            loadedModel.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
            model = loadedModel;
            console.log('模型已加载并编译');
            return true;
        } catch (error) {
            console.log('加载模型失败，将创建新模型');
            return false;
        }
    }

    // 保存训练数据
    function saveTrainingData() {
        try {
            localStorage.setItem('snake-ai-training-data', JSON.stringify(trainingData));
            localStorage.setItem('snake-ai-game-state', JSON.stringify(gameState));
            console.log('训练数据已保存');
        } catch (error) {
            console.error('保存训练数据失败:', error);
        }
    }

    // 加载训练数据
    function loadTrainingData() {
        try {
            const savedData = localStorage.getItem('snake-ai-training-data');
            const savedState = localStorage.getItem('snake-ai-game-state');
            
            if (savedData) {
                trainingData = JSON.parse(savedData);
                console.log(`已加载训练数据: ${trainingData.inputs.length}条`);
            }
            
            if (savedState) {
                gameState = JSON.parse(savedState);
                console.log(`已加载游戏状态，最高分: ${gameState.highestScore}`);
            }
        } catch (error) {
            console.error('加载训练数据失败:', error);
        }
    }

    // 对外暴露的方法
    return {
        startAI: startGame,
        gameOver: gameOver,
        trainModel: trainModel
    };
}

export default SuperAIGame;