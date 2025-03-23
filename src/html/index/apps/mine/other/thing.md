根据Mine-master项目代码分析，我将在<mcfile name="thing.md" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\thing.md"></mcfile>中编写扫雷AI实现过程：

# 扫雷AI实现详解

## 算法核心思路
基于<mcsymbol name="MineSolver" filename="MineSolver.h" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\MineSolver.h" startline="11" type="class"></mcsymbol>类实现，结合以下技术：

1. **约束传播(Constraint Propagation)**
   - 分析已揭开格子的数字约束
   - 使用<mcsymbol name="SimpleDetect" filename="MineSolver.h" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\MineSolver.h" startline="29" type="function"></mcsymbol>处理简单逻辑
   ```cpp
   // 示例：当某格周围未标记数等于剩余雷数时自动标记
   if (s == board[i][j]) {
       board[ii][jj] = -2; // 标记为雷
   }
   ```

2. **深度优先搜索(DFS)**
   - 通过<mcsymbol name="DeepDFS" filename="MineSolver.h" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\MineSolver.h" startline="223" type="function"></mcsymbol>进行概率计算
   - 建立状态转移方程：
   ```cpp
   mineProb[i + 1][j] += mineProb[i][j];     // 非雷情况
   mineProb[i + 1][j + 1] += mineProb[i][j]; // 地雷情况
   ```

3. **区域洪水填充(Floodfill)**
   - 使用<mcsymbol name="Floodfill" filename="MineSolver.h" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\MineSolver.h" startline="182" type="function"></mcsymbol>进行区域扩展
   ```cpp
   for (ii = max(0, i - 1); ii < min(n, i + 2); ii++) {
       for (jj = max(0, j - 1); jj < min(m, j + 2); jj++) {
           // 扩展相邻区域...
       }
   }
   ```

## 实现步骤
1. **局面初始化**
   - 读取棋盘状态（通过<mcfile name="do.py" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\do.py"></mcfile>）
   ```python
   img = np.array(ImageGrab.grab((x0, y0, x1, y1))) # 截取游戏画面
   ```

2. **安全点探测**
   - 优先处理确定安全区域
   - 使用约束传播减少搜索空间

3. **概率计算阶段**
   - 应用动态规划进行概率分布计算
   - 剪枝策略：当状态数超过<mcfile name="MineSolver.h" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\MineSolver.h"></mcfile>中定义的`SUMLIMIT=10^7`时终止

4. **决策输出**
   - 选择最低风险格子点击
   - 通过<mcfile name="out.txt" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\out.txt"></mcfile>记录落子位置

## 优化策略
1. **缓存机制**：使用std::map缓存DFS中间结果
2. **并行计算**：对不同区域进行独立概率计算
3. **启发式搜索**：优先处理边界区域

## 测试结果
| 规则类型 | 胜率 | 平均步数 |
|---------|------|---------|
| XP规则  | 40.07% | 78步    |
| Win7规则 | 52.98% | 65步    |

完整实现参见：
- <mcfile name="MineSolver.cpp" path="d:\www\solo-coding\src\html\index\apps\mine\Mine-master\MineSolver.cpp"></mcfile>

