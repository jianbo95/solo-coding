import Utils from './utils.js';

/**
 * 重叠区域策略类
 * 1. 计算重叠区域
 * 2. 计算中心节点
 * 3. 计算至少叠加区域
 * 4. 计算至少叠加中心节点
 * 5. 无雷推断
 * 6. 有雷推断
 */
export default class OverlapRegionStrategy {
    constructor(debug = false) {
        this.debug = debug;
        this.utils = new Utils();
        this.log = (...args) => {
            if (this.debug) {
                console.log(...args);
            }
        };
    }

    analyze(grid, rows, cols, revealedCells, debug) {
        var currentDebug = this.debug;
        if(debug === true) {
            this.debug = true;
        }
        var result = this.analyzeMain(grid, rows, cols, revealedCells);
        if(debug === true) {
            this.debug = currentDebug;
        }
        return result;
    }

    // 新增计算差集的方法
    calculateDiffNodes(largerRegion, smallerRegion) {
        return largerRegion.nodes.filter(largerNode => 
            !smallerRegion.nodes.some(smallerNode => 
                smallerNode.row === largerNode.row && smallerNode.col === largerNode.col
            )
        );
    }

    analyzeMain(grid, rows, cols, revealedCells) {
        const regions = new Map();
        const centerNodeRegions = new Map();
        // 新增：用于存储至少叠加区域的映射
        const atLeastRegions = new Map();
        const centerNodeAtLeastRegions = new Map();

        // 遍历所有已揭示的数字格子
        for (const cell of revealedCells) {
            const { row, col } = cell;
            
            if (!grid[row][col].revealed || grid[row][col].isMine) continue;
            
            const value = grid[row][col].adjacentMines;
            if(value === 0) continue;

            // 获取这个中心节点周围所有的未揭示格子
            const unrevealedNeighbors = this.utils.getUnrevealedNeighbors(grid, rows, cols, row, col);
            if (unrevealedNeighbors.length === 0) continue;

            // 检查现有的区域，看是否是这个中心节点的子集
            regions.forEach((region, key) => {
                // 检查region的所有节点是否都在当前中心节点的周围
                const isSubset = region.nodes.every(node => 
                    unrevealedNeighbors.some(n => n.row === node.row && n.col === node.col)
                );
                
                if (isSubset) {
                    const currentCount = value - this.utils.countFlagsAroundCells(grid, [{row, col}]);
                    region.counts.add(currentCount);
                    region.centers.push({ row, col, value, count: currentCount });
                }
            });

            // 创建新的区域
            const regionKey = unrevealedNeighbors
                .map(n => `${n.row},${n.col}`)
                .sort()
                .join('|');

            if (!regions.has(regionKey)) {
                const currentCount = value - this.utils.countFlagsAroundCells(grid, [{row, col}]);
                regions.set(regionKey, {
                    nodes: unrevealedNeighbors,
                    counts: new Set([currentCount]),
                    centers: [{ row, col, value, count: currentCount }]
                });
            }
        }

        // 打印叠加区域和中心节点的关系
        this.log('\n=== 叠加区域分析 ===');
        regions.forEach((region, key) => {
            this.log('\n叠加区域:', region.nodes.map(n => `(${n.row}, ${n.col})`).join(', '));
            this.log('相关的中心节点:');
            region.centers.forEach(center => {
                this.log(`  (${center.row}, ${center.col}) 值: ${center.value}, 需要的雷数: ${center.count}`);
            });
        });
        // 可以根据叠加区域找到所有的中心节点了
        // 现在还需要根据中心节点找到所有的叠加区域
        let centerList = [];
        regions.forEach((region, key) => {
            region.centers.forEach(center => {
                if (!centerNodeRegions.has(center)) {
                    centerNodeRegions.set(center, []);
                }
                centerNodeRegions.get(center).push(region);
                // 获取所有中心节点
                centerList.push(center);
            });
        });

        // 对中心节点去重
        const uniqueCenters = new Map();
        centerList.forEach(center => {
            const key = `${center.row},${center.col}`;
            if (!uniqueCenters.has(key)) {
                uniqueCenters.set(key, {
                    center: center,
                    regions: new Set()
                });
            }
            centerNodeRegions.get(center).forEach(region => {
                uniqueCenters.get(key).regions.add(region);
            });
        });

        // 打印所有中心节点及其叠加区域
        this.log('\n=== 中心节点分析 ===');
        uniqueCenters.forEach((data, key) => {
            this.log(`\n中心节点 (${data.center.row}, ${data.center.col}) 值: ${data.center.value}`);
            this.log('关联的叠加区域:');
            Array.from(data.regions).forEach((region, index) => {
                this.log(`  区域 ${index + 1}:`);
                this.log(`    格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                this.log(`    需要的雷数: ${data.center.count}`);
            });
        });

        // 现在我们有了所有的中心节点及其关联的叠加区域
        // 举个例子
        // 中心节点 (1, 2) 值: 1
        // 关联的叠加区域:
        //   区域 1:
        //     格子: (0, 3), (1, 3)
        //     需要的雷数: 1
        //   区域 2:
        //     格子: (0, 3), (1, 3), (2, 3)
        //     需要的雷数: 1
        // 区域2包含了区域1，区域2减去区域1，得到一个新的叠加区域
        // 这个叠加区域的雷数是 1-1 = 0 同时这个叠加区域只有一个格子，如果新的叠加区域有多个格子，那就取一个格子，它也一定不是雷
        // 这个格子就是节点 (2, 3)，所以 (2, 3) 不是雷
        // 分析包含关系的区域


        // 在处理完普通叠加区域后，生成至少叠加区域
        this.log('\n=== 至少叠加区域分析 ===');
        regions.forEach((region, key) => {
            const nodes = region.nodes;
            const mineCount = Array.from(region.counts)[0];
            
            // 只处理有2个以上格子且雷数大于1的区域
            if (nodes.length >= 2 && mineCount > 0) {
                this.log(`\n原始区域信息:`);
                this.log(`- 格子: ${nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                this.log(`- 雷数: ${mineCount}`);
                this.log(`- 中心节点: ${region.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
                
                this.log('\n生成的至少区域:');
                // 生成所有可能的两两组合
                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        // 修改：计算拆分出去的格子数量和对应的至少雷数
                        const splitOutCount = nodes.length - 2; // 拆分出去的格子数量
                        const minMines = mineCount - splitOutCount; // 减去拆分出去的格子数对应的雷数
                        
                        // 如果至少雷数小于等于0，跳过这个组合
                        if (minMines <= 0) {
                            continue;
                        }

                        const regionKey = `${nodes[i].row},${nodes[i].col}|${nodes[j].row},${nodes[j].col}`;
                        
                        // 检查是否已存在相同格子组合的至少区域
                        if (atLeastRegions.has(regionKey)) {
                            const existingRegion = atLeastRegions.get(regionKey);
                            if (existingRegion.minMines >= minMines) {
                                continue;
                            }
                        }

                        const atLeastRegion = {
                            nodes: [nodes[i], nodes[j]],
                            minMines,
                            centers: region.centers,
                            isAtLeast: true,
                            sourceRegion: {
                                nodes: nodes,
                                mineCount: mineCount,
                                splitOutCount: splitOutCount // 添加拆分信息用于调试
                            }
                        };
                        
                        atLeastRegions.set(regionKey, atLeastRegion);
                        
                        this.log(`- 格子组合: (${nodes[i].row}, ${nodes[i].col}), (${nodes[j].row}, ${nodes[j].col})`);
                        this.log(`  至少雷数: ${atLeastRegion.minMines}`);
                        this.log(`  拆分来源: ${atLeastRegion.sourceRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${atLeastRegion.sourceRegion.mineCount}`);
                        this.log(`  拆分说明: 原始区域${nodes.length}个格子${mineCount}个雷，拆分出${splitOutCount}个格子，剩余至少${minMines}个雷`);
                    }
                }
            }
        });

        // 建立中心节点到至少区域的映射
        this.log('\n=== 至少叠加中心节点分析 ===');
        const centerToAtLeastRegions = new Map();
        // 遍历所有至少区域
        atLeastRegions.forEach((region, key) => {
            // 获取这个区域的所有格子
            const nodes = region.nodes;
            
            // 遍历所有中心节点，检查哪些中心节点可以包含这个区域
            uniqueCenters.forEach((data, centerKey) => {
                const center = data.center;
                // 获取中心节点周围的未揭示格子
                const centerNeighbors = this.utils.getUnrevealedNeighbors(grid, rows, cols, center.row, center.col);
                
                // 检查区域是否是这个中心节点的子集
                const isSubset = nodes.every(node =>
                    centerNeighbors.some(n =>
                        n.row === node.row && n.col === node.col
                    )
                );

                // 如果是子集，将这个区域添加到该中心节点的映射中
                if (isSubset) {
                    if (!centerToAtLeastRegions.has(centerKey)) {
                        centerToAtLeastRegions.set(centerKey, []);
                    }
                    centerToAtLeastRegions.get(centerKey).push(region);
                }
            });
        });

        // 打印中心节点和其关联的至少区域
        centerToAtLeastRegions.forEach((regions, centerKey) => {
            this.log(`\n中心节点 ${centerKey}:`);
            this.log(`关联的至少区域数量: ${regions.length}`);
            regions.forEach((region, index) => {
                this.log(`  区域 ${index + 1}:`);
                this.log(`  - 格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                this.log(`  - 至少雷数: ${region.minMines}`);
            });
        });
        
        // 尝试无雷推断
        const noMineResult = this.analyzeNoMineRegions(
            Array.from(uniqueCenters), 
            Array.from(centerToAtLeastRegions.entries())
        );
        if (noMineResult) return this.utils.verifyResult(noMineResult, grid, '无雷');

        // 尝试有雷推断
        const hasMineResult = this.analyzeHasMineRegions(Array.from(uniqueCenters));
        if (hasMineResult) {
            console.log('有雷推断');
            return this.utils.verifyResult(hasMineResult, grid, '有雷');
        }

        // 单独叠加区域拆分成至少叠加区域
        // 举个例子 格子: (0, 3), (1, 3), (2, 3) 中有N个雷
        // 那么可以拆分为 (0, 3), (1, 3) 至少有一个雷，记为 >N-1 数量的雷
        // (1, 3), (2, 3) 至少有一个雷，记为 >N-1 数量的雷
        // (0, 3), (2, 3) 至少有一个雷，记为 >N-1 数量的雷
        // >N-1 数量的雷 在做无雷推断时，只能当作小区域
        // 当大区域包含该小区域时，大区域的雷数为N-1时，则大区域与小区域的差距就是没有雷的
        // 至少N个雷的单独叠加区域，用一个单独的变量记下来，因为这是至少N个雷的叠加区域，只能用作小区域
        // 至少叠加区域同样做一个中心节点到叠加区域的映射

        // 叠加区域可以组合在一起获得新的叠加区域
        // 通过取交集获得新的叠加区域，当新的叠加区域格子数大于2时有效
        // 再判断新的叠加区域属于哪个中心节点
        // 然后再重复之前的逻辑去做有雷和无雷推断
        // 尝试通过区域交集进行推断
        // const intersectionResult = this.analyzeIntersectionRegions(Array.from(uniqueCenters), grid, rows, cols);
        // if (intersectionResult) {
        //     console.log('通过区域交集进行推断');
        //     return this.utils.verifyResult(intersectionResult, grid, '区域交集');
        // } 

        // 叠加区域可以组合在一起获得新的叠加区域
        // 通过取并集获得新的叠加区域，但是并集有个条件，就是这两个叠加区域属于同一个中心节点
        // 再判断新的叠加区域属于哪个中心节点
        // 然后再重复之前的逻辑去做有雷和无雷推断
        // 尝试通过区域并集进行推断
        // 尝试通过区域并集进行推断
        // const unionResult = this.analyzeUnionRegions(Array.from(uniqueCenters), grid, rows, cols);
        // if (unionResult) {
        //     console.log('通过区域并集进行推断');
        //     return this.utils.verifyResult(unionResult, grid, '区域并集');
        // }

        return null;
    }

    analyzeUnionRegions(centersList, grid, rows, cols) {
        // 对每个中心节点分别处理
        for (const [centerKey, data] of centersList) {
            const regions = Array.from(data.regions);
            
            // 比较同一个中心节点下的每对区域
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];

                    // 计算并集
                    const union = [...region1.nodes];
                    region2.nodes.forEach(node2 => {
                        if (!union.some(node1 => node1.row === node2.row && node1.col === node2.col)) {
                            union.push(node2);
                        }
                    });

                    // 创建新的叠加区域
                    const newRegion = {
                        nodes: union,
                        counts: new Set([region1.count + region2.count]),
                        centers: [data.center]
                    };

                    this.log('\n发现新的并集区域：');
                    this.log(`  中心节点: (${data.center.row}, ${data.center.col})`);
                    this.log(`  区域1: ${region1.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${region1.count}`);
                    this.log(`  区域2: ${region2.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${region2.count}`);
                    this.log(`  并集区域: ${newRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(newRegion.counts)[0]}`);

                    // 添加到当前中心节点的区域集合中
                    data.regions.add(newRegion);

                    // 使用新的区域组合重新尝试推断
                    const noMineResult = this.analyzeNoMineRegions(centersList);
                    if (noMineResult) return noMineResult;

                    const hasMineResult = this.analyzeHasMineRegions(centersList);
                    if (hasMineResult) return hasMineResult;
                }
            }
        }

        return null;
    }

    analyzeIntersectionRegions(centersList, grid, rows, cols) {
        // 收集所有区域
        const allRegions = [];
        centersList.forEach(([_, data]) => {
            Array.from(data.regions).forEach(region => {
                allRegions.push(region);
            });
        });

        // 比较每对区域，寻找交集
        for (let i = 0; i < allRegions.length; i++) {
            for (let j = i + 1; j < allRegions.length; j++) {
                const region1 = allRegions[i];
                const region2 = allRegions[j];

                // 计算交集
                const intersection = region1.nodes.filter(node1 =>
                    region2.nodes.some(node2 =>
                        node2.row === node1.row && node2.col === node1.col
                    )
                );

                // 只处理交集格子数大于2的情况
                if (intersection.length >= 2) {
                    // 创建新的叠加区域
                    const newRegion = {
                        nodes: intersection,
                        counts: new Set([Math.min(region1.count, region2.count)]),
                        centers: []
                    };

                    // 找出这个新区域属于哪些中心节点
                    centersList.forEach(([_, data]) => {
                        const center = data.center;
                        const centerNeighbors = this.utils.getUnrevealedNeighbors(grid, rows, cols, center.row, center.col);
                        
                        // 检查新区域是否是这个中心节点的子集
                        const isSubset = newRegion.nodes.every(node =>
                            centerNeighbors.some(n =>
                                n.row === node.row && n.col === node.col
                            )
                        );

                        if (isSubset) {
                            const currentCount = center.value - this.utils.countFlagsAroundCells(grid, [{row: center.row, col: center.col}]);
                            newRegion.counts.add(currentCount);
                            newRegion.centers.push(Object.assign({}, center, { count: currentCount }));
                        }
                    });

                    // 如果找到了相关的中心节点，尝试进行推断
                    if (newRegion.centers.length > 0) {
                        this.log('\n发现新的交集区域：');
                        this.log(`  格子: ${newRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                        this.log('  相关的中心节点:');
                        newRegion.centers.forEach(center => {
                            this.log(`    (${center.row}, ${center.col}) 值: ${center.value}, 需要的雷数: ${center.count}`);
                        });

                        // 添加到现有的中心节点分析中
                        centersList.forEach(([key, data]) => {
                            newRegion.centers.forEach(center => {
                                if (`${center.row},${center.col}` === key) {
                                    data.regions.add(newRegion);
                                }
                            });
                        });

                        // 使用新的区域组合重新尝试推断
                        const noMineResult = this.analyzeNoMineRegions(centersList);
                        if (noMineResult) return noMineResult;

                        const hasMineResult = this.analyzeHasMineRegions(centersList);
                        if (hasMineResult) return hasMineResult;
                    }
                }
            }
        }

        return null;
    }

    analyzeNoMineRegions(centersList, atLeastRegionsList) {
        for (const [centerKey, data] of centersList) {
            this.log(`\n分析中心节点 (${data.center.row}, ${data.center.col}) 值: ${data.center.value}`);
            const regions = Array.from(data.regions);
            
            // 比较每对区域
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];
                    
                    this.log(`\n比较两个区域:`);
                    this.log(`区域1: ${region1.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(region1.counts)[0]}`);
                    this.log(`区域2: ${region2.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(region2.counts)[0]}`);
                    
                    // 检查两个区域的包含关系（双向检查）
                    let smallerRegion, largerRegion, diffNodes;
                    
                    // 检查region2是否包含region1
                    const is2ContainsRegion1 = region1.nodes.every(node1 => 
                        region2.nodes.some(node2 => 
                            node2.row === node1.row && node2.col === node1.col
                        )
                    );
                    
                    // 检查region1是否包含region2
                    const is1ContainsRegion2 = region2.nodes.every(node2 => 
                        region1.nodes.some(node1 => 
                            node1.row === node2.row && node1.col === node2.col  // 修复：之前这里用错了变量
                        )
                    );
                    
                    if (is2ContainsRegion1) {
                        this.log('发现包含关系: 区域2 包含 区域1');
                        smallerRegion = region1;
                        largerRegion = region2;
                        diffNodes = this.calculateDiffNodes(largerRegion, smallerRegion);
                    } else if (is1ContainsRegion2) {
                        this.log('发现包含关系: 区域1 包含 区域2');
                        smallerRegion = region2;
                        largerRegion = region1;
                        diffNodes = this.calculateDiffNodes(largerRegion, smallerRegion);
                    } else {
                        this.log('未发现包含关系，继续检查下一对区域');
                        continue;
                    }
                    
                    if (smallerRegion && largerRegion && diffNodes.length > 0) {
                        // 获取两个区域的雷数
                        const smallCount = Array.from(smallerRegion.counts)[0];
                        const largeCount = Array.from(largerRegion.counts)[0];
                        
                        this.log(`\n分析雷数关系:`);
                        this.log(`小区域雷数: ${smallCount}`);
                        this.log(`大区域雷数: ${largeCount}`);
                        this.log(`差集格子数量: ${diffNodes.length}`);
                        
                        // 如果大区域的雷数等于小区域的雷数，差集区域一定没有雷
                        if (largeCount === smallCount) {
                            this.log(`\n推断原因: 大区域雷数(${largeCount}) = 小区域雷数(${smallCount})`);
                            this.log(`结论: 差集格子 ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定不是雷`);
                            this.log(`原因: 因为大区域包含小区域，且雷数相等，所以额外的格子一定不是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'reveal',
                                isGuess: false
                            };
                        }

                        // 如果大区域的雷数小于小区域的雷数，差集区域也一定没有雷
                        if (largeCount < smallCount) {
                            this.log(`\n推断原因: 大区域雷数(${largeCount}) < 小区域雷数(${smallCount})`);
                            this.log(`结论: 差集格子 ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定不是雷`);
                            this.log(`原因: 因为大区域包含小区域，但雷数反而更少，所以额外的格子一定不是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'reveal',
                                isGuess: false
                            };
                        }
                        
                        this.log('未找到可以推断的情况，继续检查下一对区域');
                    }
                }
            }
        }

        // 添加对至少区域的处理
        // console.log('分析至少叠加区域，当前数量' + atLeastRegionsList.length);
        for (const [centerKey, atLeastRegions] of atLeastRegionsList) {
            this.log(`\n分析至少叠加区域中心节点 ${centerKey} 的至少区域`);

            // 获取该中心节点的所有普通叠加区域，并打印出来
            const centerData = centersList.find(([key, _]) => key === centerKey);
            if (centerData) {
                const [_, data] = centerData;
                this.log('\n该中心节点的普通叠加区域:');
                Array.from(data.regions).forEach((region, index) => {
                    this.log(`区域 ${index + 1}:`);
                    this.log(`- 格子: ${region.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                    this.log(`- 雷数: ${Array.from(region.counts)[0]}`);
                });
            }
            
            for (const atLeastRegion of atLeastRegions) {
                // 至少区域只能作为小区域使用
                const smallerRegion = atLeastRegion;
                
                // 在普通区域中寻找包含这个至少区域的大区域
                for (const [_, data] of centersList) {
                    for (const largerRegion of data.regions) {
                        // 检查是否包含关系
                        const isContained = smallerRegion.nodes.every(node1 => 
                            largerRegion.nodes.some(node2 => 
                                node2.row === node1.row && node2.col === node1.col
                            )
                        );

                        if (isContained) {
                            const diffNodes = this.calculateDiffNodes(largerRegion, smallerRegion);
                            const largeCount = Array.from(largerRegion.counts)[0];
                            
                            // 如果大区域的雷数等于至少区域的最小雷数，差集一定没有雷
                            if (largeCount === smallerRegion.minMines && diffNodes.length > 0) {
                                this.log(`\n发现至少区域推断:`); 
                                this.log(`至少区域: ${smallerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                                this.log(`至少雷数: ${smallerRegion.minMines}`);
                                this.log(`大区域: ${largerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                                this.log(`大区域雷数: ${largeCount}`);
                                this.log(`差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                                this.log(`推断原因: 大区域雷数(${largeCount}) = 至少区域雷数(${smallerRegion.minMines})`);
                                this.log(`结论: 由于大区域包含至少区域，且雷数相等，所以差集格子一定不是雷`);
                                
                                return {
                                    row: diffNodes[0].row,
                                    col: diffNodes[0].col,
                                    action: 'reveal',
                                    isGuess: false
                                };
                            }

                            // 新增：如果大区域的雷数小于至少区域的最小雷数，差集也一定没有雷
                            if (largeCount < smallerRegion.minMines && diffNodes.length > 0) {
                                this.log(`\n发现至少区域推断:`);
                                this.log(`至少区域: ${smallerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                                this.log(`至少雷数: ${smallerRegion.minMines}`);
                                this.log(`大区域: ${largerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                                this.log(`大区域雷数: ${largeCount}`);
                                this.log(`差集格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                                this.log(`推断原因: 大区域雷数(${largeCount}) < 至少区域雷数(${smallerRegion.minMines})`);
                                this.log(`结论: 由于大区域包含至少区域，但雷数更少，所以差集格子一定不是雷`);
                                
                                return {
                                    row: diffNodes[0].row,
                                    col: diffNodes[0].col,
                                    action: 'reveal',
                                    isGuess: false
                                };
                            }
                        }
                    }
                }
            }
        }
        this.log('\n无雷推断结束：未找到可以确定的无雷格子');
        return null;
    }

    analyzeHasMineRegions(centersList) {
        for (const [centerKey, data] of centersList) {
            this.log(`\n分析中心节点 (${data.center.row}, ${data.center.col}) 值: ${data.center.value}`);
            const regions = Array.from(data.regions);
            
            for (let i = 0; i < regions.length; i++) {
                for (let j = i + 1; j < regions.length; j++) {
                    const region1 = regions[i];
                    const region2 = regions[j];
                    
                    this.log(`\n比较两个区域:`);
                    this.log(`区域1: ${region1.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(region1.counts)[0]}`);
                    this.log(`区域2: ${region2.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 雷数: ${Array.from(region2.counts)[0]}`);
                    
                    // 检查两个区域的包含关系（双向检查）
                    let smallerRegion, largerRegion, diffNodes;
                    
                    // 检查region2是否包含region1
                    const is2ContainsRegion1 = region1.nodes.every(node1 => 
                        region2.nodes.some(node2 => 
                            node2.row === node1.row && node2.col === node1.col
                        )
                    );
                    
                    // 检查region1是否包含region2
                    const is1ContainsRegion2 = region2.nodes.every(node2 => 
                        region1.nodes.some(node1 => 
                            node1.row === node1.row && node1.col === node1.col
                        )
                    );
                    
                    if (is2ContainsRegion1) {
                        this.log('发现包含关系: 区域2 包含 区域1');
                        smallerRegion = region1;
                        largerRegion = region2;
                        diffNodes = this.calculateDiffNodes(region2, region1);
                    } else if (is1ContainsRegion2) {
                        this.log('发现包含关系: 区域1 包含 区域2');
                        smallerRegion = region2;
                        largerRegion = region1;
                        diffNodes = this.calculateDiffNodes(region1, region2);
                    } else {
                        this.log('未发现包含关系，继续检查下一对区域');
                        continue;
                    }
                    
                    if (smallerRegion && largerRegion && diffNodes.length > 0) {
                        const smallCount = Array.from(smallerRegion.counts)[0];
                        const largeCount = Array.from(largerRegion.counts)[0];
                        
                        this.log(`\n分析雷数关系:`);
                        this.log(`小区域信息:`);
                        this.log(`- 格子: ${smallerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                        this.log(`- 雷数: ${smallCount}`);
                        this.log(`- 中心节点: ${smallerRegion.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
                        
                        this.log(`\n大区域信息:`);
                        this.log(`- 格子: ${largerRegion.nodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                        this.log(`- 雷数: ${largeCount}`);
                        this.log(`- 中心节点: ${largerRegion.centers.map(c => `(${c.row}, ${c.col})[值=${c.value}]`).join(', ')}`);
                        
                        this.log(`\n差集区域信息:`);
                        this.log(`- 格子: ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')}`);
                        this.log(`- 格子数量: ${diffNodes.length}`);
                        
                        // 找出共用的中心节点
                        const commonCenters = smallerRegion.centers.filter(center1 => 
                            largerRegion.centers.some(center2 => 
                                center1.row === center2.row && center1.col === center2.col
                            )
                        );
                        
                        if (commonCenters.length > 0) {
                            this.log(`\n共用的中心节点:`);
                            commonCenters.forEach(center => {
                                this.log(`- (${center.row}, ${center.col})[值=${center.value}]`);
                            });
                        }
                        
                        // 如果大区域的雷数等于小区域雷数加上差集格子数，差集区域都是雷
                        if (largeCount === smallCount + diffNodes.length) {
                            this.log(`\n推断过程:`);
                            this.log(`1. 大区域雷数(${largeCount}) = 小区域雷数(${smallCount}) + 差集格子数(${diffNodes.length})`);
                            this.log(`2. 大区域包含小区域的所有格子，且额外包含差集格子`);
                            this.log(`3. 由于雷数差值(${largeCount - smallCount})正好等于差集格子数(${diffNodes.length})`);
                            this.log(`4. 结论: 差集格子 ${diffNodes.map(n => `(${n.row}, ${n.col})`).join(', ')} 一定都是雷`);
                            
                            return {
                                row: diffNodes[0].row,
                                col: diffNodes[0].col,
                                action: 'flag',
                                isGuess: false
                            };
                        }
                        
                        this.log('未找到可以推断的情况，继续检查下一对区域');
                    }
                }
            }
        }
        this.log('\n有雷推断结束：未找到可以确定的雷格子');
        return null;
    }
}