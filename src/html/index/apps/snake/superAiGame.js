function SuperAIGame(controller) {
    // 神经网络模型
    let model = null;
    // 训练数据
    let trainingData = {
        inputs: [],
        outputs: [],
        rewards: [],  // 添加奖励数组
        gameScores: []
    };
    // 当前游戏的决策记录
    let currentGameData = {
        inputs: [],
        outputs: [],
        rewards: []  // 添加奖励数组
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

    const MEMORY_SIZE = 10; // 记忆最近的4个状态
    let memoryBuffer = []; // 状态记忆缓冲区
    // 添加折扣因子
    const DISCOUNT_FACTOR = 0.9; // 折扣因子

    // 初始化模型
    function initModel() {
        model = tf.sequential();
        
        // 替换原输入层为LSTM层
        model.add(tf.layers.lstm({
            units: 32,
            inputShape: [MEMORY_SIZE, 12], // 修改输入维度为[记忆长度, 特征数]
            returnSequences: false
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
        if(gameStart == false) {
            loadTrainingData();
            await loadModel();
            memoryBuffer = []; // 重置记忆缓冲区
            gameStart = true;
        }
        return await predictDirection(snake, food, boardSize);
    }

    // 添加奖励函数
    function calculateReward(snake, food, prevDistance, newDistance, didCollide, didEatFood, boardSize) {
        let reward = 0;
        
        // 吃到食物给予高奖励
        if (didEatFood) {
            reward += 10.0;
        }
        
        // 根据距离变化给予奖励或惩罚
        if (newDistance < prevDistance) {
            reward += 0.1; // 接近食物
        } else {
            reward -= 0.05; // 远离食物
        }
        
        // 碰撞给予严重惩罚
        if (didCollide) {
            reward -= 10.0;
        }
        
        // 计算与蛇身的最小距离并给予惩罚
        const head = snake[0];
        let minBodyDistance = Infinity;
        for (let i = 1; i < snake.length; i++) {
            const segment = snake[i];
            const distance = Math.abs(head.x - segment.x) + Math.abs(head.y - segment.y);
            minBodyDistance = Math.min(minBodyDistance, distance);
        }
        
        // 当距离蛇身过近时给予惩罚（距离小于3时开始惩罚）
        if (minBodyDistance < 3) {
            reward -= (3 - minBodyDistance) * 0.5;
        }
        
        // 评估未来风险
        const futureRisk = evaluateFutureRisk(snake, food, boardSize);
        reward -= futureRisk;
        
        return reward;
    }

    // 添加评估未来风险的函数
    function evaluateFutureRisk(snake, food, boardSize) {
        const head = snake[0];
        let risk = 0;
        
        // 模拟未来几步可能的移动
        const possiblePaths = simulateFuturePaths(snake, food, boardSize, 3); // 模拟3步
        
        // 如果没有可行路径，风险很高
        if (possiblePaths.length === 0) {
            return 5.0;
        }
        
        // 计算平均风险
        const avgRisk = possiblePaths.reduce((sum, path) => sum + path.risk, 0) / possiblePaths.length;
        return avgRisk;
    }

    // 模拟未来路径
    function simulateFuturePaths(snake, food, boardSize, depth) {
        if (depth === 0) return [{ risk: 0, path: [] }];
        
        const head = snake[0];
        const paths = [];
        
        // 检查四个方向
        for (const dir of Object.keys(DIRECTIONS)) {
            const newHead = Util.cloneMap( head );
            
            switch (dir) {
                case 'up': newHead.y -= 1; break;
                case 'right': newHead.x += 1; break;
                case 'down': newHead.y += 1; break;
                case 'left': newHead.x -= 1; break;
            }
            
            // 如果这个方向会导致碰撞，跳过
            if (isCollision(newHead, snake, boardSize)) continue;
            
            // 创建新的蛇身体
            const newSnake = [newHead, ...snake.slice(0, -1)];
            
            // 递归模拟下一步
            const futurePaths = simulateFuturePaths(newSnake, food, boardSize, depth - 1);
            
            // 计算当前步骤的风险
            let stepRisk = 0;
            
            // 检查可用空间
            const safetyScore = evaluateSafety(newHead, snake, boardSize);
            stepRisk += (4 - safetyScore) * 0.5; // 安全空间越少风险越高
            
            // 将当前步骤的风险添加到未来路径
            futurePaths.forEach(path => {
                path.risk = stepRisk + path.risk * DISCOUNT_FACTOR;
                path.path.unshift(dir);
                paths.push(path);
            });
        }
        
        return paths;
    }
    
    // 添加安全性评估函数
    function evaluateSafety(position, snake, boardSize) {
        let safeDirections = 0;
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dy, dx] of directions) {
            const newX = position.x + dx;
            const newY = position.y + dy;
            
            if (newX >= 0 && newX < boardSize.width && 
                newY >= 0 && newY < boardSize.height &&
                !snake.some(segment => segment.x === newX && segment.y === newY)) {
                safeDirections++;
            }
        }
        
        return safeDirections;
    }

    // 预测下一步方向
    async function predictDirection(snake, food, boardSize) {
        // 在训练数据不足时使用传统决策
        if (trainingData.inputs.length < 1000) {  // 设置阈值为1000条数据
            console.log('训练数据不足，使用传统决策');
            const traditionalDecision = makeTraditionalDecision(snake, food, boardSize);
            
            // 记录传统决策的数据用于训练
            const features = extractFeatures(snake, food, boardSize);
            updateMemory(features);
            currentGameData.inputs.push(features);
            
            // 记录决策结果
            const output = [0, 0, 0, 0];
            output[DIRECTIONS[traditionalDecision]] = 1;
            currentGameData.outputs.push(output);
            
            // 计算奖励
            const head = snake[0];
            // 计算当前距离
            const currentDistance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
            const newHead = Util.cloneMap(head);
            switch (traditionalDecision) {
                case 'up': newHead.y -= 1; break;
                case 'right': newHead.x += 1; break;
                case 'down': newHead.y += 1; break;
                case 'left': newHead.x -= 1; break;
            }
            // 计算新距离
            const newDistance = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
            const didCollide = isCollision(newHead, snake, boardSize);
            const didEatFood = newHead.x === food.x && newHead.y === food.y;
            const reward = calculateReward(snake, food, currentDistance, newDistance, didCollide, didEatFood, boardSize);
            currentGameData.rewards.push(reward);
            
            return traditionalDecision;
        }
        // 训练数据足够后使用神经网络预测
        if (!model && !isModelLoading) {
            isModelLoading = true;
            await loadModel() || initModel();
            isModelLoading = false;
        }
        const features = extractFeatures(snake, food, boardSize);
        updateMemory(features);
        currentGameData.inputs.push(features);
        
        // 使用神经网络预测
        const prediction = tf.tidy(() => {
            const sequence = getMemorySequence();
            const inputTensor = tf.tensor3d([sequence]);
            return model.predict(inputTensor);
        });
        
        const predictionData = await prediction.data();
        prediction.dispose();
        
        // 找出可行的方向
        const head = snake[0];
        const currentDistance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
        
        const validDirections = [];
        const directionScores = [];
        
        // 检查每个方向是否可行
        for (let i = 0; i < 4; i++) {
            const dir = DIRECTIONS_MAP[i];
            const newHead = Util.cloneMap(head);
            
            switch (dir) {
                case 'up': newHead.y -= 1; break;
                case 'right': newHead.x += 1; break;
                case 'down': newHead.y += 1; break;
                case 'left': newHead.x -= 1; break;
            }
            
            if (!isCollision(newHead, snake, boardSize)) {
                validDirections.push(dir);
                directionScores.push(predictionData[i]);
            }
        }
        
        // 如果没有可行方向，随机选择一个
        if (validDirections.length === 0) {
            const randomDir = DIRECTIONS_MAP[Math.floor(Math.random() * 4)];
            const output = [0, 0, 0, 0];
            output[DIRECTIONS[randomDir]] = 1;
            currentGameData.outputs.push(output);
            currentGameData.rewards.push(-10.0);
            return randomDir;
        }
        
        // 替换这里开始的代码，使用新的方向选择逻辑
        let bestScore = -Infinity;
        let bestDirection = validDirections[0];
        
        for (let i = 0; i < validDirections.length; i++) {
            const dir = validDirections[i];
            const dirIndex = DIRECTIONS[dir];
            const modelScore = directionScores[i];
            
            const newHead = Util.cloneMap(head);
            switch (dir) {
                case 'up': newHead.y -= 1; break;
                case 'right': newHead.x += 1; break;
                case 'down': newHead.y += 1; break;
                case 'left': newHead.x -= 1; break;
            }
            
            const newDistance = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
            const didEatFood = newHead.x === food.x && newHead.y === food.y;
            const immediateReward = calculateReward(snake, food, currentDistance, newDistance, false, didEatFood, boardSize);
            
            const futureRisk = evaluateFutureRisk(snake, food, boardSize);
            
            const totalScore = modelScore + immediateReward - DISCOUNT_FACTOR * futureRisk;
            
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestDirection = dir;
            }
        }
        
        // 记录输出和奖励
        const output = [0, 0, 0, 0];
        output[DIRECTIONS[bestDirection]] = 1;
        currentGameData.outputs.push(output);
        
        const newHead = Util.cloneMap(head);
        switch (bestDirection) {
            case 'up': newHead.y -= 1; break;
            case 'right': newHead.x += 1; break;
            case 'down': newHead.y += 1; break;
            case 'left': newHead.x -= 1; break;
        }
        
        const newDistance = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
        const didCollide = isCollision(newHead, snake, boardSize);
        const didEatFood = newHead.x === food.x && newHead.y === food.y;
        
        const reward = calculateReward(snake, food, currentDistance, newDistance, didCollide, didEatFood, boardSize);
        currentGameData.rewards.push(reward);
        
        return bestDirection;
    }

    // 新增记忆管理函数
    function updateMemory(features) {
        memoryBuffer.push(features);
        if (memoryBuffer.length > MEMORY_SIZE) {
            memoryBuffer.shift();
        }
    }

    function getMemorySequence() {
        const currentFeatures = memoryBuffer[memoryBuffer.length - 1] || new Array(12).fill(0);
        const sequence = [...memoryBuffer];
        while (sequence.length < MEMORY_SIZE) {
            sequence.unshift([...currentFeatures]);
        }
        return sequence.slice(-MEMORY_SIZE);
    }

    // 添加传统AI决策函数
    function makeTraditionalDecision(snake, food, boardSize) {
        const head = snake[0];
        const directions = ['up', 'down', 'left', 'right'];
        let bestDirection = 'right';
        let minDistance = Infinity;

        directions.forEach(direction => {
            const newHead = Util.cloneMap( head );
            
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
        
        // 添加死亡惩罚到最后一个决策
        if (currentGameData.rewards && currentGameData.rewards.length > 0) {
            currentGameData.rewards[currentGameData.rewards.length - 1] -= 15.0;
        }
        
        // 应用折扣奖励 - 从后向前计算累积奖励
        if (currentGameData.rewards && currentGameData.rewards.length > 1) {
            for (let i = currentGameData.rewards.length - 2; i >= 0; i--) {
                // 当前奖励 + 折扣的未来奖励
                currentGameData.rewards[i] += DISCOUNT_FACTOR * currentGameData.rewards[i + 1];
            }
        }
        
        // 更新最高分
        if (score > gameState.highestScore) {
            gameState.highestScore = score;
        }
        
        // 确保 trainingData.rewards 已初始化
        if (!trainingData.rewards) {
            trainingData.rewards = [];
        }
        
        // 创建当前游戏的完整记录
        const currentGame = {
            score: score,
            inputs: currentGameData.inputs,
            outputs: currentGameData.outputs,
            rewards: currentGameData.rewards || []
        };
        
        // 添加到游戏记录数组
        if (!trainingData.games) {
            trainingData.games = [];
        }
        trainingData.games.push(currentGame);
        
        // 按得分排序并只保留最高分的10次游戏
        trainingData.games.sort((a, b) => b.score - a.score);
        if (trainingData.games.length > 10) {
            trainingData.games = trainingData.games.slice(0, 10);
        }
        
        // 重新整合训练数据
        trainingData.inputs = [];
        trainingData.outputs = [];
        trainingData.rewards = [];
        trainingData.gameScores = [];
        
        // 从保留的游戏中提取训练数据
        trainingData.games.forEach(game => {
            trainingData.inputs = trainingData.inputs.concat(game.inputs);
            trainingData.outputs = trainingData.outputs.concat(game.outputs);
            if (game.rewards && game.rewards.length > 0) {
                trainingData.rewards = trainingData.rewards.concat(game.rewards);
            }
            trainingData.gameScores.push(game.score);
        });
        
        // 重置当前游戏数据
        currentGameData = {
            inputs: [],
            outputs: [],
            rewards: []
        };
        
        // 如果积累了足够的数据，进行训练
        if (trainingData.inputs.length > 100) {
            await trainModel();
        }
        // 保存训练数据
        saveTrainingData();
        // console.log('已关闭自动训练，可手动训练');
    
        gameStart = false;
    }
    // 保存训练数据
    function saveTrainingData() {
        try {
            // 只保存必要的数据
            const dataToSave = {
                games: trainingData.games,
                gameScores: trainingData.gameScores
            };
            
            localStorage.setItem('snake-ai-training-data', JSON.stringify(dataToSave));
            localStorage.setItem('snake-ai-game-state', JSON.stringify(gameState));
            console.log('训练数据已保存，保留了最高分的10次游戏');
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
                const parsedData = JSON.parse(savedData);
                
                // 初始化训练数据
                trainingData = {
                    inputs: [],
                    outputs: [],
                    rewards: [],
                    gameScores: parsedData.gameScores || [],
                    games: parsedData.games || []
                };
                
                // 从保存的游戏中重建训练数据
                if (trainingData.games && trainingData.games.length > 0) {
                    trainingData.games.forEach(game => {
                        trainingData.inputs = trainingData.inputs.concat(game.inputs);
                        trainingData.outputs = trainingData.outputs.concat(game.outputs);
                        if (game.rewards && game.rewards.length > 0) {
                            trainingData.rewards = trainingData.rewards.concat(game.rewards);
                        }
                    });
                    
                    console.log(`已加载训练数据: ${trainingData.games.length}场游戏，${trainingData.inputs.length}条记录`);
                }
            }
            
            if (savedState) {
                gameState = JSON.parse(savedState);
                console.log(`已加载游戏状态，最高分: ${gameState.highestScore}`);
            }
        } catch (error) {
            console.error('加载训练数据失败:', error);
            // 初始化空的训练数据
            trainingData = {
                inputs: [],
                outputs: [],
                rewards: [],
                gameScores: [],
                games: []
            };
        }
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

        // 准备序列训练数据
        const sequenceInputs = [];
        for (let i = 0; i < trainingData.inputs.length - MEMORY_SIZE + 1; i++) {
            const sequence = trainingData.inputs.slice(i, i + MEMORY_SIZE);
            sequenceInputs.push(sequence);
        }
        
        // 转换为张量
        const inputTensor = tf.tensor3d(sequenceInputs);
        const outputTensor = tf.tensor2d(trainingData.outputs.slice(MEMORY_SIZE - 1));
        
        // 训练模型（移除样本权重）
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
    // 下载模型到本地
    async function downloadModel() {
        if (!model) {
            console.error('没有可下载的模型');
            return false;
        }
        
        try {
            const saveResults = await model.save('downloads://snake-ai-model');
            console.log('模型已下载', saveResults);
            return true;
        } catch (error) {
            console.error('下载模型失败:', error);
            return false;
        }
    }
    // 从本地文件上传模型
    async function uploadModel(files) {
        if (!files || files.length === 0) {
            console.error('没有选择文件');
            return false;
        }
        
        try {
            // 加载模型文件
            const uploadedModel = await tf.loadLayersModel(
                tf.io.browserFiles([
                    files[0], // model.json
                    ...(files.length > 1 ? [files[1]] : []) // weights.bin (如果存在)
                ])
            );
            
            // 编译模型
            uploadedModel.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });
            
            // 替换当前模型
            model = uploadedModel;
            console.log('模型已从文件加载并编译');
            
            // 保存到 IndexedDB
            await saveModel();
            
            return true;
        } catch (error) {
            console.error('上传模型失败:', error);
            return false;
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

    async function trainAndSaveModel() {
        console.log('trainingData', trainingData);
        // 如果积累了足够的数据，进行训练
        if (trainingData.inputs.length > 100) {
            await trainModel();
        }
        //     保存训练数据
        saveTrainingData();
    };

    // 对外暴露的方法
    return {
        trainAndSaveModel: trainAndSaveModel,
        loadModel: loadModel,
        startAI: startGame,
        gameOver: gameOver,
        trainModel: trainModel,
        downloadModel: downloadModel,  // 添加下载模型方法
        uploadModel: uploadModel       // 添加上传模型方法
    };
}

export default SuperAIGame;